"use client";

import { useState } from "react";
import type { MemorialConfig } from "@/types/memorial";

interface RsvpEntry {
  name: string;
  email: string;
  guests: string;
  relation: string;
  message: string;
  events: string;
  date: string;
}

export default function RsvpForm({ funeral, thanksgiving }: {
  funeral: MemorialConfig["funeralService"];
  thanksgiving: MemorialConfig["thanksgiving"];
}) {
  const [submitted, setSubmitted] = useState(false);
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", guests: "1", relation: "",
    message: "", funeral: true, thanksgiving: false, sendFlowers: false,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    if (!form.funeral && !form.thanksgiving) {
      alert("Please select at least one event.");
      return;
    }
    const events = [form.funeral && "Funeral service", form.thanksgiving && "Thanksgiving"]
      .filter(Boolean).join(" & ");
    const entry: RsvpEntry = {
      name: form.name, email: form.email, guests: form.guests,
      relation: form.relation, message: form.message, events,
      date: new Date().toLocaleDateString(),
    };
    setRsvps((prev) => [...prev, entry]);
    setSubmitted(true);
  }

  const labelStyle: React.CSSProperties = {
    fontSize: "0.8rem", color: "var(--text-muted)", letterSpacing: "0.04em",
    textTransform: "uppercase", display: "block", marginBottom: "0.3rem",
  };

  if (submitted) {
    return (
      <>
        <div style={{
          background: "#0d1f0d", border: "1px solid #1a4a1a", borderRadius: "6px",
          padding: "1rem 1.25rem", color: "#8fd68f", fontSize: "0.9rem",
        }}>
          Your RSVP has been received. The family is grateful for your presence and your love.{" "}
          <em>Nyame nhyira wo.</em>
        </div>
        <RsvpList rsvps={rsvps} />
      </>
    );
  }

  return (
    <>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        Please let the family know you will be joining them. Your presence is a comfort and an honor.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
          className="form-row">
          <div>
            <label style={labelStyle} htmlFor="rsvp-name">Full name</label>
            <input type="text" id="rsvp-name" placeholder="Your name" autoComplete="name"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label style={labelStyle} htmlFor="rsvp-email">Email address</label>
            <input type="email" id="rsvp-email" placeholder="you@example.com" autoComplete="email"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
          className="form-row">
          <div>
            <label style={labelStyle} htmlFor="rsvp-phone">Phone (optional)</label>
            <input type="tel" id="rsvp-phone" placeholder="+1 (000) 000-0000" autoComplete="tel"
              value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="rsvp-guests">Number of guests</label>
            <select id="rsvp-guests" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}>
              <option value="1">1 — just me</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5+">5 or more</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Attending which events?</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.3rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem", color: "var(--text-mid)", cursor: "pointer", textTransform: "none", letterSpacing: 0 }}>
              <input type="checkbox" checked={form.funeral} onChange={e => setForm(f => ({ ...f, funeral: e.target.checked }))} />
              Funeral service — {funeral.date}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem", color: "var(--text-mid)", cursor: "pointer", textTransform: "none", letterSpacing: 0 }}>
              <input type="checkbox" checked={form.thanksgiving} onChange={e => setForm(f => ({ ...f, thanksgiving: e.target.checked }))} />
              Thanksgiving celebration — {thanksgiving.date}
            </label>
          </div>
        </div>

        <div>
          <label style={labelStyle} htmlFor="rsvp-relation">Relationship to the deceased</label>
          <select id="rsvp-relation" value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}>
            <option value="">Please select</option>
            <option>Immediate family</option>
            <option>Extended family</option>
            <option>Close friend</option>
            <option>Community member</option>
            <option>Colleague</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Additional</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.3rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem", color: "var(--text-mid)", cursor: "pointer", textTransform: "none" as const, letterSpacing: 0 }}>
              <input type="checkbox" checked={form.sendFlowers} onChange={e => setForm(f => ({ ...f, sendFlowers: e.target.checked }))} />
              I plan to send flowers to the funeral home
            </label>
          </div>
          {form.sendFlowers && (
            <div style={{ marginTop: "0.75rem", background: "var(--brown-dark)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.75rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              <div style={{ fontSize: "0.75rem", color: "var(--gold)", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Delivery details</div>
              Please contact one of the florists in the <a href="#flowers" style={{ color: "var(--gold)", textDecoration: "none" }}>Send Flowers</a> section above. Mention the name of the deceased and the service date — the florist will coordinate delivery directly with the funeral home.
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle} htmlFor="rsvp-message">Leave a memory or message (optional)</label>
          <textarea id="rsvp-message" placeholder="Share a memory, a word of comfort, or a tribute…"
            value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
        </div>

        <button type="submit" style={{
          background: "var(--gold)", color: "var(--bg-deep)", border: "none", borderRadius: "4px",
          padding: "0.75rem 2rem", fontFamily: "var(--font-sans)", fontSize: "0.9rem",
          fontWeight: 500, cursor: "pointer", letterSpacing: "0.04em", alignSelf: "flex-start",
        }}>
          Submit RSVP
        </button>
      </form>
      <RsvpList rsvps={rsvps} />
    </>
  );
}

function RsvpList({ rsvps }: { rsvps: RsvpEntry[] }) {
  return (
    <div style={{ marginTop: "2rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", padding: "1rem 1.25rem" }}>
      <div style={{ fontSize: "0.8rem", color: "#7a6a52", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.75rem" }}>
        Responses received
      </div>
      {rsvps.length === 0 ? (
        <div style={{ fontSize: "0.85rem", color: "#7a6a52", fontStyle: "italic" }}>No responses yet.</div>
      ) : (
        rsvps.map((r, i) => (
          <div key={i} style={{ padding: "0.5rem 0", borderBottom: i < rsvps.length - 1 ? "1px solid var(--brown-dark)" : "none", color: "var(--text-muted)" }}>
            <strong style={{ color: "var(--text-mid)" }}>{r.name}</strong>{" "}
            <span style={{ color: "var(--text-faint)" }}>({r.guests} guest{Number(r.guests) > 1 ? "s" : ""} · {r.events})</span>
            {r.message && <div style={{ fontStyle: "italic", fontSize: "0.82rem", color: "#7a6a52", marginTop: 2 }}>"{r.message}"</div>}
          </div>
        ))
      )}
    </div>
  );
}
