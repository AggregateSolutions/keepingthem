"use client";

import { useEffect, useRef, useState } from "react";
import type { MergedRecipient } from "@/app/api/admin/send-thankyou/route";

const GOLD = "#c8962e";
const BORDER = "#4a3820";
const BG = "#1a1208";
const CARD = "#241a0a";
const TEXT = "#f5ead8";
const MUTED = "#9a7a52";
const DIM = "#7a6a52";
const RED = "#d68f8f";
const GREEN = "#6aaa6a";

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

type Tribute = {
  id: string;
  name: string;
  email: string | null;
  relation: string | null;
  message: string;
  created_at: string;
};

type Donor = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  note: string | null;
};

type LogEntry = {
  id: string;
  sent_at: string;
  recipient_name: string;
  recipient_email: string | null;
  card_type: string;
};

const ATTENDANCE_MESSAGE = `Dear {name},

On behalf of our family, we want to express our deepest gratitude for your love, your presence, and your support during this time. As {relation}, your being there meant more than words can say.

We are comforted knowing that so many hearts carry the memory of our beloved with us.

With love and gratitude,`;

const DONOR_MESSAGE = `Dear {name},

On behalf of our family, we are deeply moved by your generosity. {contribution} Your kindness during this time of loss has meant more than we can express.

We are grateful beyond words.

With love and gratitude,`;

const COMBINED_MESSAGE = `Dear {name},

On behalf of our family, we want to express our heartfelt gratitude for both your presence and your generosity. As {relation}, your attendance at {events} and your thoughtful gift touched our hearts deeply.

{contribution} We are comforted knowing that so many hearts carry the memory of our beloved with us.

With love and gratitude,`;

