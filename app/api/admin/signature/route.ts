import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
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

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${slug}/signature.${ext}`;

  const uploadRes = await fetch(
    `${baseUrl}/storage/v1/object/signatures/${path}`,
    {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: await file.arrayBuffer(),
    }
  );

  if (!uploadRes.ok) {
    const body = await uploadRes.text();
    return NextResponse.json({ error: body }, { status: 500 });
  }

  const publicUrl = `${baseUrl}/storage/v1/object/public/signatures/${path}`;
  return NextResponse.json({ url: publicUrl });
}
