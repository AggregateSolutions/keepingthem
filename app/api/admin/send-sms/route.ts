import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import twilio from "twilio";
import { randomBytes } from "crypto";
import { ktUrl, ktHeaders, buildRecipientList, buildEventsList } from "@/lib/thankyou";
import type { Rsvp, Donor, LogEntry, TokenRecipientData } from "@/lib/thankyou";

async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
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
    testPhone,
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
    testPhone?: string;
  } = await req.json();

  if (!slug || !message) {
    return NextResponse.json({ error: "slug and message are required" }, { status: 400 });
  }

  // Test send — fire directly to the given number, no log write, no dedup check
  if (testPhone) {
    const resolvedFamily = familyName ?? deceasedName.split(" ").slice(-1)[0];
    const token = generateToken();
    const cardUrl = `${siteUrl}/thankyou/${token}`;
    const smsBody = `${resolvedFamily ? `The ${resolvedFamily} family` : "The family"} has sent you a personal thank-you message. View it here: ${cardUrl}`;

    try {
      await getTwilio().messages.create({ body: smsBody, from: process.env.TWILIO_FROM_NUMBER!, to: testPhone });
      await fetch(ktUrl("thank_you_tokens"), {
        method: "POST",
        headers: { ...ktHeaders(true), "Prefer": "return=minimal" },
        body: JSON.stringify([{
          token, memorial_slug: slug,
          recipient_name: "Test Recipient", recipient_phone: testPhone,
          card_type: "attendance",
          relation: null, events: null, contribution: contributionNote ?? null,
          message, deceased_name: deceasedName, years: years ?? "",
          family_name: resolvedFamily, photo_url: photoUrl ?? null, signature_url: signatureUrl ?? null,
        }]),
      });
      return NextResponse.json({ sent: 1, failed: 0, failures: [] });
    } catch {
      return NextResponse.json({ sent: 0, failed: 1, failures: [testPhone] });
    }
  }

  const [rsvpRes, donorRes, logRes] = await Promise.all([
    fetch(ktUrl(`rsvps?memorial_slug=eq.${encodeURIComponent(slug)}&phone=not.is.null&phone=neq.&select=name,email,phone,relation,attend_funeral,attend_reception,attend_thanksgiving`), { headers: ktHeaders() }),
    fetch(ktUrl(`donors?memorial_slug=eq.${encodeURIComponent(slug)}&phone=not.is.null&phone=neq.`), { headers: ktHeaders() }),
    fetch(ktUrl(`thank_you_log?memorial_slug=eq.${encodeURIComponent(slug)}`), { headers: ktHeaders() }),
  ]);

  const rsvps: Rsvp[] = rsvpRes.ok ? await rsvpRes.json() : [];
  const donors: Donor[] = donorRes.ok ? await donorRes.json() : [];
  const log: LogEntry[] = logRes.ok ? await logRes.json() : [];

  const sentPhones = new Set(log.map(l => l.recipient_phone).filter(Boolean));

  // Build phone-based recipient list — RSVPs first, then remaining donors
  type SmsRecipient = {
    name: string;
    phone: string;
    email: string | null;
    relation?: string;
    events?: string;
    contribution?: string;
    cardType: "attendance" | "donor" | "combined";
  };

  const smsRecipients: SmsRecipient[] = [];
  const usedPhones = new Set<string>();
  const donorByPhone = new Map(donors.map(d => [d.phone, d]));

  for (const r of rsvps) {
    if (!r.phone) continue;
    const events = buildEventsList(r);
    const donorMatch = donorByPhone.get(r.phone);
    smsRecipients.push({
      name: r.name,
      phone: r.phone,
      email: r.email,
      relation: r.relation ?? undefined,
      events: events || undefined,
      contribution: donorMatch?.note ?? undefined,
      cardType: donorMatch ? "combined" : "attendance",
    });
    usedPhones.add(r.phone);
  }

  for (const d of donors) {
    if (!d.phone || usedPhones.has(d.phone)) continue;
    smsRecipients.push({
      name: d.name,
      phone: d.phone,
      email: d.email,
      contribution: d.note ?? undefined,
      cardType: "donor",
    });
  }

  let sent = 0;
  let failed = 0;
  const failures: string[] = [];
  const tokenEntries: TokenRecipientData[] = [];
  const tokenMap: { token: string; data: TokenRecipientData }[] = [];
  const logEntries: object[] = [];

  for (const recipient of smsRecipients) {
    if (sentPhones.has(recipient.phone)) continue;

    const templateMessage =
      recipient.cardType === "combined" && combinedMessage ? combinedMessage :
      recipient.cardType === "donor" && donorMessage ? donorMessage :
      message;

    const tokenData: TokenRecipientData = {
      recipient_name: recipient.name,
      recipient_phone: recipient.phone,
      card_type: recipient.cardType,
      relation: recipient.relation ?? null,
      events: recipient.events ?? null,
      contribution: recipient.contribution ?? contributionNote ?? null,
      message: templateMessage,
      deceased_name: deceasedName,
      years: years ?? "",
      family_name: familyName ?? deceasedName.split(" ").slice(-1)[0],
      photo_url: photoUrl ?? null,
      signature_url: signatureUrl ?? null,
    };

    const token = generateToken();
    const cardUrl = `${siteUrl}/thankyou/${token}`;
    const smsBody = `${tokenData.family_name ? `The ${tokenData.family_name} family` : "The family"} has sent you a personal thank-you message. View it here: ${cardUrl}`;

    try {
      await getTwilio().messages.create({
        body: smsBody,
        from: process.env.TWILIO_FROM_NUMBER!,
        to: recipient.phone,
      });

      sent++;
      tokenMap.push({ token, data: tokenData });
      logEntries.push({
        memorial_slug: slug,
        recipient_name: recipient.name,
        recipient_email: recipient.email ?? null,
        recipient_phone: recipient.phone,
        card_type: recipient.cardType,
        subject: "SMS thank-you",
      });
    } catch {
      failed++;
      failures.push(recipient.phone);
    }
  }

  // Write tokens — one row per recipient, data fields only (no pre-rendered HTML)
  if (tokenMap.length > 0) {
    const rows = tokenMap.map(({ token, data }) => ({
      token,
      memorial_slug: slug,
      recipient_name: data.recipient_name,
      recipient_phone: data.recipient_phone,
      card_type: data.card_type,
      relation: data.relation,
      events: data.events,
      contribution: data.contribution,
      message: data.message,
      deceased_name: data.deceased_name,
      years: data.years,
      family_name: data.family_name,
      photo_url: data.photo_url,
      signature_url: data.signature_url,
    }));

    await fetch(ktUrl("thank_you_tokens"), {
      method: "POST",
      headers: { ...ktHeaders(true), "Prefer": "return=minimal" },
      body: JSON.stringify(rows),
    });
  }

  if (logEntries.length > 0) {
    await fetch(ktUrl("thank_you_log"), {
      method: "POST",
      headers: { ...ktHeaders(true), "Prefer": "return=minimal" },
      body: JSON.stringify(logEntries),
    });
  }

  return NextResponse.json({ sent, failed, failures });
}

// GET — preview SMS recipients
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
