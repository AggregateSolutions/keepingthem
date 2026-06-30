"use client";

import { useEffect, useState } from "react";

const GOLD = "#c8962e";
const BORDER = "#4a3820";
const BG = "#1a1208";
const CARD = "#241a0a";
const TEXT = "#f5ead8";
const MUTED = "#9a7a52";
const DIM = "#7a6a52";

type Rsvp = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  guests: string;
  relation: string | null;
  attend_funeral: boolean;
  attend_reception: boolean;
  attend_thanksgiving: boolean;
  message: string | null;
  created_at: string;
};

const DEFAULT_MESSAGE = `Dear {name},

On behalf of our family, we want to express our deepest gratitude for your love, your presence, and your support during this time. Your being there meant more than words can say.

We are comforted knowing that so many hearts carry the memory of our beloved with us.

With love and gratitude,
The Family`;

export default function RsvpManager({ slug, deceasedName }: { slug: string; deceasedName: string }) {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; failures: string[] } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [tab, setTab] = useState<"rsvps" | "thankyou">("rsvps");

  useEffect(() => {
    fetch(`/api/admin/send-thankyou?slug=${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setRsvps(d.rsvps);
      })
      .catch(() => setError("Failed to load RSVPs"))
      .finally(() => setLoading(false));
  }, [slug]);

  const withEmail = rsvps.filter(r => r.email);
  const withPhone = rsvps.filter(r => r.phone);
  const totalGuests = rsvps.reduce((sum, r) => sum + (parseInt(r.guests) || 1), 0);

  async function handleSend() {
    if (!confirmed) { setConfirmed(true); return; }
    setSending(true);
    setResult(null);

    const res = await fetch("/api/admin/send-thankyou", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, message, deceasedName }),
    });

    const data = await res.json();
    setSending(false);
    setConfirmed(false);

    if (!res.ok) {
      setError(data.error ?? "Send failed");
      return;
    }
    setResult(data);
  }

  const events = (r: Rsvp) => [
    r.attend_funeral && "Funeral",
    r.attend_reception && "Reception",
    r.attend_thanksgiving && "Thanksgiving",
  ].filter(Boolean).join(" · ") || "—";

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total RSVPs", value: rsvps.length },
          { label: "Total guests", value: totalGuests },
          { label: "Have email", value: withEmail.length },
          { label: "Have phone", value: withPhone.length },
        ].map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: "1.4rem", fontFamily: "Garamond, Georgia, serif", color: GOLD }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: DIM, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: `1px solid ${BORDER}`, marginBottom: "1.25rem" }}>
        {(["rsvps", "thankyou"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? CARD : "none",
            border: `1px solid ${tab === t ? BORDER : "transparent"}`,
            borderBottom: tab === t ? `1px solid ${CARD}` : "none",
            borderRadius: "4px 4px 0 0",
            color: tab === t ? GOLD : DIM,
            padding: "0.5rem 1rem", fontSize: "0.82rem", cursor: "pointer",
            marginBottom: tab === t ? "-1px" : "0",
          }}>
            {t === "rsvps" ? `RSVPs (${rsvps.length})` : "Send thank-you"}
          </button>
        ))}
      </div>

      {/* RSVP list */}
      {tab === "rsvps" && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem" }}>Loading…</div>
          ) : error ? (
            <div style={{ padding: "1.5rem", color: "#d68f8f", fontSize: "0.85rem" }}>{error}</div>
          ) : rsvps.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic" }}>No RSVPs yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Name", "Email", "Phone", "Guests", "Relation", "Events", "Message", "Date"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rsvps.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < rsvps.length - 1 ? `1px solid ${BORDER}` : "none", background: i % 2 === 0 ? "transparent" : "#1e1408" }}>
                    <td style={{ padding: "0.6rem 0.75rem", color: TEXT, fontWeight: 500 }}>{r.name}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{r.email ?? <span style={{ color: DIM }}>—</span>}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{r.phone ?? <span style={{ color: DIM }}>—</span>}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: MUTED, textAlign: "center" }}>{r.guests}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{r.relation ?? "—"}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{events(r)}</td>
                    <td style={{ padding: "0.6rem 0.75rem", color: DIM, fontStyle: "italic", maxWidth: "180px" }}>
                      {r.message ? `"${r.message.slice(0, 60)}${r.message.length > 60 ? "…" : ""}"` : <span style={{ color: DIM }}>—</span>}
                    </td>
                    <td style={{ padding: "0.6rem 0.75rem", color: DIM, whiteSpace: "nowrap" }}>
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Thank-you sender */}
      {tab === "thankyou" && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <div style={{ fontSize: "0.82rem", color: MUTED, background: BG, border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "0.75rem 1rem", lineHeight: 1.7 }}>
            This will send a personalized email to <strong style={{ color: GOLD }}>{withEmail.length} recipient{withEmail.length !== 1 ? "s" : ""}</strong> who provided an email address.
            Use <code style={{ color: GOLD, fontSize: "0.78rem" }}>{"{name}"}</code> for first name,{" "}
            <code style={{ color: GOLD, fontSize: "0.78rem" }}>{"{fullname}"}</code> for full name,{" "}
            <code style={{ color: GOLD, fontSize: "0.78rem" }}>{"{events}"}</code> for events they attended.
          </div>

          <div>
            <label style={{ fontSize: "0.72rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={e => { setMessage(e.target.value); setConfirmed(false); setResult(null); }}
              style={{
                width: "100%", minHeight: "280px", padding: "0.75rem", background: BG,
                border: `1px solid ${BORDER}`, borderRadius: "4px", color: TEXT,
                fontSize: "0.9rem", lineHeight: 1.75, resize: "vertical",
                fontFamily: "Garamond, Georgia, serif", boxSizing: "border-box",
              }}
            />
          </div>

          {result && (
            <div style={{
              background: result.failed > 0 ? "#1f1208" : "#0d1f0d",
              border: `1px solid ${result.failed > 0 ? "#4a2a0a" : "#1a4a1a"}`,
              borderRadius: "4px", padding: "0.75rem 1rem", fontSize: "0.85rem",
              color: result.failed > 0 ? "#d4a86a" : "#6aaa6a",
            }}>
              ✓ Sent to {result.sent} recipient{result.sent !== 1 ? "s" : ""}.
              {result.failed > 0 && ` ${result.failed} failed: ${result.failures.join(", ")}`}
            </div>
          )}

          {confirmed && !sending && (
            <div style={{ fontSize: "0.82rem", color: "#d4a86a", background: "#1f1208", border: "1px solid #4a2a0a", borderRadius: "4px", padding: "0.75rem 1rem" }}>
              Click again to confirm — this will send to {withEmail.length} email address{withEmail.length !== 1 ? "es" : ""}.
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || withEmail.length === 0}
            style={{
              background: confirmed ? "#8b4a0a" : GOLD,
              color: "#0e0b07", border: "none", borderRadius: "4px",
              padding: "0.65rem 2rem", fontSize: "0.9rem", fontWeight: 600,
              cursor: sending || withEmail.length === 0 ? "not-allowed" : "pointer",
              alignSelf: "flex-start", letterSpacing: "0.04em",
              opacity: withEmail.length === 0 ? 0.5 : 1,
            }}
          >
            {sending ? "Sending…" : confirmed ? `Confirm — send to ${withEmail.length} people` : "Send thank-you emails"}
          </button>
        </div>
      )}
    </div>
  );
}
