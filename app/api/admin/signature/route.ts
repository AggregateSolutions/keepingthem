import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });
}

async function removeBackground(buffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = new Uint8Array(data);

  const sampleCorner = (x: number, y: number) => {
    const i = (y * width + x) * channels;
    return { r: pixels[i], g: pixels[i + 1], b: pixels[i + 2] };
  };
  const corners = [
    sampleCorner(0, 0),
    sampleCorner(width - 1, 0),
    sampleCorner(0, height - 1),
    sampleCorner(width - 1, height - 1),
  ];
  const bgR = Math.round(corners.reduce((s, c) => s + c.r, 0) / 4);
  const bgG = Math.round(corners.reduce((s, c) => s + c.g, 0) / 4);
  const bgB = Math.round(corners.reduce((s, c) => s + c.b, 0) / 4);

  const threshold = 40;
  for (let i = 0; i < pixels.length; i += channels) {
    const dr = Math.abs(pixels[i] - bgR);
    const dg = Math.abs(pixels[i + 1] - bgG);
    const db = Math.abs(pixels[i + 2] - bgB);
    if (dr < threshold && dg < threshold && db < threshold) {
      pixels[i + 3] = 0;
    }
  }

  return sharp(Buffer.from(pixels), { raw: { width, height, channels } })
    .png()
    .toBuffer();
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const slug = formData.get("slug") as string | null;

  if (!file || !slug) {
    return NextResponse.json({ error: "file and slug are required" }, { status: 400 });
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());

  const isCanvasUpload = file.name === "signature.png" && file.type === "image/png";
  let processedBuffer: Buffer;
  try {
    processedBuffer = isCanvasUpload ? rawBuffer : await removeBackground(rawBuffer);
  } catch (err) {
    console.error("[signature] background removal failed:", err);
    return NextResponse.json({ error: `Image processing failed: ${err}` }, { status: 500 });
  }

  const key = `${slug}/signature.png`;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET!;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

  try {
    const r2 = getR2Client();
    await r2.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: processedBuffer,
      ContentType: "image/png",
    }));
  } catch (err) {
    console.error("[signature] R2 upload failed:", err);
    return NextResponse.json({ error: `Upload failed: ${err}` }, { status: 500 });
  }

  return NextResponse.json({ url: `${publicUrl}/${key}` });
}