export default function RsvpManager({
  slug,
  deceasedName,
  years,
  photoUrl,
}: {
  slug: string;
  deceasedName: string;
  years?: string;
  photoUrl?: string;
}) {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [merged, setMerged] = useState<MergedRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"rsvps" | "tributes" | "donors" | "thankyou" | "sms">("rsvps");

  // Donor form state
  const [donorForm, setDonorForm] = useState({ name: "", email: "", phone: "", note: "" });
  const [donorSaving, setDonorSaving] = useState(false);
  const [donorError, setDonorError] = useState("");
  const [editingDonorId, setEditingDonorId] = useState<string | null>(null);

  // Thank-you sender state
  const [attendanceMsg, setAttendanceMsg] = useState(ATTENDANCE_MESSAGE);
  const [donorMsg, setDonorMsg] = useState(DONOR_MESSAGE);
  const [combinedMsg, setCombinedMsg] = useState(COMBINED_MESSAGE);
  const [activeTemplate, setActiveTemplate] = useState<"attendance" | "donor" | "combined">("attendance");
  const [familyName, setFamilyName] = useState("");
  const [contributionNote, setContributionNote] = useState("");
  const [includeTributes, setIncludeTributes] = useState(false);
  const [skipAlreadySent, setSkipAlreadySent] = useState(true);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number; failures: string[] } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [previewEmail, setPreviewEmail] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // SMS state
  const [smsRecipients, setSmsRecipients] = useState<{ name: string; phone: string; email: string | null }[]>([]);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [smsConfirmed, setSmsConfirmed] = useState(false);
  const [smsResult, setSmsResult] = useState<{ sent: number; failed: number; failures: string[] } | null>(null);
  const [smsSiteUrl, setSmsSiteUrl] = useState("");

  function loadData() {
    setLoading(true);
    fetch(`/api/admin/send-thankyou?slug=${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setRsvps(d.rsvps ?? []);
        setTributes(d.tributes ?? []);
        setDonors(d.donors ?? []);
        setLog(d.log ?? []);
        setMerged(d.merged ?? []);
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [slug]);

  const withEmail = rsvps.filter(r => r.email);
  const withPhone = rsvps.filter(r => r.phone);
  const totalGuests = rsvps.reduce((sum, r) => sum + (parseInt(r.guests) || 1), 0);
  const tributesWithEmail = tributes.filter(t => t.email);
  const ambiguous = merged.filter(r => r.ambiguous);
  const readyToSend = merged.filter(r => r.email && !r.ambiguous && (!skipAlreadySent || !r.alreadySent));
  const alreadySentCount = merged.filter(r => r.alreadySent).length;

  async function handleSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError("");
    const form = new FormData();
    form.append("file", file);
    form.append("slug", slug);
    const res = await fetch("/api/admin/signature", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) setUploadError(data.error ?? "Upload failed");
    else setSignatureUrl(data.url);
  }

  async function handleSend() {
    if (!confirmed) { setConfirmed(true); return; }
    setSending(true); setSendResult(null);

    const res = await fetch("/api/admin/send-thankyou", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug, deceasedName, years,
        photoUrl: photoUrl ? (photoUrl.startsWith("http") ? photoUrl : `${window.location.origin}${photoUrl}`) : undefined,
        message: attendanceMsg,
        donorMessage: donorMsg,
        combinedMessage: combinedMsg,
        familyName: familyName || deceasedName.split(" ").slice(-1)[0],
        signatureUrl: signatureUrl || undefined,
        contributionNote: contributionNote || undefined,
        includeTributes,
        skipAlreadySent,
      }),
    });

    const data = await res.json();
    setSending(false); setConfirmed(false);
    if (!res.ok) { setError(data.error ?? "Send failed"); return; }
    setSendResult(data);
    loadData(); // refresh log
  }

  async function handlePreview(email?: string, overrideTemplate?: "attendance" | "donor" | "combined", overrideContribution?: string) {
    const recipient = email
      ? merged.find(r => r.email === email)
      : merged.find(r => r.email && !r.ambiguous);

    const template = overrideTemplate ?? activeTemplate;
    const templateMessage =
      template === "combined" ? combinedMsg :
      template === "donor" ? donorMsg :
      attendanceMsg;

    const res = await fetch("/api/admin/preview-ecard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deceasedName, years,
        photoUrl: photoUrl ? (photoUrl.startsWith("http") ? photoUrl : `${window.location.origin}${photoUrl}`) : undefined,
        message: templateMessage,
        familyName: familyName || deceasedName.split(" ").slice(-1)[0],
        signatureUrl: signatureUrl || undefined,
        contributionNote: overrideContribution ?? recipient?.contribution ?? contributionNote ?? undefined,
        recipientName: recipient?.name,
        recipientRelation: recipient?.relation,
        recipientEvents: recipient?.events,
      }),
    });
    const html = await res.text();
    const win = window.open("", "_blank");
    win?.document.write(html);
    win?.document.close();
  }

  async function handleSmsSend() {
    if (!smsConfirmed) { setSmsConfirmed(true); return; }
    setSmsSending(true); setSmsResult(null);
    const siteUrl = smsSiteUrl || window.location.origin;
    const res = await fetch("/api/admin/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug, deceasedName, years,
        photoUrl: photoUrl ? (photoUrl.startsWith("http") ? photoUrl : `${window.location.origin}${photoUrl}`) : undefined,
        message: attendanceMsg,
        donorMessage: donorMsg,
        combinedMessage: combinedMsg,
        familyName: familyName || deceasedName.split(" ").slice(-1)[0],
        signatureUrl: signatureUrl || undefined,
        contributionNote: contributionNote || undefined,
        siteUrl,
      }),
    });
    const data = await res.json();
    setSmsSending(false); setSmsConfirmed(false);
    if (!res.ok) { setError(data.error ?? "SMS send failed"); return; }
    setSmsResult(data);
    // Re-fetch SMS recipients so already-sent ones are reflected
    setSmsLoading(true);
    fetch(`/api/admin/send-sms?slug=${slug}`)
      .then(r => r.json())
      .then(d => {
        const all = [
          ...(d.rsvps ?? []),
          ...(d.donors ?? []).filter((don: { phone: string }) => !(d.rsvps ?? []).some((r: { phone: string }) => r.phone === don.phone)),
        ];
        setSmsRecipients(all);
      })
      .finally(() => setSmsLoading(false));
  }

  // RSVP editing
  const [editingRsvpId, setEditingRsvpId] = useState<string | null>(null);
  const [rsvpForm, setRsvpForm] = useState<Partial<Rsvp>>({});
  const [rsvpSaving, setRsvpSaving] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  function startEditRsvp(r: Rsvp) {
    setEditingRsvpId(r.id);
    setRsvpForm({ ...r });
    setRsvpError("");
  }

  async function saveRsvp() {
    if (!editingRsvpId) return;
    setRsvpSaving(true); setRsvpError("");
    const res = await fetch(`/api/admin/rsvps?id=${editingRsvpId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rsvpForm),
    });
    setRsvpSaving(false);
    if (!res.ok) { setRsvpError("Save failed"); return; }
    setEditingRsvpId(null);
    loadData();
  }

  // Merged list CSV export
  function exportMergedCsv() {
    // Build lookup maps for phone numbers from both RSVPs and donors
    const rsvpByEmail = new Map(rsvps.filter(r => r.email).map(r => [r.email!.toLowerCase(), r]));
    const donorByEmail = new Map(donors.filter(d => d.email).map(d => [d.email!.toLowerCase(), d]));
    const donorByName = new Map(donors.map(d => [d.name.toLowerCase().trim(), d]));

    const rows = [
      ["Name", "Email", "Phone", "Relation", "Card type", "Events attended", "Gift / contribution", "Status", "Sent date"],
      ...merged.map(r => {
        const emailKey = r.email?.toLowerCase();
        const rsvpMatch = emailKey ? rsvpByEmail.get(emailKey) : null;
        const donorMatch = emailKey ? donorByEmail.get(emailKey) : donorByName.get(r.name.toLowerCase().trim());
        const phone = rsvpMatch?.phone ?? donorMatch?.phone ?? "";
        return [
          r.name,
          r.email ?? "",
          phone,
          r.relation ?? "",
          r.cardType,
          r.events ?? "",
          r.contribution || donorMatch?.note || "",
          r.alreadySent ? "sent" : r.ambiguous ? "flagged" : "pending",
          r.alreadySent ? new Date(r.alreadySent.sent_at).toLocaleDateString() : "",
        ];
      }),
    ];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-thankyou-list.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Donor CRUD
  async function saveDonor() {
    if (!donorForm.name.trim()) { setDonorError("Name is required"); return; }
    setDonorSaving(true); setDonorError("");

    if (editingDonorId) {
      const res = await fetch(`/api/admin/donors?id=${editingDonorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorForm),
      });
      if (!res.ok) { setDonorError("Save failed"); setDonorSaving(false); return; }
      setEditingDonorId(null);
    } else {
      const res = await fetch("/api/admin/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorial_slug: slug, ...donorForm }),
      });
      if (!res.ok) { setDonorError("Save failed"); setDonorSaving(false); return; }
    }

    setDonorForm({ name: "", email: "", phone: "", note: "" });
    setDonorSaving(false);
    loadData();
  }

  async function deleteDonor(id: string) {
    await fetch(`/api/admin/donors?id=${id}`, { method: "DELETE" });
    loadData();
  }

  function editDonor(d: Donor) {
    setEditingDonorId(d.id);
    setDonorForm({ name: d.name, email: d.email ?? "", phone: d.phone ?? "", note: d.note ?? "" });
  }

  function exportDonorsCsv() {
    const rows = [
      ["Name", "Email", "Phone", "Gift note", "Added"],
      ...donors.map(d => [
        d.name,
        d.email ?? "",
        d.phone ?? "",
        d.note ?? "",
        new Date(d.created_at).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-donors.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const labelStyle = {
    fontSize: "0.72rem", color: MUTED, textTransform: "uppercase" as const,
    letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem",
  };
  const inputStyle = {
    width: "100%", padding: "0.55rem 0.75rem", background: BG,
    border: `1px solid ${BORDER}`, borderRadius: "4px", color: TEXT,
    fontSize: "0.85rem", boxSizing: "border-box" as const,
  };
  const events = (r: Rsvp) => [
    r.attend_funeral && "Funeral",
    r.attend_reception && "Reception",
    r.attend_thanksgiving && "Thanksgiving",
  ].filter(Boolean).join(" · ") || "—";

  const cardTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      attendance: { bg: "#1a2a1a", color: GREEN, label: "Attended" },
      donor: { bg: "#1a1a2a", color: "#7a9aff", label: "Donor" },
      combined: { bg: "#2a1a0a", color: GOLD, label: "Both" },
    };
    const s = styles[type] ?? styles.attendance;
    return (
      <span style={{ background: s.bg, color: s.color, fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "3px", whiteSpace: "nowrap" as const }}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total RSVPs", value: rsvps.length },
          { label: "Total guests", value: totalGuests },
          { label: "Have email", value: withEmail.length },
          { label: "Donors", value: donors.length },
          { label: "Cards sent", value: log.length },
        ].map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: "1.4rem", fontFamily: "Garamond, Georgia, serif", color: GOLD }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: DIM, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Ambiguous match warnings */}
      {ambiguous.length > 0 && (
        <div style={{ background: "#1f1208", border: "1px solid #8b4a0a", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.82rem", color: "#d4a86a" }}>
          <strong>⚠ {ambiguous.length} possible duplicate{ambiguous.length !== 1 ? "s" : ""} detected</strong> — an RSVP name matches a donor name but no email to confirm.
          These will be skipped until resolved. Go to the Donors tab to add their email or remove the duplicate.
          <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.2rem" }}>
            {ambiguous.map((r, i) => (
              <li key={i}>{r.ambiguousMatch?.rsvpName} (RSVP) ↔ {r.ambiguousMatch?.donorName} (Donor)</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: `1px solid ${BORDER}`, marginBottom: "1.25rem" }}>
        {(["rsvps", "tributes", "donors", "thankyou", "sms"] as const).map(t => (
          <button key={t} onClick={() => {
            setTab(t);
            if (t === "sms" && smsRecipients.length === 0) {
              setSmsLoading(true);
              fetch(`/api/admin/send-sms?slug=${slug}`)
                .then(r => r.json())
                .then(d => {
                  const all = [
                    ...(d.rsvps ?? []),
                    ...(d.donors ?? []).filter((don: { phone: string }) => !(d.rsvps ?? []).some((r: { phone: string }) => r.phone === don.phone)),
                  ];
                  setSmsRecipients(all);
                })
                .finally(() => setSmsLoading(false));
            }
          }} style={{
            background: tab === t ? CARD : "none",
            border: `1px solid ${tab === t ? BORDER : "transparent"}`,
            borderBottom: tab === t ? `1px solid ${CARD}` : "none",
            borderRadius: "4px 4px 0 0",
            color: tab === t ? GOLD : DIM,
            padding: "0.5rem 1rem", fontSize: "0.82rem", cursor: "pointer",
            marginBottom: tab === t ? "-1px" : "0",
          }}>
            {t === "rsvps" ? `RSVPs (${rsvps.length})`
              : t === "tributes" ? `Tributes (${tributes.length})`
              : t === "donors" ? `Donors (${donors.length})`
              : t === "thankyou" ? "Send thank-you"
              : "SMS"}
          </button>
        ))}
      </div>

      {/* RSVP list */}
      {tab === "rsvps" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Edit form */}
          {editingRsvpId && (
            <div style={{ background: CARD, border: `1px solid ${GOLD}`, borderRadius: "6px", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.82rem", color: GOLD, marginBottom: "1rem", fontWeight: 600 }}>Editing RSVP</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div><label style={labelStyle}>Name</label><input style={inputStyle} value={rsvpForm.name ?? ""} onChange={e => setRsvpForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={rsvpForm.email ?? ""} onChange={e => setRsvpForm(f => ({ ...f, email: e.target.value }))} /></div>
                <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={rsvpForm.phone ?? ""} onChange={e => setRsvpForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div><label style={labelStyle}>Guests</label><input style={inputStyle} value={rsvpForm.guests ?? "1"} onChange={e => setRsvpForm(f => ({ ...f, guests: e.target.value }))} /></div>
                <div><label style={labelStyle}>Relation</label><input style={inputStyle} value={rsvpForm.relation ?? ""} onChange={e => setRsvpForm(f => ({ ...f, relation: e.target.value }))} /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <label style={labelStyle}>Events attended</label>
                  {[
                    { key: "attend_funeral", label: "Funeral" },
                    { key: "attend_reception", label: "Reception" },
                    { key: "attend_thanksgiving", label: "Thanksgiving" },
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: MUTED, cursor: "pointer" }}>
                      <input type="checkbox" checked={!!(rsvpForm as Record<string, unknown>)[key]} onChange={e => setRsvpForm(f => ({ ...f, [key]: e.target.checked }))} style={{ accentColor: GOLD }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: "0.75rem" }}>
                <label style={labelStyle}>Message / tribute</label>
                <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical", lineHeight: 1.6 }} value={rsvpForm.message ?? ""} onChange={e => setRsvpForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              {rsvpError && <div style={{ color: RED, fontSize: "0.78rem", marginTop: "0.4rem" }}>{rsvpError}</div>}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <button onClick={saveRsvp} disabled={rsvpSaving} style={{ background: GOLD, color: "#0e0b07", border: "none", borderRadius: "4px", padding: "0.5rem 1.25rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
                  {rsvpSaving ? "Saving…" : "Save changes"}
                </button>
                <button onClick={() => setEditingRsvpId(null)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "0.5rem 1rem", fontSize: "0.85rem", color: MUTED, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem" }}>Loading…</div>
            ) : error ? (
              <div style={{ padding: "1.5rem", color: RED, fontSize: "0.85rem" }}>{error}</div>
            ) : rsvps.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic" }}>No RSVPs yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["Name", "Email", "Phone", "Guests", "Relation", "Events", "Message", "Date", ""].map(h => (
                        <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: i < rsvps.length - 1 ? `1px solid ${BORDER}` : "none", background: editingRsvpId === r.id ? "#1e1a08" : i % 2 === 0 ? "transparent" : "#1e1408" }}>
                        <td style={{ padding: "0.6rem 0.75rem", color: TEXT, fontWeight: 500, whiteSpace: "nowrap" }}>{r.name}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{r.email ?? <span style={{ color: DIM }}>—</span>}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: MUTED, whiteSpace: "nowrap" }}>{r.phone ?? <span style={{ color: DIM }}>—</span>}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: MUTED, textAlign: "center" }}>{r.guests}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{r.relation ?? "—"}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: MUTED, whiteSpace: "nowrap" }}>{events(r)}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: DIM, fontStyle: "italic", maxWidth: "180px" }}>
                          {r.message ? `"${r.message.slice(0, 60)}${r.message.length > 60 ? "…" : ""}"` : <span style={{ color: DIM }}>—</span>}
                        </td>
                        <td style={{ padding: "0.6rem 0.75rem", color: DIM, whiteSpace: "nowrap" }}>
                          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td style={{ padding: "0.6rem 0.75rem" }}>
                          <button onClick={() => startEditRsvp(r)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline", whiteSpace: "nowrap" }}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tribute wall */}
      {tab === "tributes" && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
          {tributes.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic" }}>No tribute messages yet.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Name", "Email", "Relation", "Message", "Date"].map(h => (
                      <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tributes.map((t, i) => (
                    <tr key={t.id} style={{ borderBottom: i < tributes.length - 1 ? `1px solid ${BORDER}` : "none", background: i % 2 === 0 ? "transparent" : "#1e1408" }}>
                      <td style={{ padding: "0.6rem 0.75rem", color: TEXT, fontWeight: 500, whiteSpace: "nowrap" }}>{t.name}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{t.email ?? <span style={{ color: DIM }}>—</span>}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{t.relation ?? "—"}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: DIM, fontStyle: "italic", maxWidth: "220px" }}>
                        {`"${t.message.slice(0, 80)}${t.message.length > 80 ? "…" : ""}"`}
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem", color: DIM, whiteSpace: "nowrap" }}>
                        {new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Donors tab */}
      {tab === "donors" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Add/edit form */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.82rem", color: MUTED, marginBottom: "1rem" }}>
              {editingDonorId ? "Edit donor" : "Add donor — flowers, monetary gifts, or other contributions"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input style={inputStyle} value={donorForm.name} onChange={e => setDonorForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={donorForm.email} onChange={e => setDonorForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" type="email" />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input style={inputStyle} value={donorForm.phone} onChange={e => setDonorForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-0000" />
              </div>
              <div>
                <label style={labelStyle}>Gift / contribution note</label>
                <input style={inputStyle} value={donorForm.note} onChange={e => setDonorForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. White lily arrangement, $100 donation" />
              </div>
            </div>
            {donorError && <div style={{ color: RED, fontSize: "0.78rem", marginTop: "0.5rem" }}>{donorError}</div>}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button onClick={saveDonor} disabled={donorSaving} style={{ background: GOLD, color: "#0e0b07", border: "none", borderRadius: "4px", padding: "0.5rem 1.25rem", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
                {donorSaving ? "Saving…" : editingDonorId ? "Save changes" : "Add donor"}
              </button>
              {editingDonorId && (
                <button onClick={() => { setEditingDonorId(null); setDonorForm({ name: "", email: "", phone: "", note: "" }); }} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "0.5rem 1rem", fontSize: "0.85rem", color: MUTED, cursor: "pointer" }}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Donor list */}
          {donors.length > 0 && (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ padding: "0.6rem 1rem", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{donors.length} donor{donors.length !== 1 ? "s" : ""}</span>
                <button onClick={exportDonorsCsv} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: "4px", color: MUTED, padding: "0.3rem 0.75rem", fontSize: "0.75rem", cursor: "pointer" }}>
                  Export CSV
                </button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Name", "Email", "Phone", "Gift note", "Preview", ""].map((h, i) => (
                      <th key={i} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {donors.map((d, i) => (
                    <tr key={d.id} style={{ borderBottom: i < donors.length - 1 ? `1px solid ${BORDER}` : "none", background: i % 2 === 0 ? "transparent" : "#1e1408" }}>
                      <td style={{ padding: "0.6rem 0.75rem", color: TEXT, fontWeight: 500 }}>{d.name}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{d.email ?? <span style={{ color: DIM }}>—</span>}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{d.phone ?? <span style={{ color: DIM }}>—</span>}</td>
                      <td style={{ padding: "0.6rem 0.75rem", color: DIM, fontStyle: "italic" }}>{d.note ?? "—"}</td>
                      <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                        {d.email && (
                          <button onClick={() => handlePreview(d.email!, "donor", d.note ?? undefined)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline" }}>
                            Preview
                          </button>
                        )}
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                        <button onClick={() => editDonor(d)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "0.78rem", marginRight: "0.5rem" }}>Edit</button>
                        <button onClick={() => deleteDonor(d.id)} style={{ background: "none", border: "none", color: RED, cursor: "pointer", fontSize: "0.78rem" }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Thank-you sender */}
      {tab === "thankyou" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Merged recipient list */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ padding: "0.75rem 1rem", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.82rem", color: MUTED }}>
                <strong style={{ color: TEXT }}>{readyToSend.length}</strong> ready to send
                {alreadySentCount > 0 && <span style={{ color: DIM }}> · {alreadySentCount} already sent</span>}
                {ambiguous.length > 0 && <span style={{ color: "#d4a86a" }}> · {ambiguous.length} flagged</span>}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", color: MUTED, cursor: "pointer" }}>
                  <input type="checkbox" checked={skipAlreadySent} onChange={e => setSkipAlreadySent(e.target.checked)} style={{ accentColor: GOLD }} />
                  Skip already sent
                </label>
                <button onClick={exportMergedCsv} disabled={merged.length === 0} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: "4px", color: MUTED, padding: "0.3rem 0.75rem", fontSize: "0.75rem", cursor: "pointer" }}>
                  Export CSV
                </button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Name", "Email", "Type", "Contribution", "Status", "Preview"].map(h => (
                      <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {merged.map((r, i) => (
                    <tr key={i} style={{ borderBottom: i < merged.length - 1 ? `1px solid ${BORDER}` : "none", background: i % 2 === 0 ? "transparent" : "#1e1408", opacity: r.ambiguous ? 0.5 : 1 }}>
                      <td style={{ padding: "0.5rem 0.75rem", color: TEXT, whiteSpace: "nowrap" }}>{r.name}</td>
                      <td style={{ padding: "0.5rem 0.75rem", color: MUTED }}>{r.email ?? <span style={{ color: DIM }}>no email</span>}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>{cardTypeBadge(r.cardType)}</td>
                      <td style={{ padding: "0.5rem 0.75rem", color: DIM, fontStyle: "italic", maxWidth: "160px" }}>{r.contribution ?? "—"}</td>
                      <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>
                        {r.ambiguous ? <span style={{ color: "#d4a86a", fontSize: "0.72rem" }}>⚠ flagged</span>
                          : r.alreadySent ? <span style={{ color: DIM, fontSize: "0.72rem" }}>✓ sent {new Date(r.alreadySent.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          : <span style={{ color: GREEN, fontSize: "0.72rem" }}>pending</span>}
                      </td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>
                        {r.email && !r.ambiguous && (
                          <button onClick={() => handlePreview(r.email!, r.cardType)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: "0.75rem", textDecoration: "underline" }}>
                            Preview
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card settings */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ fontSize: "0.82rem", color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Card settings</div>

            {/* Family name + signature */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={labelStyle}>Family name <span style={{ color: DIM }}>(for signature)</span></label>
                <input type="text" value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder={`e.g. Kwayisi`} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Default contribution note <span style={{ color: DIM }}>(fallback if donor has no note)</span></label>
                <input type="text" value={contributionNote} onChange={e => setContributionNote(e.target.value)} placeholder="e.g. Your generous gift" style={inputStyle} />
              </div>
            </div>

            {/* Signature upload */}
            <div>
              <label style={labelStyle}>Family signature image <span style={{ color: DIM }}>(PNG/JPG, transparent bg recommended, max 2MB)</span></label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: "4px", color: MUTED, padding: "0.5rem 1rem", fontSize: "0.82rem", cursor: "pointer" }}>
                  {uploading ? "Uploading…" : signatureUrl ? "Replace signature" : "Upload signature"}
                </button>
                {signatureUrl && <img src={signatureUrl} alt="Signature" style={{ maxHeight: "48px", maxWidth: "180px", objectFit: "contain" }} />}
                {!signatureUrl && familyName && <span style={{ color: DIM, fontSize: "0.8rem", fontStyle: "italic" }}>Will show "The {familyName} Family" in gold</span>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleSignatureUpload} style={{ display: "none" }} />
              {uploadError && <div style={{ color: RED, fontSize: "0.78rem", marginTop: "0.4rem" }}>{uploadError}</div>}
            </div>

            {/* Include tributes */}
            {tributesWithEmail.length > 0 && (
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.85rem", color: MUTED }}>
                <input type="checkbox" checked={includeTributes} onChange={e => setIncludeTributes(e.target.checked)} style={{ accentColor: GOLD }} />
                Also send to {tributesWithEmail.length} tribute wall contributor{tributesWithEmail.length !== 1 ? "s" : ""} with email
              </label>
            )}
          </div>

          {/* Message templates */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ fontSize: "0.82rem", color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Message templates</div>

            <div style={{ fontSize: "0.78rem", color: DIM, lineHeight: 1.6 }}>
              Variables: <code style={{ color: GOLD }}>{"{name}"}</code> first name · <code style={{ color: GOLD }}>{"{fullname}"}</code> · <code style={{ color: GOLD }}>{"{relation}"}</code> · <code style={{ color: GOLD }}>{"{events}"}</code> · <code style={{ color: GOLD }}>{"{contribution}"}</code> gift note
            </div>

            {/* Template tabs */}
            <div style={{ display: "flex", gap: "0.25rem", borderBottom: `1px solid ${BORDER}` }}>
              {([
                { key: "attendance", label: `Attendance (${merged.filter(r => r.cardType === "attendance").length})` },
                { key: "donor", label: `Donor only (${merged.filter(r => r.cardType === "donor").length})` },
                { key: "combined", label: `Combined (${merged.filter(r => r.cardType === "combined").length})` },
              ] as const).map(t => (
                <button key={t.key} onClick={() => setActiveTemplate(t.key)} style={{
                  background: activeTemplate === t.key ? BG : "none",
                  border: `1px solid ${activeTemplate === t.key ? BORDER : "transparent"}`,
                  borderBottom: activeTemplate === t.key ? `1px solid ${BG}` : "none",
                  borderRadius: "4px 4px 0 0",
                  color: activeTemplate === t.key ? GOLD : DIM,
                  padding: "0.4rem 0.9rem", fontSize: "0.78rem", cursor: "pointer",
                  marginBottom: activeTemplate === t.key ? "-1px" : "0",
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTemplate === "attendance" && (
              <textarea value={attendanceMsg} onChange={e => setAttendanceMsg(e.target.value)}
                style={{ ...inputStyle, minHeight: "220px", lineHeight: 1.75, resize: "vertical", fontFamily: "Garamond, Georgia, serif", fontSize: "0.9rem" }} />
            )}
            {activeTemplate === "donor" && (
              <textarea value={donorMsg} onChange={e => setDonorMsg(e.target.value)}
                style={{ ...inputStyle, minHeight: "220px", lineHeight: 1.75, resize: "vertical", fontFamily: "Garamond, Georgia, serif", fontSize: "0.9rem" }} />
            )}
            {activeTemplate === "combined" && (
              <textarea value={combinedMsg} onChange={e => setCombinedMsg(e.target.value)}
                style={{ ...inputStyle, minHeight: "220px", lineHeight: 1.75, resize: "vertical", fontFamily: "Garamond, Georgia, serif", fontSize: "0.9rem" }} />
            )}

            <button onClick={() => handlePreview(undefined, activeTemplate)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: "4px", color: MUTED, padding: "0.55rem 1.25rem", fontSize: "0.85rem", cursor: "pointer", alignSelf: "flex-start" }}>
              Preview {activeTemplate} card
            </button>
          </div>

          {/* Send log */}
          {log.length > 0 && (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
              <div style={{ padding: "0.6rem 1rem", borderBottom: `1px solid ${BORDER}`, fontSize: "0.72rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Send history
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["Recipient", "Email", "Type", "Sent"].map(h => (
                        <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {log.map((entry, i) => (
                      <tr key={entry.id} style={{ borderBottom: i < log.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                        <td style={{ padding: "0.5rem 0.75rem", color: TEXT }}>{entry.recipient_name}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: MUTED }}>{entry.recipient_email ?? "—"}</td>
                        <td style={{ padding: "0.5rem 0.75rem" }}>{cardTypeBadge(entry.card_type)}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: DIM, whiteSpace: "nowrap" }}>
                          {new Date(entry.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {sendResult && (
            <div style={{ background: sendResult.failed > 0 ? "#1f1208" : "#0d1f0d", border: `1px solid ${sendResult.failed > 0 ? "#4a2a0a" : "#1a4a1a"}`, borderRadius: "4px", padding: "0.75rem 1rem", fontSize: "0.85rem", color: sendResult.failed > 0 ? "#d4a86a" : GREEN }}>
              Sent to {sendResult.sent} recipient{sendResult.sent !== 1 ? "s" : ""}.
              {sendResult.failed > 0 && ` ${sendResult.failed} failed: ${sendResult.failures.join(", ")}`}
            </div>
          )}

          {confirmed && !sending && (
            <div style={{ fontSize: "0.82rem", color: "#d4a86a", background: "#1f1208", border: "1px solid #4a2a0a", borderRadius: "4px", padding: "0.75rem 1rem" }}>
              Click again to confirm — this will send to {readyToSend.length} recipient{readyToSend.length !== 1 ? "s" : ""}.
              {alreadySentCount > 0 && skipAlreadySent && ` (${alreadySentCount} already sent will be skipped)`}
            </div>
          )}

          <button onClick={handleSend} disabled={sending || readyToSend.length === 0} style={{
            background: confirmed ? "#8b4a0a" : GOLD, color: "#0e0b07", border: "none", borderRadius: "4px",
            padding: "0.65rem 2rem", fontSize: "0.9rem", fontWeight: 600,
            cursor: sending || readyToSend.length === 0 ? "not-allowed" : "pointer",
            alignSelf: "flex-start", letterSpacing: "0.04em",
            opacity: readyToSend.length === 0 ? 0.5 : 1,
          }}>
            {sending ? "Sending…" : confirmed ? `Confirm — send to ${readyToSend.length} people` : `Send thank-you cards (${readyToSend.length})`}
          </button>
        </div>
      )}

      {/* SMS tab */}
      {tab === "sms" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Info banner */}
          <div style={{ background: "#0d1020", border: "1px solid #2a3060", borderRadius: "6px", padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#7a9aff" }}>
            SMS recipients are anyone with a phone number — RSVPs and donors. Each message contains a unique link to their personal thank-you card. Messages use the same templates as email.
          </div>

          {/* Site URL setting */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1.25rem" }}>
            <label style={labelStyle}>Site URL <span style={{ color: DIM }}>(base URL for card links — leave blank to use this origin)</span></label>
            <input
              type="url"
              value={smsSiteUrl}
              onChange={e => setSmsSiteUrl(e.target.value)}
              placeholder={typeof window !== "undefined" ? window.location.origin : "https://keepingthem.net"}
              style={inputStyle}
            />
          </div>

          {/* Recipient list */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
            <div style={{ padding: "0.6rem 1rem", borderBottom: `1px solid ${BORDER}`, fontSize: "0.72rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {smsLoading ? "Loading recipients…" : `${smsRecipients.length} SMS recipient${smsRecipients.length !== 1 ? "s" : ""}`}
            </div>
            {smsLoading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem" }}>Loading…</div>
            ) : smsRecipients.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic" }}>
                No phone numbers found. Add phone numbers to RSVPs or donors.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["Name", "Phone", "Email"].map(h => (
                        <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {smsRecipients.map((r, i) => (
                      <tr key={i} style={{ borderBottom: i < smsRecipients.length - 1 ? `1px solid ${BORDER}` : "none", background: i % 2 === 0 ? "transparent" : "#1e1408" }}>
                        <td style={{ padding: "0.5rem 0.75rem", color: TEXT, whiteSpace: "nowrap" }}>{r.name}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: MUTED, whiteSpace: "nowrap" }}>{r.phone}</td>
                        <td style={{ padding: "0.5rem 0.75rem", color: DIM }}>{r.email ?? <span style={{ color: DIM, fontStyle: "italic" }}>SMS only</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Result */}
          {smsResult && (
            <div style={{ background: smsResult.failed > 0 ? "#1f1208" : "#0d1f0d", border: `1px solid ${smsResult.failed > 0 ? "#4a2a0a" : "#1a4a1a"}`, borderRadius: "4px", padding: "0.75rem 1rem", fontSize: "0.85rem", color: smsResult.failed > 0 ? "#d4a86a" : GREEN }}>
              Sent to {smsResult.sent} recipient{smsResult.sent !== 1 ? "s" : ""}.
              {smsResult.failed > 0 && ` ${smsResult.failed} failed: ${smsResult.failures.join(", ")}`}
            </div>
          )}

          {smsConfirmed && !smsSending && (
            <div style={{ fontSize: "0.82rem", color: "#d4a86a", background: "#1f1208", border: "1px solid #4a2a0a", borderRadius: "4px", padding: "0.75rem 1rem" }}>
              Click again to confirm — this will send SMS to {smsRecipients.length} recipient{smsRecipients.length !== 1 ? "s" : ""}. Standard message rates apply.
            </div>
          )}

          <button
            onClick={handleSmsSend}
            disabled={smsSending || smsRecipients.length === 0 || smsLoading}
            style={{
              background: smsConfirmed ? "#8b4a0a" : GOLD,
              color: "#0e0b07", border: "none", borderRadius: "4px",
              padding: "0.65rem 2rem", fontSize: "0.9rem", fontWeight: 600,
              cursor: smsSending || smsRecipients.length === 0 ? "not-allowed" : "pointer",
              alignSelf: "flex-start", letterSpacing: "0.04em",
              opacity: smsRecipients.length === 0 ? 0.5 : 1,
            }}
          >
            {smsSending ? "Sending…" : smsConfirmed ? `Confirm — send to ${smsRecipients.length} people` : `Send SMS thank-you (${smsRecipients.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
