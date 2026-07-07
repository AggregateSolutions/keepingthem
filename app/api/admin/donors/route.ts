import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

function ktUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/keepingthem/v1/${path}`;
}

function ktHeaders(json = false) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Accept-Profile": "keepingthem",
    "Content-Profile": "keepingthem",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

// GET — list donors for a memorial
export async function GET(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const res = await fetch(
    ktUrl(`donors?memorial_slug=eq.${encodeURIComponent(slug)}&order=created_at.asc`),
    { headers: ktHeaders() }
  );
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  return NextResponse.json({ donors: await res.json() });
}

// POST — add a donor
export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { memorial_slug, name, email, phone, note } = body;
  if (!memorial_slug || !name) {
    return NextResponse.json({ error: "memorial_slug and name are required" }, { status: 400 });
  }

  const res = await fetch(ktUrl("donors"), {
    method: "POST",
    headers: { ...ktHeaders(true), "Prefer": "return=representation" },
    body: JSON.stringify({ memorial_slug, name, email: email || null, phone: phone || null, note: note || null }),
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  const rows = await res.json();
  return NextResponse.json({ donor: rows[0] });
}

// DELETE — remove a donor by id
export async function DELETE(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const res = await fetch(
    ktUrl(`donors?id=eq.${encodeURIComponent(id)}`),
    { method: "DELETE", headers: ktHeaders() }
  );
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH — update a donor
export async function PATCH(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();
  const res = await fetch(ktUrl(`donors?id=eq.${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { ...ktHeaders(true), "Prefer": "return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  const rows = await res.json();
  return NextResponse.json({ donor: rows[0] });
}
