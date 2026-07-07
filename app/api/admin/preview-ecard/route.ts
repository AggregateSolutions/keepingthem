import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildEcardHtml } from "@/lib/ecard";

async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    deceasedName,
    years,
    photoUrl,
    message,
    familyName,
    signatureUrl,
    contributionNote,
    recipientName,
    recipientRelation,
    recipientEvents,
  } = await req.json();

  const firstName = recipientName ? recipientName.split(" ")[0] : "Friend";

  const html = buildEcardHtml({
    deceasedName: deceasedName || "Your Loved One",
    years: years || "",
    photoUrl,
    recipientFirstName: firstName,
    recipientFullName: recipientName || "Friend",
    relation: recipientRelation || "friend",
    events: recipientEvents || "the funeral service",
    message: message || "Your message will appear here.",
    familyName: familyName || "the",
    signatureUrl,
    contributionNote,
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
