import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { buildEcardHtml } from "@/lib/ecard";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

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

type Rsvp = {
  name: string;
  email: string | null;
  relation: string | null;
  attend_funeral: boolean;
  attend_reception: boolean;
  attend_thanksgiving: boolean;
};

type Donor = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  note: string | null;
};

type LogEntry = {
  recipient_email: string | null;
  recipient_name: string;
  sent_at: string;
  card_type: string;
};

export type MergedRecipient = {
  name: string;
  email: string | null;
  relation?: string;
  events?: string;
  contribution?: string;
  cardType: "attendance" | "donor" | "combined";
  alreadySent?: { sent_at: string; card_type: string };
  // name-only match — needs admin confirmation
  ambiguous?: boolean;
  ambiguousMatch?: { rsvpName: string; donorName: string };
};

function buildRecipientList(rsvps: Rsvp[], donors: Donor[], log: LogEntry[]): MergedRecipient[] {
  const recipients: MergedRecipient[] = [];
  const usedDonorIds = new Set<string>();

  // Index log by email (lowercased) for fast lookup
  const logByEmail = new Map<string, LogEntry>();
  for (const entry of log) {
    if (entry.recipient_email) logByEmail.set(entry.recipient_email.toLowerCase(), entry);
  }

  // Index donors by email for merge
  const donorByEmail = new Map<string, Donor>();
  const donorByName = new Map<string, Donor>();
  for (const d of donors) {
    if (d.email) donorByEmail.set(d.email.toLowerCase(), d);
    donorByName.set(d.name.toLowerCase().trim(), d);
  }

  // Process RSVPs
  for (const r of rsvps) {
    if (!r.email) continue;
    const emailKey = r.email.toLowerCase();
    const events = [
      r.attend_funeral && "the funeral service",
      r.attend_reception && "the reception",
      r.attend_thanksgiving && "the thanksgiving celebration",
    ].filter(Boolean).join(", ");

    const matchedDonor = donorByEmail.get(emailKey);
    let cardType: MergedRecipient["cardType"] = "attendance";
    let contribution: string | undefined;
    let ambiguous = false;
    let ambiguousMatch: MergedRecipient["ambiguousMatch"];

    if (matchedDonor) {
      // Confident email match — combine
      cardType = "combined";
      contribution = matchedDonor.note ?? undefined;
      usedDonorIds.add(matchedDonor.id);
    } else {
      // Check for name-only match (ambiguous)
      const nameMatch = donorByName.get(r.name.toLowerCase().trim());
      if (nameMatch && !nameMatch.email) {
        ambiguous = true;
        ambiguousMatch = { rsvpName: r.name, donorName: nameMatch.name };
        usedDonorIds.add(nameMatch.id);
      }
    }

    recipients.push({
      name: r.name,
      email: r.email,
      relation: r.relation ?? undefined,
      events: events || undefined,
      contribution,
      cardType,
      ambiguous,
      ambiguousMatch,
      alreadySent: logByEmail.get(emailKey),
    });
  }

  // Process remaining donors not already merged
  for (const d of donors) {
    if (usedDonorIds.has(d.id)) continue;
    const emailKey = d.email?.toLowerCase();
    recipients.push({
      name: d.name,
      email: d.email,
      contribution: d.note ?? undefined,
      cardType: "donor",
      alreadySent: emailKey ? logByEmail.get(emailKey) : undefined,
    });
  }

  return recipients;
}

// GET — fetch RSVPs, donors, tributes, log for preview/planning
export async function GET(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const [rsvpRes, tributeRes, donorRes, logRes] = await Promise.all([
    fetch(ktUrl(`rsvps?memorial_slug=eq.${encodeURIComponent(slug)}&order=created_at.desc`), { headers: ktHeaders() }),
    fetch(ktUrl(`rsvps?memorial_slug=eq.${encodeURIComponent(slug)}&message=not.is.null&message=neq.&select=id,name,email,relation,message,created_at`), { headers: ktHeaders() }),
    fetch(ktUrl(`donors?memorial_slug=eq.${encodeURIComponent(slug)}&order=created_at.asc`), { headers: ktHeaders() }),
    fetch(ktUrl(`thank_you_log?memorial_slug=eq.${encodeURIComponent(slug)}&order=sent_at.desc`), { headers: ktHeaders() }),
  ]);

  const rsvps: Rsvp[] = rsvpRes.ok ? await rsvpRes.json() : [];
  const tributes = tributeRes.ok ? await tributeRes.json() : [];
  const donors: Donor[] = donorRes.ok ? await donorRes.json() : [];
  const log: LogEntry[] = logRes.ok ? await logRes.json() : [];

  const merged = buildRecipientList(
    rsvps.filter(r => r.email),
    donors,
    log
  );

  return NextResponse.json({ rsvps, tributes, donors, log, merged });
}

