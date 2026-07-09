// Shared logic for the thank-you card system — used by both email and SMS send routes.

export function ktUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/keepingthem/v1/${path}`;
}

export function ktHeaders(json = false) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Accept-Profile": "keepingthem",
    "Content-Profile": "keepingthem",
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

export type Rsvp = {
  id?: string;
  name: string;
  email: string | null;
  phone?: string | null;
  relation: string | null;
  attend_funeral: boolean;
  attend_reception: boolean;
  attend_thanksgiving: boolean;
  message?: string | null;
  guests?: string;
  created_at?: string;
};

export type Donor = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  note: string | null;
  amount?: string | null;
  attended: boolean;
  relation: string | null;
  created_at?: string;
};

export type LogEntry = {
  id?: string;
  recipient_email: string | null;
  recipient_phone?: string | null;
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
  ambiguous?: boolean;
  ambiguousMatch?: { rsvpName: string; donorName: string };
};

export function buildEventsList(r: Pick<Rsvp, "attend_funeral" | "attend_reception" | "attend_thanksgiving">): string {
  return [
    r.attend_funeral && "the funeral service",
    r.attend_reception && "the reception",
    r.attend_thanksgiving && "the thanksgiving celebration",
  ].filter(Boolean).join(", ");
}

export function buildRecipientList(rsvps: Rsvp[], donors: Donor[], log: LogEntry[]): MergedRecipient[] {
  const recipients: MergedRecipient[] = [];
  const usedDonorIds = new Set<string>();

  const logByEmail = new Map<string, LogEntry>();
  for (const entry of log) {
    if (entry.recipient_email) logByEmail.set(entry.recipient_email.toLowerCase(), entry);
  }

  const donorByEmail = new Map<string, Donor>();
  const donorByName = new Map<string, Donor>();
  for (const d of donors) {
    if (d.email) donorByEmail.set(d.email.toLowerCase(), d);
    donorByName.set(d.name.toLowerCase().trim(), d);
  }

  for (const r of rsvps) {
    if (!r.email) continue;
    const emailKey = r.email.toLowerCase();
    const events = buildEventsList(r);

    const matchedDonor = donorByEmail.get(emailKey);
    let cardType: MergedRecipient["cardType"] = "attendance";
    let contribution: string | undefined;

    if (matchedDonor) {
      cardType = "combined";
      contribution = matchedDonor.note ?? undefined;
      usedDonorIds.add(matchedDonor.id);
    } else {
      const nameKey = r.name.toLowerCase().trim();
      const nameMatch = donorByName.get(nameKey);
      if (nameMatch) {
        cardType = "combined";
        contribution = nameMatch.note ?? undefined;
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
      alreadySent: logByEmail.get(emailKey),
    });
  }

  for (const d of donors) {
    if (usedDonorIds.has(d.id)) continue;
    const emailKey = d.email?.toLowerCase();
    recipients.push({
      name: d.name,
      email: d.email,
      relation: d.relation ?? undefined,
      events: d.attended ? "the service" : undefined,
      contribution: d.note ?? undefined,
      cardType: d.attended ? "combined" : "donor",
      alreadySent: emailKey ? logByEmail.get(emailKey) : undefined,
    });
  }

  return recipients;
}

// Data stored per token — enough to render the card on demand, no pre-baked HTML.
export type TokenRecipientData = {
  recipient_name: string;
  recipient_phone: string | null;
  card_type: "attendance" | "donor" | "combined";
  // Personalization fields
  relation: string | null;
  events: string | null;
  contribution: string | null;
  // Card template fields — stored so the card is stable even if templates change later
  message: string;
  deceased_name: string;
  years: string;
  family_name: string;
  photo_url: string | null;
  signature_url: string | null;
};
