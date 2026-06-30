import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { upsertMemorial } from "@/lib/memorialDb";
import type { MemorialConfig } from "@/types/memorial";

async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let config: MemorialConfig;
  try {
    config = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!config.slug || !config.name) {
    return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
  }

  const { error } = await upsertMemorial(config);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
