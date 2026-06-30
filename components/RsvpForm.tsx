"use client";

import { useState } from "react";
import type { MemorialConfig } from "@/types/memorial";
import { supabase } from "@/lib/supabase";

interface RsvpEntry {
  name: string;
  email: string;
  guests: string;
  relation: string;
  message: string;
  events: string;
  date: string;
}

function EventRow({
  checked,
  onChange,
  label,
  date,
  time,
  address,
  note,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  date: string;
  time: string;
  address: string;
  note?: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        background: checked ? "#1a1f12" : "var(--bg-card)",
        border: `1px solid ${checked ? "#3a5a1a" : "var(--border)"}`,
        borderRadius: "6px",
        padding: "0.9rem 1rem",
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          onClick={e => e.stopPropagation()}
          style={{ marginTop: 3, flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.95rem", color: "var(--cream)", fontWeight: 500, marginBottom: "0.35rem" }}>
            {label}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
            <span style={{ color: "var(--gold)" }}>{date} · {time}</span>
            <br />
            {address}
          </div>
          {note && (
            <div style={{ fontSize: "0.8rem", color: "var(--text-faint)", marginTop: "0.3rem", fontStyle: "italic" }}>
              {note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RsvpForm({ funeral, thanksgiving, reception, memorialSlug, culture }: {
  funeral: MemorialConfig["funeralService"];
  thanksgiving: MemorialConfig["thanksgiving"];
  reception?: MemorialConfig["reception"];
  memorialSlug: string;
  culture: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", guests: "1", relation: "",
    message: "", funeral: true, thanksgiving: false, reception: false, sendFlowers: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    if (!form.funeral && !form.thanksgiving && !form.reception) {
      alert("Please select at least one event.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { error: dbError } = await supabase
      .from("rsvps")
      .insert({
        memorial_slug:       memorialSlug,
        culture:             culture,
        name:                form.name,
        email:               form.email,
        phone:               form.phone,
        guests:              form.guests,
        relation:            form.relation,
        message:             form.message,
        attend_funeral:      form.funeral,
        attend_reception:    form.reception,
        attend_thanksgiving: form.thanksgiving,
        send_flowers:        form.sendFlowers,
      });

    setSubmitting(false);

    if (dbError) {
      setError("Something went wrong. Please try again or contact the family directly.");
      return;
    }

    const events = [
      form.funeral && "Funeral service",
      form.reception && "Reception",
      form.thanksgiving && "Thanksgiving",
    ].filter(Boolean).join(" & ");
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
        Please let the family know you will be joining them. Select every event you plan to attend — your presence is a comfort and an honor.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* ── Event selection ── */}
        <div>
          <label style={labelStyle}>Which events will you attend?</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.4rem" }}>
            <EventRow
              checked={form.funeral}
              onChange={v => setForm(f => ({ ...f, funeral: v }))}
              label="Funeral service"
              date={funeral.date}
              time={funeral.time}
              address={`${funeral.name} — ${funeral.address}`}
            />
            <EventRow
              checked={form.thanksgiving}
              onChange={v => setForm(f => ({ ...f, thanksgiving: v }))}
              label="Thanksgiving celebration"
              date={thanksgiving.date}
              time={thanksgiving.time}
              address={thanksgiving.location}
              note="White attire is traditional for the Thanksgiving ceremony."
            />
            {reception && (
              <EventRow
                checked={form.reception}
                onChange={v => setForm(f => ({ ...f, reception: v }))}
                label="Reception"
                date={reception.date}
                time={reception.time}
                address={`${reception.name} — ${reception.address}`}
                note={reception.notes}
              />
            )}
          </div>
        </div>

        {/* ── Name + email ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-row">
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

        {/* ── Phone + guests ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-row">
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

        {/* ── Relation ── */}
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

        {/* ── Send flowers ── */}
        <div>
          <label style={labelStyle}>Also</label>
          <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.9rem", color: "var(--text-mid)", cursor: "pointer" }}>
            <input type="checkbox" checked={form.sendFlowers} onChange={e => setForm(f => ({ ...f, sendFlowers: e.target.checked }))} />
            I plan to send flowers to the funeral home
          </label>
          {form.sendFlowers && (
            <div style={{ marginTop: "0.75rem", background: "var(--brown-dark)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.75rem 1rem", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
              <div style={{ fontSize: "0.75rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>Delivery details</div>
              Please contact one of the florists in the <a href="#flowers" style={{ color: "var(--gold)", textDecoration: "none" }}>Send Flowers</a> section above. Mention the name of the deceased and the service date — the florist will coordinate delivery directly with the funeral home.
            </div>
          )}
        </div>

        {/* ── Message ── */}
        <div>
          <label style={labelStyle} htmlFor="rsvp-message">Leave a memory or message (optional)</label>
          <textarea id="rsvp-message" placeholder="Share a memory, a word of comfort, or a tribute…"
            value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
          <div style={{ fontSize: "0.75rem", color: "var(--text-faint)", marginTop: "0.4rem", lineHeight: 1.6 }}>
            Messages may be displayed publicly on this memorial page as a tribute to the family, using your first initial and last initial only.
          </div>
        </div>

        {error && (
          <div style={{ background: "#1f0d0d", border: "1px solid #4a1a1a", borderRadius: "4px", padding: "0.75rem 1rem", fontSize: "0.85rem", color: "#d68f8f" }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{
          background: submitting ? "var(--text-faint)" : "var(--gold)",
          color: "var(--bg-deep)", border: "none", borderRadius: "4px",
          padding: "0.75rem 2rem", fontFamily: "var(--font-sans)", fontSize: "0.9rem",
          fontWeight: 500, cursor: submitting ? "not-allowed" : "pointer",
          letterSpacing: "0.04em", alignSelf: "flex-start",
        }}>
          {submitting ? "Submitting…" : "Submit RSVP"}
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
