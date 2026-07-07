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

// PATCH — update an RSVP by id
export async function PATCH(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();
  const allowed = ["name", "email", "phone", "guests", "relation", "attend_funeral", "attend_reception", "attend_thanksgiving", "message"];
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const res = await fetch(ktUrl(`rsvps?id=eq.${encodeURIComponent(id)}`), {
    method: "PATCH",
    headers: { ...ktHeaders(true), "Prefer": "return=representation" },
    body: JSON.stringify(update),
  });

  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
  const rows = await res.json();
  return NextResponse.json({ rsvp: rows[0] });
}
