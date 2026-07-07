import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import twilio from "twilio";
import { buildEcardHtml } from "@/lib/ecard";
import { randomBytes } from "crypto";

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

function getTwilio() {
  return twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
}

function generateToken() {
  return randomBytes(16).toString("hex");
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    slug,
    message,
    donorMessage,
    combinedMessage,
    deceasedName,
    years,
    photoUrl,
    familyName,
    signatureUrl,
    contributionNote,
    siteUrl,
  }: {
    slug: string;
    message: string;
    donorMessage?: string;
    combinedMessage?: string;
    deceasedName: string;
    years?: string;
    photoUrl?: string;
    familyName?: string;
    signatureUrl?: string;
    contributionNote?: string;
    siteUrl: string;
  } = await req.json();

  if (!slug || !message) {
    return NextResponse.json({ error: "slug and message are required" }, { status: 400 });
  }

  // Fetch RSVPs with phone but no email (email recipients handled separately)
  const [rsvpRes, donorRes, logRes] = await Promise.all([
    fetch(ktUrl(`rsvps?memorial_slug=eq.${encodeURIComponent(slug)}&phone=not.is.null&phone=neq.&select=name,email,phone,relation,attend_funeral,attend_reception,attend_thanksgiving`), { headers: ktHeaders() }),
    fetch(ktUrl(`donors?memorial_slug=eq.${encodeURIComponent(slug)}&phone=not.is.null&phone=neq.`), { headers: ktHeaders() }),
    fetch(ktUrl(`thank_you_log?memorial_slug=eq.${encodeURIComponent(slug)}`), { headers: ktHeaders() }),
  ]);

  const rsvps: Array<{ name: string; email: string | null; phone: string; relation: string | null; attend_funeral: boolean; attend_reception: boolean; attend_thanksgiving: boolean }> = rsvpRes.ok ? await rsvpRes.json() : [];
  const donors: Array<{ id: string; name: string; email: string | null; phone: string; note: string | null }> = donorRes.ok ? await donorRes.json() : [];
  const log: Array<{ recipient_phone?: string; sent_at: string }> = logRes.ok ? await logRes.json() : [];

  const sentPhones = new Set(log.map(l => l.recipient_phone).filter(Boolean));

  type SmsRecipient = {
    name: string;
    phone: string;
    relation?: string;
    events?: string;
    contribution?: string;
    cardType: "attendance" | "donor" | "combined";
  };

  const recipients: SmsRecipient[] = [];
  const usedPhones = new Set<string>();

  // Build donor phone index
  const donorByPhone = new Map(donors.map(d => [d.phone, d]));

  for (const r of rsvps) {
    const events = [
      r.attend_funeral && "the funeral service",
      r.attend_reception && "the reception",
      r.attend_thanksgiving && "the thanksgiving celebration",
    ].filter(Boolean).join(", ");

    const donorMatch = donorByPhone.get(r.phone);
    const cardType = donorMatch ? "combined" : "attendance";

    recipients.push({
      name: r.name,
      phone: r.phone,
      relation: r.relation ?? undefined,
      events: events || undefined,
      contribution: donorMatch?.note ?? undefined,
      cardType,
    });
    usedPhones.add(r.phone);
  }

  // Add remaining donors not already in RSVPs
  for (const d of donors) {
    if (usedPhones.has(d.phone)) continue;
    recipients.push({
      name: d.name,
      phone: d.phone,
      contribution: d.note ?? undefined,
      cardType: "donor",
    });
  }

  let sent = 0;
  let failed = 0;
  const failures: string[] = [];
  const logEntries: object[] = [];
  const tokenEntries: object[] = [];

  for (const recipient of recipients) {
    if (sentPhones.has(recipient.phone)) continue;

    const firstName = recipient.name.split(" ")[0];
    const templateMessage =
      recipient.cardType === "combined" && combinedMessage ? combinedMessage :
      recipient.cardType === "donor" && donorMessage ? donorMessage :
      message;

    const html = buildEcardHtml({
      deceasedName,
      years: years ?? "",
      photoUrl,
      recipientFirstName: firstName,
      recipientFullName: recipient.name,
      relation: recipient.relation,
      events: recipient.events,
      message: templateMessage,
      familyName: familyName ?? "the",
      signatureUrl,
      contributionNote: recipient.contribution ?? contributionNote,
    });

    const token = generateToken();
    const cardUrl = `${siteUrl}/thankyou/${token}`;

    const smsBody = `${familyName ? `The ${familyName} family` : "The family"} has sent you a personal thank-you message. View it here: ${cardUrl}`;

    try {
      await getTwilio().messages.create({
        body: smsBody,
        from: process.env.TWILIO_FROM_NUMBER!,
        to: recipient.phone,
      });

      sent++;
      tokenEntries.push({
        token,
        memorial_slug: slug,
        recipient_name: recipient.name,
        recipient_phone: recipient.phone,
        card_type: recipient.cardType,
        ecard_html: html,
      });
      logEntries.push({
        memorial_slug: slug,
        recipient_name: recipient.name,
        recipient_email: null,
        recipient_phone: recipient.phone,
        card_type: recipient.cardType,
        subject: "SMS thank-you",
      });
    } catch {
      failed++;
      failures.push(recipient.phone);
    }
  }

  // Write tokens
  if (tokenEntries.length > 0) {
    await fetch(ktUrl("thank_you_tokens"), {
      method: "POST",
      headers: { ...ktHeaders(true), "Prefer": "return=minimal" },
      body: JSON.stringify(tokenEntries),
    });
  }

  // Write log
  if (logEntries.length > 0) {
    await fetch(ktUrl("thank_you_log"), {
      method: "POST",
      headers: { ...ktHeaders(true), "Prefer": "return=minimal" },
      body: JSON.stringify(logEntries),
    });
  }

  return NextResponse.json({ sent, failed, failures });
}

// GET — preview SMS recipients (phone-only, not already sent by email)
export async function GET(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const [rsvpRes, donorRes] = await Promise.all([
    fetch(ktUrl(`rsvps?memorial_slug=eq.${encodeURIComponent(slug)}&phone=not.is.null&phone=neq.&select=name,email,phone,relation`), { headers: ktHeaders() }),
    fetch(ktUrl(`donors?memorial_slug=eq.${encodeURIComponent(slug)}&phone=not.is.null&phone=neq.&select=name,email,phone,note`), { headers: ktHeaders() }),
  ]);

  const rsvps = rsvpRes.ok ? await rsvpRes.json() : [];
  const donors = donorRes.ok ? await donorRes.json() : [];

  return NextResponse.json({ rsvps, donors });
}
