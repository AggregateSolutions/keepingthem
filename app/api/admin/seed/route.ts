import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { upsertMemorial } from "@/lib/memorialDb";
import akanMemorials from "@/data/akan";

async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

export async function POST() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { slug: string; ok: boolean; error?: string }[] = [];

  for (const m of akanMemorials) {
    const { error } = await upsertMemorial(m);
    results.push({ slug: m.slug, ok: !error, error: error ?? undefined });
  }

  return NextResponse.json({ results });
}