// POST — send cards
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
    includeTributes,
    skipAlreadySent,
    recipientEmails, // optional — if set, only send to these emails
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
    includeTributes?: boolean;
    skipAlreadySent?: boolean;
    recipientEmails?: string[];
  } = await req.json();

  if (!slug || !message) {
    return NextResponse.json({ error: "slug and message are required" }, { status: 400 });
  }

  const [rsvpRes, donorRes, logRes] = await Promise.all([
    fetch(ktUrl(`rsvps?memorial_slug=eq.${encodeURIComponent(slug)}&email=not.is.null&email=neq.&select=name,email,relation,attend_funeral,attend_reception,attend_thanksgiving`), { headers: ktHeaders() }),
    fetch(ktUrl(`donors?memorial_slug=eq.${encodeURIComponent(slug)}`), { headers: ktHeaders() }),
    fetch(ktUrl(`thank_you_log?memorial_slug=eq.${encodeURIComponent(slug)}`), { headers: ktHeaders() }),
  ]);

  const rsvps: Rsvp[] = rsvpRes.ok ? await rsvpRes.json() : [];
  const donors: Donor[] = donorRes.ok ? await donorRes.json() : [];
  const log: LogEntry[] = logRes.ok ? await logRes.json() : [];

  let recipients = buildRecipientList(rsvps, donors, log);

  // Optionally include tribute wall contributors
  if (includeTributes) {
    const tributeRes = await fetch(
      ktUrl(`rsvps?memorial_slug=eq.${encodeURIComponent(slug)}&email=not.is.null&email=neq.&message=not.is.null&message=neq.&select=name,email,relation,attend_funeral,attend_reception,attend_thanksgiving`),
      { headers: ktHeaders() }
    );
    if (tributeRes.ok) {
      const tributes: Rsvp[] = await tributeRes.json();
      const existingEmails = new Set(recipients.map(r => r.email?.toLowerCase()).filter(Boolean));
      for (const t of tributes) {
        if (t.email && !existingEmails.has(t.email.toLowerCase())) {
          recipients.push({ name: t.name, email: t.email, relation: t.relation ?? undefined, cardType: "attendance" });
          existingEmails.add(t.email.toLowerCase());
        }
      }
    }
  }

  // Filter to specific emails if requested
  if (recipientEmails?.length) {
    const targetSet = new Set(recipientEmails.map(e => e.toLowerCase()));
    recipients = recipients.filter(r => r.email && targetSet.has(r.email.toLowerCase()));
  }

  // Skip already-sent if requested
  if (skipAlreadySent) {
    recipients = recipients.filter(r => !r.alreadySent);
  }

  // Skip ambiguous — don't auto-send to name-only conflicts
  recipients = recipients.filter(r => !r.ambiguous);

  // Skip recipients with no email
  recipients = recipients.filter(r => r.email);

  let sent = 0;
  let failed = 0;
  const failures: string[] = [];
  const logEntries: object[] = [];

  for (const recipient of recipients) {
    const firstName = recipient.name.split(" ")[0];

    // Pick the right message template
    const templateMessage =
      recipient.cardType === "combined" && combinedMessage ? combinedMessage :
      recipient.cardType === "donor" && donorMessage ? donorMessage :
      message;

    const subject =
      recipient.cardType === "combined"
        ? `Thank you for your presence and generosity — ${deceasedName}`
        : recipient.cardType === "donor"
        ? `Thank you for your generous gift — ${deceasedName}`
        : `A message from the family of ${deceasedName}`;

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

    const { error: sendError } = await getResend().emails.send({
      from: "keepingthem.net <noreply@droptools.net>",
      to: recipient.email!,
      subject,
      html,
    });

    if (sendError) {
      failed++;
      failures.push(recipient.email!);
    } else {
      sent++;
      logEntries.push({
        memorial_slug: slug,
        recipient_name: recipient.name,
        recipient_email: recipient.email,
        card_type: recipient.cardType,
        subject,
      });
    }
  }

  // Write log entries
  if (logEntries.length > 0) {
    await fetch(ktUrl("thank_you_log"), {
      method: "POST",
      headers: { ...ktHeaders(true), "Prefer": "return=minimal" },
      body: JSON.stringify(logEntries),
    });
  }

  return NextResponse.json({ sent, failed, failures });
}
