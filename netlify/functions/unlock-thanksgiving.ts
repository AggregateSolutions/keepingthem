import type { Handler } from "@netlify/functions";

// In-memory rate limit store — resets on function cold start, good enough for this use case
const attempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 3;
const LOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const ip =
    event.headers["x-forwarded-for"]?.split(",")[0].trim() ??
    event.headers["client-ip"] ??
    "unknown";

  // Check rate limit
  const record = attempts.get(ip);
  const now = Date.now();

  if (record && record.lockedUntil > now) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      statusCode: 429,
      body: JSON.stringify({ error: `Too many attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.` }),
    };
  }

  let body: { passphrase?: string; slug?: string };
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request" }) };
  }

  const { passphrase, slug } = body;

  // Verify passphrase
  const correctPassphrase = process.env.THANKSGIVING_PASSPHRASE;
  const location = process.env.THANKSGIVING_LOCATION;

  if (!correctPassphrase || !location) {
    return { statusCode: 500, body: JSON.stringify({ error: "Not configured" }) };
  }

  if (!slug) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request" }) };
  }

  if (!passphrase || passphrase.trim().toLowerCase() !== correctPassphrase.toLowerCase()) {
    // Record failed attempt
    const current = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };
    const newCount = current.count + 1;
    if (newCount >= MAX_ATTEMPTS) {
      attempts.set(ip, { count: newCount, lockedUntil: now + LOCK_DURATION_MS });
    } else {
      attempts.set(ip, { count: newCount, lockedUntil: 0 });
    }

    const remaining = MAX_ATTEMPTS - newCount;
    return {
      statusCode: 401,
      body: JSON.stringify({
        error: remaining > 0
          ? `Incorrect passphrase. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
          : "Too many attempts. Please try again in 1 hour.",
      }),
    };
  }

  // Success — clear rate limit record
  attempts.delete(ip);

  return {
    statusCode: 200,
    body: JSON.stringify({ location }),
  };
};
