import { notFound } from "next/navigation";
import { buildEcardHtml } from "@/lib/ecard";

export const dynamic = "force-dynamic";

async function getToken(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(
    `${baseUrl}/keepingthem/v1/thank_you_tokens?token=eq.${encodeURIComponent(token)}&select=id,recipient_name,card_type,relation,events,contribution,message,deceased_name,years,family_name,photo_url,signature_url,viewed_at&limit=1`,
    {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Accept-Profile": "keepingthem",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows.length) return null;

  if (!rows[0].viewed_at) {
    await fetch(
      `${baseUrl}/keepingthem/v1/thank_you_tokens?token=eq.${encodeURIComponent(token)}`,
      {
        method: "PATCH",
        headers: {
          "apikey": key,
          "Authorization": `Bearer ${key}`,
          "Accept-Profile": "keepingthem",
          "Content-Profile": "keepingthem",
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ viewed_at: new Date().toISOString() }),
      }
    );
  }

  return rows[0] as {
    id: string;
    recipient_name: string;
    card_type: string;
    relation: string | null;
    events: string | null;
    contribution: string | null;
    message: string;
    deceased_name: string;
    years: string;
    family_name: string;
    photo_url: string | null;
    signature_url: string | null;
    viewed_at: string | null;
  };
}

export default async function ThankYouPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const record = await getToken(token);
  if (!record) notFound();

  const firstName = record.recipient_name.split(" ")[0];

  const html = buildEcardHtml({
    deceasedName: record.deceased_name,
    years: record.years,
    photoUrl: record.photo_url ?? undefined,
    recipientFirstName: firstName,
    recipientFullName: record.recipient_name,
    relation: record.relation ?? undefined,
    events: record.events ?? undefined,
    message: record.message,
    familyName: record.family_name,
    signatureUrl: record.signature_url ?? undefined,
    contributionNote: record.contribution ?? undefined,
  });

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>A message for you</title>
      </head>
      <body
        style={{ margin: 0, padding: 0 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </html>
  );
}
