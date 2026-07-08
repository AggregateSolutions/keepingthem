import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { buildEcardHtml } from "@/lib/ecard";
import { ktUrl, ktHeaders, buildRecipientList, buildEventsList } from "@/lib/thankyou";
import type { Rsvp, Donor, LogEntry, MergedRecipient } from "@/lib/thankyou";

export type { MergedRecipient };

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
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

  const merged = buildRecipientList(rsvps.filter(r => r.email), donors, log);

  return NextResponse.json({ rsvps, tributes, donors, log, merged });
}

// POST — send email cards
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
    recipientEmails,
    isTest,
    testRecipientName,
    testRecipientRelation,
    testRecipientEvents,
    testRecipientContribution,
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
    isTest?: boolean;
    testRecipientName?: string;
    testRecipientRelation?: string;
    testRecipientEvents?: string;
    testRecipientContribution?: string;
  } = await req.json();

  if (!slug || !message) {
    return NextResponse.json({ error: "slug and message are required" }, { status: 400 });
  }

  const safePhotoUrl = photoUrl?.startsWith("https://keepingthem.net/") ? photoUrl : undefined;

  // Test send — fire directly to provided email using real recipient data, no log write
  if (isTest && recipientEmails?.length === 1) {
    const testAddr = recipientEmails[0];
    const recipientName = testRecipientName ?? "Friend";
    const html = buildEcardHtml({
      deceasedName, years: years ?? "",
      photoUrl: safePhotoUrl, familyName: familyName ?? "the",
      signatureUrl,
      contributionNote: testRecipientContribution ?? contributionNote,
      recipientFirstName: recipientName.split(" ")[0],
      recipientFullName: recipientName,
      relation: testRecipientRelation,
      events: testRecipientEvents,
      message,
    });
    const subject = `[TEST] A message from the family of ${deceasedName}`;
    const { error: sendError } = await getResend().emails.send({
      from: "keepingthem.net <noreply@droptools.net>",
      to: testAddr,
      subject,
      html,
    });
    return NextResponse.json(sendError
      ? { sent: 0, failed: 1, failures: [testAddr] }
      : { sent: 1, failed: 0, failures: [] }
    );
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

  if (recipientEmails?.length) {
    const targetSet = new Set(recipientEmails.map(e => e.toLowerCase()));
    recipients = recipients.filter(r => r.email && targetSet.has(r.email.toLowerCase()));
  }

  if (skipAlreadySent) recipients = recipients.filter(r => !r.alreadySent);
  recipients = recipients.filter(r => !r.ambiguous && r.email);

  let sent = 0;
  let failed = 0;
  const failures: string[] = [];
  const logEntries: object[] = [];

  for (const recipient of recipients) {
    const firstName = recipient.name.split(" ")[0];

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
      photoUrl: safePhotoUrl,
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

  if (logEntries.length > 0 && !isTest) {
    await fetch(ktUrl("thank_you_log"), {
      method: "POST",
      headers: { ...ktHeaders(true), "Prefer": "return=minimal" },
      body: JSON.stringify(logEntries),
    });
  }

  return NextResponse.json({ sent, failed, failures });
}

// Re-export buildEventsList for routes that need it
export { buildEventsList };
