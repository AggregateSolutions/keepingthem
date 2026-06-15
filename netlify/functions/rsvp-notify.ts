import type { Handler } from "@netlify/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  // Verify the request is from Supabase via shared secret
  const secret = event.headers["x-webhook-secret"];
  if (!secret || secret !== process.env.RSVP_WEBHOOK_SECRET) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: "Invalid JSON" };
  }

  const record = (payload.record ?? {}) as Record<string, unknown>;

  const recipients = (process.env.RSVP_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { statusCode: 500, body: "No recipients configured" };
  }

  const events = [
    record.attend_funeral && "Funeral service",
    record.attend_reception && "Reception",
    record.attend_thanksgiving && "Thanksgiving",
  ]
    .filter(Boolean)
    .join(", ");

  const subject = `New RSVP — ${record.name ?? "Unknown"} · keepingthem.net`;

  const html = `
    <div style="font-family:sans-serif;max-width:540px;color:#222;">
      <h2 style="margin-bottom:4px;">New RSVP received</h2>
      <p style="color:#666;margin-top:0;font-size:0.9rem;">${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</p>
      <table style="width:100%;border-collapse:collapse;font-size:0.95rem;">
        <tr><td style="padding:6px 0;color:#888;width:140px;">Name</td><td><strong>${record.name ?? "—"}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#888;">Guests</td><td>${record.guests ?? "1"}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Relation</td><td>${record.relation ?? "—"}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Email</td><td>${record.email ?? "—"}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Phone</td><td>${record.phone ?? "—"}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Attending</td><td>${events || "—"}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Flowers</td><td>${record.send_flowers ? "Yes" : "No"}</td></tr>
        ${record.message ? `<tr><td style="padding:6px 0;color:#888;vertical-align:top;">Message</td><td style="font-style:italic;">"${record.message}"</td></tr>` : ""}
      </table>
      <hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0;" />
      <p style="font-size:0.8rem;color:#aaa;">keepingthem.net · memorial: ${record.memorial_slug ?? "—"}</p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "keepingthem.net <noreply@droptools.net>",
    to: recipients,
    subject,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    return { statusCode: 500, body: "Failed to send email" };
  }

  return { statusCode: 200, body: "OK" };
};
