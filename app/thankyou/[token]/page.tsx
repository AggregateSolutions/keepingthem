import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getToken(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(
    `${baseUrl}/keepingthem/v1/thank_you_tokens?token=eq.${encodeURIComponent(token)}&select=id,ecard_html,recipient_name,viewed_at&limit=1`,
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

  // Mark as viewed if first time
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

  return rows[0] as { id: string; ecard_html: string; recipient_name: string; viewed_at: string | null };
}

export default async function ThankYouPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const record = await getToken(token);
  if (!record) notFound();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>A message for you</title>
      </head>
      <body
        style={{ margin: 0, padding: 0 }}
        dangerouslySetInnerHTML={{ __html: record.ecard_html }}
      />
    </html>
  );
}
