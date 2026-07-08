"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  attended: boolean;
};

type LogEntry = {
  id: string;
  sent_at: string;
  recipient_name: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  card_type: string;
};

type SmsRecipient = {
  name: string;
  phone: string;
  email: string | null;
};

const ATTENDANCE_MESSAGE = `Dear {name},

On behalf of our family, we want to express our deepest gratitude for your love, your presence, and your support during this time. As a {relation}, your being there meant more than words can say.

We are comforted knowing that so many hearts carry the memory of our beloved with us.

With love and gratitude,`;

const DONOR_MESSAGE = `Dear {name},

On behalf of our family, we are deeply moved by your generosity and thoughtfulness during this difficult time. {contribution_sentence}

We are grateful beyond measure for your kindness.

With love and gratitude,`;

const COMBINED_MESSAGE = `Dear {name},

On behalf of our family, we want to express our heartfelt gratitude for both your presence and your generosity. As a {relation}, your being with us at {events} meant the world to us. {contribution_sentence}

We are comforted knowing that so many hearts carry the memory of our beloved with us.

With love and gratitude,`;

// ─── Styles ──────────────────────────────────────────────────────────────────

const labelStyle = {
  fontSize: "0.72rem", color: MUTED, textTransform: "uppercase" as const,
  letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem", minHeight: "2em",
};
const inputStyle = {
  width: "100%", padding: "0.55rem 0.75rem", background: BG,
  border: `1px solid ${BORDER}`, borderRadius: "4px", color: TEXT,
  fontSize: "0.85rem", boxSizing: "border-box" as const,
};
const btnPrimary = (disabled = false) => ({
  background: disabled ? DIM : GOLD, color: "#0e0b07", border: "none",
  borderRadius: "4px", padding: "0.65rem 1.75rem", fontSize: "0.9rem",
  fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
  letterSpacing: "0.03em", opacity: disabled ? 0.6 : 1,
});
const btnSecondary = {
  background: "none", border: `1px solid ${BORDER}`, borderRadius: "4px",
  color: MUTED, padding: "0.6rem 1.25rem", fontSize: "0.85rem", cursor: "pointer",
};
const btnGhost = {
  background: "none", border: "none", color: MUTED, cursor: "pointer",
  fontSize: "0.78rem", textDecoration: "underline" as const, padding: 0,
};

function cardTypeBadge(type: string) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    attendance: { bg: "#1a2a1a", color: GREEN, label: "Attended" },
    donor: { bg: "#1a1a2a", color: "#7a9aff", label: "Gift" },
    combined: { bg: "#2a1a0a", color: GOLD, label: "Attended + Gift" },
  };
  const s = styles[type] ?? styles.attendance;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "3px", whiteSpace: "nowrap" as const }}>
      {s.label}
    </span>
  );
}

function StatusDot({ sent, ambiguous }: { sent?: boolean; ambiguous?: boolean }) {
  if (ambiguous) return <span style={{ color: "#d4a86a", fontSize: "0.72rem" }}>Needs review</span>;
  if (sent) return <span style={{ color: DIM, fontSize: "0.72rem" }}>✓ Sent</span>;
  return <span style={{ color: GREEN, fontSize: "0.72rem" }}>Ready</span>;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepBar({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: "2rem" }}>
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === step;
        const done = num < step;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: done ? GOLD : active ? GOLD : BORDER,
                border: `2px solid ${done || active ? GOLD : BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 600,
                color: done || active ? "#0e0b07" : DIM,
              }}>
                {done ? "✓" : num}
              </div>
              <div style={{ fontSize: "0.65rem", color: active ? GOLD : done ? MUTED : DIM, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: "2px", background: done ? GOLD : BORDER, margin: "0 0.5rem", marginBottom: "1.2rem" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RsvpManager({
  slug, deceasedName, years, photoUrl, initialSignatureUrl,
}: {
  slug: string;
  deceasedName: string;
  years?: string;
  photoUrl?: string;
  initialSignatureUrl?: string;
}) {
  // Data
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [merged, setMerged] = useState<MergedRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Records view
  const [showRecords, setShowRecords] = useState(false);
  const [recordsTab, setRecordsTab] = useState<"attendees" | "messages" | "gifts">("attendees");

  // Wizard step (1–4) or "done"
  const [step, setStep] = useState<1 | 2 | 3 | 4 | "done">(1);

  // Step 1 — card design
  const [familyName, setFamilyName] = useState("");
  const [contributionNote, setContributionNote] = useState("");
  const [signatureUrl, setSignatureUrl] = useState(initialSignatureUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showSigPad, setShowSigPad] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState(ATTENDANCE_MESSAGE);
  const [donorMsg, setDonorMsg] = useState(DONOR_MESSAGE);
  const [combinedMsg, setCombinedMsg] = useState(COMBINED_MESSAGE);
  const [activeTemplate, setActiveTemplate] = useState<"attendance" | "donor" | "combined">("attendance");
  const [includeTributes, setIncludeTributes] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const sigDrawing = useRef(false);

  // Step 1 — test send
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testTemplate, setTestTemplate] = useState<"attendance" | "donor" | "combined">("attendance");
  const [testPreviewEmail, setTestPreviewEmail] = useState(""); // whose card data to use as the model
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Step 2 — email recipients (checkboxes + filter)
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [skipAlreadySent, setSkipAlreadySent] = useState(true);
  const [emailFilter, setEmailFilter] = useState<"all" | "unsent" | "attendance" | "donor" | "combined">("unsent");

  // Step 3 — SMS recipients (checkboxes + filter)
  const [smsRecipients, setSmsRecipients] = useState<SmsRecipient[]>([]);
  const [smsLoading, setSmsLoading] = useState(false);
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [smsSentPhones, setSmsSentPhones] = useState<Set<string>>(new Set());
  const [smsFilter, setSmsFilter] = useState<"all" | "unsent" | "email-too" | "sms-only">("unsent");

  // Step 4 — send
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ email: { sent: number; failed: number; failures: string[] } | null; sms: { sent: number; failed: number; failures: string[] } | null } | null>(null);

  // Donor form
  const [donorForm, setDonorForm] = useState({ name: "", email: "", phone: "", note: "", attended: false });
  const [donorSaving, setDonorSaving] = useState(false);
  const [donorError, setDonorError] = useState("");
  const [editingDonorId, setEditingDonorId] = useState<string | null>(null);

  // RSVP editing
  const [editingRsvpId, setEditingRsvpId] = useState<string | null>(null);
  const [rsvpForm, setRsvpForm] = useState<Partial<Rsvp>>({});
  const [rsvpSaving, setRsvpSaving] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  function loadData() {
    setLoading(true);
    fetch(`/api/admin/send-thankyou?slug=${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setRsvps((d.rsvps ?? []).slice().sort((a: Rsvp, b: Rsvp) => a.name.localeCompare(b.name)));
        setTributes(d.tributes ?? []);
        setDonors(d.donors ?? []);
        setLog(d.log ?? []);
        setMerged(d.merged ?? []);
        // Default: select all sendable email recipients
        const sendable = (d.merged ?? []).filter((r: MergedRecipient) => r.email && !r.ambiguous && !r.alreadySent);
        setSelectedEmails(new Set(sendable.map((r: MergedRecipient) => r.email!)));
        // Track already-sent phones from log
        setSmsSentPhones(new Set((d.log ?? []).map((l: LogEntry) => l.recipient_phone).filter(Boolean)));
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [slug]);

  // Load SMS recipients when entering step 3
  function loadSmsRecipients() {
    setSmsLoading(true);
    fetch(`/api/admin/send-sms?slug=${slug}`)
      .then(r => r.json())
      .then(d => {
        const all: SmsRecipient[] = [
          ...(d.rsvps ?? []),
          ...(d.donors ?? []).filter((don: SmsRecipient) =>
            !(d.rsvps ?? []).some((r: SmsRecipient) => r.phone === don.phone)
          ),
        ];
        setSmsRecipients(all);
        // Default: select all who haven't been sent to yet
        const unsent = all.filter(r => !smsSentPhones.has(r.phone));
        setSelectedPhones(new Set(unsent.map(r => r.phone)));
      })
      .finally(() => setSmsLoading(false));
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const totalGuests = rsvps.reduce((sum, r) => sum + (parseInt(r.guests) || 1), 0);
  const ambiguous = merged.filter(r => r.ambiguous);
  const emailRecipients = merged.filter(r => r.email && !r.ambiguous);
  const alreadySentCount = merged.filter(r => r.alreadySent).length;
  const mergedEmails = new Set(merged.map(r => r.email?.toLowerCase()).filter(Boolean));
  const tributesWithEmail = tributes.filter(t => t.email && !mergedEmails.has(t.email.toLowerCase()));

  const effectiveEmailRecipients = skipAlreadySent
    ? emailRecipients.filter(r => !r.alreadySent)
    : emailRecipients;

  const filteredEmailRecipients = effectiveEmailRecipients.filter(r => {
    if (emailFilter === "unsent") return !r.alreadySent;
    if (emailFilter === "attendance") return r.cardType === "attendance";
    if (emailFilter === "donor") return r.cardType === "donor";
    if (emailFilter === "combined") return r.cardType === "combined";
    return true; // "all"
  });

  const filteredSmsRecipients = smsRecipients.filter(r => {
    if (smsFilter === "unsent") return !smsSentPhones.has(r.phone);
    if (smsFilter === "email-too") return !!r.email;
    if (smsFilter === "sms-only") return !r.email;
    return true; // "all"
  });

  const absPhotoUrl = photoUrl
    ? (photoUrl.startsWith("http") ? photoUrl : (typeof window !== "undefined" ? `${window.location.origin}${photoUrl}` : photoUrl))
    : undefined;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function downloadCsv(rows: string[][], label: string) {
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${slug}-${label}.csv`;
    a.click();
  }

  async function handlePreview(
    overrideTemplate?: "attendance" | "donor" | "combined",
    recipientEmail?: string,
    overrideContribution?: string,
    recipientOverride?: { name: string; relation?: string | null; events?: string },
  ) {
    const template = overrideTemplate ?? activeTemplate;
    const mergedMatch = recipientEmail
      ? merged.find(r => r.email === recipientEmail)
      : merged.find(r => r.email && !r.ambiguous);
    const recipient = recipientOverride ?? mergedMatch;
    const templateMessage = template === "combined" ? combinedMsg : template === "donor" ? donorMsg : attendanceMsg;
    const res = await fetch("/api/admin/preview-ecard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deceasedName, years, photoUrl: absPhotoUrl,
        message: templateMessage,
        familyName: familyName || deceasedName.split(" ").slice(-1)[0],
        signatureUrl: signatureUrl || undefined,
        contributionNote: overrideContribution ?? (recipient as MergedRecipient)?.contribution ?? contributionNote ?? undefined,
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

  const sigStart = useCallback((e: React.PointerEvent) => {
    const canvas = sigCanvasRef.current; if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    sigDrawing.current = true;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }, []);

  const sigMove = useCallback((e: React.PointerEvent) => {
    if (!sigDrawing.current) return;
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }, []);

  const sigEnd = useCallback(() => { sigDrawing.current = false; }, []);

  function sigClear() {
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function persistSignatureUrl(url: string) {
    try {
      const configRes = await fetch(`/api/admin/memorial?slug=${slug}`, { credentials: "include" });
      const { config } = await configRes.json();
      if (config) {
        await fetch("/api/admin/memorial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ...config, signatureUrl: url }),
        });
      }
    } catch { /* non-fatal */ }
  }

  async function sigSave() {
    const canvas = sigCanvasRef.current; if (!canvas) return;
    setUploading(true); setUploadError("");
    canvas.toBlob(async (blob) => {
      if (!blob) { setUploadError("Could not capture signature."); setUploading(false); return; }
      const form = new FormData();
      form.append("file", new File([blob], "signature.png", { type: "image/png" }));
      form.append("slug", slug);
      const res = await fetch("/api/admin/signature", { method: "POST", body: form, credentials: "include" });
      const data = await res.json();
      setUploading(false);
      if (!res.ok) { setUploadError(data.error ?? "Upload failed"); }
      else { setSignatureUrl(data.url); setShowSigPad(false); persistSignatureUrl(data.url); }
    }, "image/png");
  }

  useEffect(() => {
    if (!showSigPad) return;
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [showSigPad]);

  async function handleTestSend() {
    const hasEmail = testEmail.trim();
    const hasPhone = testPhone.trim();
    if (!hasEmail && !hasPhone) { setTestResult("Enter an email or phone number above."); return; }
    setTestSending(true); setTestResult(null);

    // Use a real recipient's data as the model so variables render authentically
    const modelRecipient = testPreviewEmail
      ? merged.find(r => r.email === testPreviewEmail)
      : merged.find(r => r.cardType === testTemplate && r.email && !r.ambiguous);

    const templateMessage = testTemplate === "combined" ? combinedMsg : testTemplate === "donor" ? donorMsg : attendanceMsg;
    const resolvedFamily = familyName || deceasedName.split(" ").slice(-1)[0];

    const sharedPayload = {
      slug, deceasedName, years, photoUrl: absPhotoUrl,
      message: templateMessage, donorMessage: donorMsg, combinedMessage: combinedMsg,
      familyName: resolvedFamily,
      signatureUrl: signatureUrl || undefined,
      contributionNote: contributionNote || undefined,
    };

    const results: string[] = [];

    async function safePost(url: string, body: object) {
      try {
        const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!r.ok) return { sent: 0, failed: 1, failures: [], error: `HTTP ${r.status}` };
        return await r.json();
      } catch {
        return { sent: 0, failed: 1, failures: [], error: "network error" };
      }
    }

    if (hasEmail) {
      const res = await safePost("/api/admin/send-thankyou", {
        ...sharedPayload,
        message: templateMessage,
        recipientEmails: [testEmail.trim()],
        skipAlreadySent: false,
        isTest: true,
        testRecipientName: modelRecipient?.name,
        testRecipientRelation: modelRecipient?.relation,
        testRecipientEvents: modelRecipient?.events,
        testRecipientContribution: modelRecipient?.contribution ?? contributionNote,
      });
      results.push(res.sent > 0 ? `Email sent to ${testEmail.trim()}` : `Email failed: ${res.error ?? res.failures?.join(", ") ?? "unknown error"}`);
    }

    if (hasPhone) {
      const res = await safePost("/api/admin/send-sms", {
        ...sharedPayload,
        message: templateMessage,
        siteUrl: window.location.origin,
        testPhone: testPhone.trim(),
        testRecipientName: modelRecipient?.name,
        testRecipientRelation: modelRecipient?.relation,
        testRecipientEvents: modelRecipient?.events,
        testRecipientContribution: modelRecipient?.contribution ?? contributionNote,
        testCardType: testTemplate,
      });
      results.push(res.sent > 0 ? `Text sent to ${testPhone.trim()}` : `Text failed: ${res.error ?? res.failures?.join(", ") ?? "unknown error"}`);
    }

    setTestSending(false);
    setTestResult(results.join(" · "));
  }

  async function handleSend() {
    setSending(true);
    setSendResult(null);

    const emailsToSend = [...selectedEmails];
    const phonesToSend = [...selectedPhones];

    const sharedPayload = {
      slug, deceasedName, years, photoUrl: absPhotoUrl,
      message: attendanceMsg, donorMessage: donorMsg, combinedMessage: combinedMsg,
      familyName: familyName || deceasedName.split(" ").slice(-1)[0],
      signatureUrl: signatureUrl || undefined,
      contributionNote: contributionNote || undefined,
    };

    const [emailRes, smsRes] = await Promise.all([
      emailsToSend.length > 0
        ? fetch("/api/admin/send-thankyou", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...sharedPayload, recipientEmails: emailsToSend, skipAlreadySent: false, includeTributes }),
          }).then(r => r.json())
        : Promise.resolve(null),
      phonesToSend.length > 0
        ? fetch("/api/admin/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...sharedPayload, siteUrl: window.location.origin }),
          }).then(r => r.json())
        : Promise.resolve(null),
    ]);

    setSending(false);
    setSendResult({ email: emailRes, sms: smsRes });
    loadData();
    setStep("done");
  }

  // ── Donor CRUD ─────────────────────────────────────────────────────────────

  async function saveDonor() {
    if (!donorForm.name.trim()) { setDonorError("Name is required"); return; }
    setDonorSaving(true); setDonorError("");
    if (editingDonorId) {
      const res = await fetch(`/api/admin/donors?id=${editingDonorId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(donorForm),
      });
      if (!res.ok) { setDonorError("Save failed"); setDonorSaving(false); return; }
      setEditingDonorId(null);
    } else {
      const res = await fetch("/api/admin/donors", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memorial_slug: slug, ...donorForm }),
      });
      if (!res.ok) { setDonorError("Save failed"); setDonorSaving(false); return; }
    }
    setDonorForm({ name: "", email: "", phone: "", note: "", attended: false });
    setDonorSaving(false);
    loadData();
  }

  async function deleteDonor(id: string) {
    await fetch(`/api/admin/donors?id=${id}`, { method: "DELETE" });
    loadData();
  }

  // ── RSVP editing ───────────────────────────────────────────────────────────

  async function saveRsvp() {
    if (!editingRsvpId) return;
    setRsvpSaving(true); setRsvpError("");
    const res = await fetch(`/api/admin/rsvps?id=${editingRsvpId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rsvpForm),
    });
    setRsvpSaving(false);
    if (!res.ok) { setRsvpError("Save failed"); return; }
    setEditingRsvpId(null);
    loadData();
  }

  const rsvpEvents = (r: Rsvp) =>
    [r.attend_funeral && "Funeral", r.attend_reception && "Reception", r.attend_thanksgiving && "Thanksgiving"]
      .filter(Boolean).join(" · ") || "—";

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: DIM }}>Loading…</div>;
  }
  if (error) {
    return <div style={{ padding: "1.5rem", color: RED }}>{error}</div>;
  }

  return (
    <div>
      {/* ── Summary bar ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "2rem" }}>
        {[
          { label: "People attended", value: rsvps.length },
          { label: "Total guests", value: totalGuests },
          { label: "Can receive email", value: merged.filter(r => r.email && !r.ambiguous).length },
          { label: "Gifts recorded", value: donors.length },
          { label: "Cards sent", value: log.length },
        ].map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: "1.4rem", fontFamily: "Garamond, Georgia, serif", color: GOLD }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: DIM, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Ambiguous warnings ── */}
      {ambiguous.length > 0 && (
        <div style={{ background: "#1f1208", border: "1px solid #8b4a0a", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "1.25rem", fontSize: "0.82rem", color: "#d4a86a" }}>
          <strong>Action needed — {ambiguous.length} possible duplicate{ambiguous.length !== 1 ? "s" : ""}</strong>
          {" "}— someone on the gift list may already be on the attendance list but we couldn't confirm it automatically.
          Open <button onClick={() => { setShowRecords(true); setRecordsTab("gifts"); }} style={{ ...btnGhost, color: "#d4a86a" }}>Gifts received</button> to resolve.
          <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.2rem" }}>
            {ambiguous.map((r, i) => (
              <li key={i}>{r.ambiguousMatch?.rsvpName} (attendee) ↔ {r.ambiguousMatch?.donorName} (gift)</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Records toggle ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button onClick={() => setShowRecords(v => !v)} style={{ ...btnSecondary, fontSize: "0.82rem" }}>
          {showRecords ? "Hide records ↑" : "View records (attendance, gifts, messages) ↓"}
        </button>
      </div>

      {/* ── Records panel ── */}
      {showRecords && (
        <div style={{ marginBottom: "2rem", background: CARD, border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden" }}>
          {/* Records tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
            {([
              { key: "attendees", label: `Who attended (${rsvps.length})` },
              { key: "messages", label: `Messages left (${tributes.length})` },
              { key: "gifts", label: `Gifts received (${donors.length})` },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setRecordsTab(t.key)} style={{
                background: recordsTab === t.key ? BG : "none",
                border: "none", borderBottom: recordsTab === t.key ? `2px solid ${GOLD}` : "2px solid transparent",
                color: recordsTab === t.key ? GOLD : DIM,
                padding: "0.65rem 1.1rem", fontSize: "0.82rem", cursor: "pointer",
              }}>
                {t.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", paddingRight: "1rem", gap: "0.5rem" }}>
              {recordsTab === "attendees" && rsvps.length > 0 && (
                <button onClick={() => downloadCsv([
                  ["Name", "Email", "Phone", "Guests", "Relation", "Funeral", "Reception", "Thanksgiving", "Message", "Date"],
                  ...rsvps.map(r => [r.name, r.email ?? "", r.phone ?? "", r.guests, r.relation ?? "",
                    r.attend_funeral ? "Yes" : "No", r.attend_reception ? "Yes" : "No", r.attend_thanksgiving ? "Yes" : "No",
                    r.message ?? "", new Date(r.created_at).toLocaleDateString()]),
                ], "attendees")} style={{ ...btnGhost, fontSize: "0.75rem" }}>Export CSV</button>
              )}
              {recordsTab === "messages" && tributes.length > 0 && (
                <button onClick={() => downloadCsv([
                  ["Name", "Email", "Relation", "Message", "Date"],
                  ...tributes.map(t => [t.name, t.email ?? "", t.relation ?? "", t.message, new Date(t.created_at).toLocaleDateString()]),
                ], "messages")} style={{ ...btnGhost, fontSize: "0.75rem" }}>Export CSV</button>
              )}
              {recordsTab === "gifts" && donors.length > 0 && (
                <button onClick={() => downloadCsv([
                  ["Name", "Email", "Phone", "Gift note", "Added"],
                  ...donors.map(d => [d.name, d.email ?? "", d.phone ?? "", d.note ?? "", new Date(d.created_at).toLocaleDateString()]),
                ], "gifts")} style={{ ...btnGhost, fontSize: "0.75rem" }}>Export CSV</button>
              )}
            </div>
          </div>

          {/* Who attended */}
          {recordsTab === "attendees" && (
            <>
              {editingRsvpId && (
                <div style={{ padding: "1.25rem", borderBottom: `1px solid ${BORDER}`, background: "#1e1a08" }}>
                  <div style={{ fontSize: "0.82rem", color: GOLD, marginBottom: "1rem", fontWeight: 600 }}>Editing record</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div><label style={labelStyle}>Name</label><input style={inputStyle} value={rsvpForm.name ?? ""} onChange={e => setRsvpForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={rsvpForm.email ?? ""} onChange={e => setRsvpForm(f => ({ ...f, email: e.target.value }))} /></div>
                    <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={rsvpForm.phone ?? ""} onChange={e => setRsvpForm(f => ({ ...f, phone: e.target.value }))} /></div>
                    <div><label style={labelStyle}>Guests</label><input style={inputStyle} value={rsvpForm.guests ?? "1"} onChange={e => setRsvpForm(f => ({ ...f, guests: e.target.value }))} /></div>
                    <div><label style={labelStyle}>Relation</label><input style={inputStyle} value={rsvpForm.relation ?? ""} onChange={e => setRsvpForm(f => ({ ...f, relation: e.target.value }))} /></div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <label style={labelStyle}>Events attended</label>
                      {[{ key: "attend_funeral", label: "Funeral" }, { key: "attend_reception", label: "Reception" }, { key: "attend_thanksgiving", label: "Thanksgiving" }].map(({ key, label }) => (
                        <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: MUTED, cursor: "pointer" }}>
                          <input type="checkbox" checked={!!(rsvpForm as Record<string, unknown>)[key]} onChange={e => setRsvpForm(f => ({ ...f, [key]: e.target.checked }))} style={{ accentColor: GOLD }} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: "0.75rem" }}>
                    <label style={labelStyle}>Message</label>
                    <textarea style={{ ...inputStyle, minHeight: "70px", resize: "vertical", lineHeight: 1.6 }} value={rsvpForm.message ?? ""} onChange={e => setRsvpForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  {rsvpError && <div style={{ color: RED, fontSize: "0.78rem", marginTop: "0.4rem" }}>{rsvpError}</div>}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                    <button onClick={saveRsvp} disabled={rsvpSaving} style={btnPrimary(rsvpSaving)}>{rsvpSaving ? "Saving…" : "Save"}</button>
                    <button onClick={() => setEditingRsvpId(null)} style={btnSecondary}>Cancel</button>
                  </div>
                </div>
              )}
              {rsvps.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic" }}>No attendance records yet.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {["Name", "Email", "Phone", "Guests", "Relation", "Events", "Message", "Date", ""].map(h => (
                          <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
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
                          <td style={{ padding: "0.6rem 0.75rem", color: MUTED, whiteSpace: "nowrap" }}>{rsvpEvents(r)}</td>
                          <td style={{ padding: "0.6rem 0.75rem", color: DIM, fontStyle: "italic", maxWidth: "160px" }}>
                            {r.message ? `"${r.message.slice(0, 50)}${r.message.length > 50 ? "…" : ""}"` : <span style={{ color: DIM }}>—</span>}
                          </td>
                          <td style={{ padding: "0.6rem 0.75rem", color: DIM, whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                          <td style={{ padding: "0.6rem 0.75rem" }}>
                            <button onClick={() => { setEditingRsvpId(r.id); setRsvpForm({ ...r }); setRsvpError(""); }} style={btnGhost}>Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Messages left */}
          {recordsTab === "messages" && (
            tributes.length === 0
              ? <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic" }}>No messages yet.</div>
              : <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {["Name", "Email", "Relation", "Message", "Date"].map(h => (
                          <th key={h} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
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
                          <td style={{ padding: "0.6rem 0.75rem", color: DIM, whiteSpace: "nowrap" }}>{new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          )}

          {/* Gifts received */}
          {recordsTab === "gifts" && (
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Add/edit form */}
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1rem" }}>
                <div style={{ fontSize: "0.8rem", color: MUTED, marginBottom: "0.75rem" }}>
                  {editingDonorId ? "Edit gift record" : "Add a gift — flowers, donations, or any other contribution"}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={donorForm.name} onChange={e => setDonorForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
                  <div><label style={labelStyle}>Email</label><input style={inputStyle} value={donorForm.email} onChange={e => setDonorForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" type="email" /></div>
                  <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={donorForm.phone} onChange={e => setDonorForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-0000" /></div>
                  <div><label style={labelStyle}>What they gave</label><input style={inputStyle} value={donorForm.note} onChange={e => setDonorForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. $300.00 donation or beautiful floral arrangement" /></div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.82rem", color: MUTED, marginTop: "0.5rem" }}>
                  <input type="checkbox" checked={donorForm.attended} onChange={e => setDonorForm(f => ({ ...f, attended: e.target.checked }))} style={{ accentColor: GOLD }} />
                  They attended the service (will receive an "Attended + gift" card instead of "Gift only")
                </label>
                {donorError && <div style={{ color: RED, fontSize: "0.78rem", marginTop: "0.5rem" }}>{donorError}</div>}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <button onClick={saveDonor} disabled={donorSaving} style={btnPrimary(donorSaving)}>
                    {donorSaving ? "Saving…" : editingDonorId ? "Save changes" : "Add gift"}
                  </button>
                  {editingDonorId && (
                    <button onClick={() => { setEditingDonorId(null); setDonorForm({ name: "", email: "", phone: "", note: "", attended: false }); }} style={btnSecondary}>Cancel</button>
                  )}
                </div>
              </div>

              {donors.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {["Name", "Email", "Phone", "What they gave", "Card type", "Preview", ""].map((h, i) => (
                          <th key={i} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
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
                          <td style={{ padding: "0.6rem 0.75rem" }}>{cardTypeBadge(d.attended ? "combined" : "donor")}</td>
                          <td style={{ padding: "0.6rem 0.75rem" }}>
                            <button onClick={() => handlePreview(d.attended ? "combined" : "donor", undefined, d.note ?? undefined, { name: d.name })} style={btnGhost}>Preview card</button>
                          </td>
                          <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                            <button onClick={() => { setEditingDonorId(d.id); setDonorForm({ name: d.name, email: d.email ?? "", phone: d.phone ?? "", note: d.note ?? "", attended: d.attended }); }} style={{ ...btnGhost, marginRight: "0.75rem" }}>Edit</button>
                            <button onClick={() => deleteDonor(d.id)} style={{ ...btnGhost, color: RED }}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SEND THANK-YOU WIZARD
      ══════════════════════════════════════════════════════ */}

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "1.75rem" }}>
        <div style={{ fontSize: "0.72rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem" }}>
          Send thank-you cards
        </div>

        {step !== "done" && (
          <StepBar step={step} steps={["Design card", "Email recipients", "Text recipients", "Send"]} />
        )}

        {/* ── Step 1: Card design ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ fontSize: "1.1rem", fontFamily: "Garamond, Georgia, serif", color: TEXT, marginBottom: "0.25rem" }}>
              Design the thank-you card
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: MUTED, lineHeight: 1.6 }}>
              This card will be personalised for each person — their name, what they attended, and any gift they gave will be filled in automatically.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", alignItems: "end" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={labelStyle}>Family name <span style={{ color: DIM }}>(appears as "The [name] Family" in the card signature)</span></label>
                <input type="text" value={familyName} onChange={e => setFamilyName(e.target.value)}
                  placeholder={`e.g. ${deceasedName.split(" ").slice(-1)[0]}`} style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label style={labelStyle}>Default gift note <span style={{ color: DIM }}>(fallback when no specific note is on file)</span></label>
                <input type="text" value={contributionNote} onChange={e => setContributionNote(e.target.value)}
                  placeholder="e.g. generous gift" style={inputStyle} />
              </div>
            </div>

            {/* Signature */}
            <div>
              <label style={labelStyle}>Family signature <span style={{ color: DIM }}>(optional)</span></label>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "0.5rem", marginTop: "0.35rem" }}>
                {signatureUrl && <img src={signatureUrl} alt="Signature" style={{ maxHeight: "48px", maxWidth: "200px", objectFit: "contain" }} />}
                {!signatureUrl && familyName && (
                  <span style={{ color: DIM, fontSize: "0.8rem", fontStyle: "italic" }}>Will show "The {familyName} Family" in gold text</span>
                )}
                <button onClick={() => setShowSigPad(p => !p)} style={btnSecondary}>
                  {showSigPad ? "Cancel" : signatureUrl ? "Redo signature" : "Draw signature"}
                </button>
              </div>
              {showSigPad && (
                <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1rem", display: "inline-block" }}>
                  <div style={{ fontSize: "0.78rem", color: MUTED, marginBottom: "0.5rem" }}>
                    Sign below using your mouse, trackpad, or a connected signature pad
                  </div>
                  <canvas
                    ref={sigCanvasRef}
                    width={400} height={120}
                    onPointerDown={sigStart} onPointerMove={sigMove} onPointerUp={sigEnd} onPointerLeave={sigEnd}
                    style={{ display: "block", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: "4px", cursor: "crosshair", touchAction: "none", userSelect: "none" }}
                  />
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                    <button onClick={sigClear} style={{ ...btnSecondary, fontSize: "0.78rem" }}>Clear</button>
                    <button onClick={sigSave} disabled={uploading} style={{ ...btnPrimary(), fontSize: "0.78rem" }}>
                      {uploading ? "Saving…" : "Save signature"}
                    </button>
                  </div>
                </div>
              )}
              <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: DIM, lineHeight: 1.6 }}>
                Prefer to upload? On Mac: open Preview → Tools → Annotate → Signature, add your signature to a blank white page, then File → Export as PNG.{" "}
                <label style={{ color: GOLD, cursor: "pointer", textDecoration: "underline" }}>
                  Upload PNG
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    setUploading(true); setUploadError("");
                    const form = new FormData();
                    form.append("file", file); form.append("slug", slug);
                    const res = await fetch("/api/admin/signature", { method: "POST", body: form, credentials: "include" });
                    const data = await res.json();
                    setUploading(false);
                    if (!res.ok) setUploadError(data.error ?? "Upload failed");
                    else { setSignatureUrl(data.url); setShowSigPad(false); persistSignatureUrl(data.url); }
                    e.target.value = "";
                  }} style={{ display: "none" }} />
                </label>
              </div>
              {uploadError && <div style={{ color: RED, fontSize: "0.78rem", marginTop: "0.4rem" }}>{uploadError}</div>}
            </div>

            {/* Message editor */}
            <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.82rem", color: MUTED, marginBottom: "0.75rem" }}>
                Your message — three versions are sent automatically based on each person's connection to the family
              </div>
              <div style={{ display: "flex", gap: "0.25rem", borderBottom: `1px solid ${BORDER}`, marginBottom: "1rem" }}>
                {([
                  { key: "attendance", label: `Attended (${merged.filter(r => r.cardType === "attendance").length})` },
                  { key: "donor", label: `Gift only (${merged.filter(r => r.cardType === "donor").length})` },
                  { key: "combined", label: `Attended + gift (${merged.filter(r => r.cardType === "combined").length})` },
                ] as const).map(t => (
                  <button key={t.key} onClick={() => setActiveTemplate(t.key)} style={{
                    background: activeTemplate === t.key ? CARD : "none",
                    border: `1px solid ${activeTemplate === t.key ? BORDER : "transparent"}`,
                    borderBottom: activeTemplate === t.key ? `1px solid ${CARD}` : "none",
                    borderRadius: "4px 4px 0 0",
                    color: activeTemplate === t.key ? GOLD : DIM,
                    padding: "0.4rem 0.9rem", fontSize: "0.78rem", cursor: "pointer",
                    marginBottom: activeTemplate === t.key ? "-1px" : "0",
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: "0.72rem", color: DIM, marginBottom: "0.6rem", lineHeight: 1.6 }}>
                You can use: <code style={{ color: GOLD }}>{"{name}"}</code> first name ·{" "}
                <code style={{ color: GOLD }}>{"{relation}"}</code> how they knew the deceased ·{" "}
                <code style={{ color: GOLD }}>{"{events}"}</code> which services they attended ·{" "}
                <code style={{ color: GOLD }}>{"{contribution}"}</code> their gift
              </div>

              {activeTemplate === "attendance" && (
                <textarea value={attendanceMsg} onChange={e => setAttendanceMsg(e.target.value)}
                  style={{ ...inputStyle, minHeight: "200px", lineHeight: 1.8, resize: "vertical", fontFamily: "Garamond, Georgia, serif", fontSize: "0.9rem" }} />
              )}
              {activeTemplate === "donor" && (
                <textarea value={donorMsg} onChange={e => setDonorMsg(e.target.value)}
                  style={{ ...inputStyle, minHeight: "200px", lineHeight: 1.8, resize: "vertical", fontFamily: "Garamond, Georgia, serif", fontSize: "0.9rem" }} />
              )}
              {activeTemplate === "combined" && (
                <textarea value={combinedMsg} onChange={e => setCombinedMsg(e.target.value)}
                  style={{ ...inputStyle, minHeight: "200px", lineHeight: 1.8, resize: "vertical", fontFamily: "Garamond, Georgia, serif", fontSize: "0.9rem" }} />
              )}

              <button onClick={() => handlePreview(activeTemplate)} style={{ ...btnSecondary, marginTop: "0.75rem", fontSize: "0.82rem" }}>
                Preview how this card will look →
              </button>
            </div>

            {tributesWithEmail.length > 0 && (
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.85rem", color: MUTED }}>
                <input type="checkbox" checked={includeTributes} onChange={e => setIncludeTributes(e.target.checked)} style={{ accentColor: GOLD }} />
                Also send to {tributesWithEmail.length} {tributesWithEmail.length === 1 ? "person who" : "people who"} left a message but didn't formally RSVP
              </label>
            )}

            {/* Test send */}
            <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1.25rem" }}>
              <div style={{ fontSize: "0.82rem", color: MUTED, marginBottom: "0.75rem", fontWeight: 600 }}>
                Send a test card to yourself
              </div>
              <p style={{ margin: "0 0 1rem", fontSize: "0.82rem", color: DIM, lineHeight: 1.6 }}>
                Enter your own email or phone number to see exactly what a recipient will receive before sending to anyone else.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <label style={labelStyle}>Your email</label>
                  <input type="email" value={testEmail} onChange={e => { setTestEmail(e.target.value); setTestResult(null); }}
                    placeholder="you@example.com" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Your phone</label>
                  <input type="tel" value={testPhone} onChange={e => { setTestPhone(e.target.value); setTestResult(null); }}
                    placeholder="+1 (555) 000-0000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Render as <span style={{ color: DIM }}>(whose data fills the card)</span></label>
                  <select
                    value={testPreviewEmail}
                    onChange={e => { setTestPreviewEmail(e.target.value); setTestResult(null); }}
                    style={{ ...inputStyle, appearance: "none" as const }}
                  >
                    <option value="">— first matching recipient —</option>
                    {merged.filter(r => r.email && !r.ambiguous).map((r, i) => (
                      <option key={i} value={r.email!}>
                        {r.name} ({r.cardType === "combined" ? "attended + gift" : r.cardType === "donor" ? "gift" : "attended"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  {([
                    { key: "attendance", label: "Attended" },
                    { key: "donor", label: "Gift only" },
                    { key: "combined", label: "Attended + gift" },
                  ] as const).map(t => (
                    <button key={t.key} onClick={() => setTestTemplate(t.key)} style={{
                      background: testTemplate === t.key ? CARD : "none",
                      border: `1px solid ${testTemplate === t.key ? GOLD : BORDER}`,
                      borderRadius: "4px", color: testTemplate === t.key ? GOLD : DIM,
                      padding: "0.3rem 0.75rem", fontSize: "0.75rem", cursor: "pointer",
                    }}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleTestSend} disabled={testSending || (!testEmail.trim() && !testPhone.trim())} style={{
                  ...btnSecondary, fontSize: "0.82rem",
                  opacity: (!testEmail.trim() && !testPhone.trim()) ? 0.5 : 1,
                }}>
                  {testSending ? "Sending…" : "Send test"}
                </button>
              </div>
              {testResult && (
                <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: testResult.includes("failed") ? RED : GREEN }}>
                  {testResult}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setStep(2)} style={btnPrimary()}>Next: Choose who receives by email →</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Email recipients ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ fontSize: "1.1rem", fontFamily: "Garamond, Georgia, serif", color: TEXT }}>
              Who should receive a card by email?
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: MUTED, lineHeight: 1.6 }}>
              Everyone below has an email address on file. All are selected by default — uncheck anyone you'd like to skip.
            </p>

            {/* Filter row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", color: DIM, marginRight: "0.25rem" }}>Show:</span>
              {([
                { key: "unsent", label: "Not yet sent" },
                { key: "all", label: "Everyone" },
                { key: "attendance", label: "Attended" },
                { key: "donor", label: "Gift only" },
                { key: "combined", label: "Attended + gift" },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setEmailFilter(f.key)} style={{
                  background: emailFilter === f.key ? GOLD : "none",
                  border: `1px solid ${emailFilter === f.key ? GOLD : BORDER}`,
                  borderRadius: "20px", color: emailFilter === f.key ? "#0e0b07" : DIM,
                  padding: "0.25rem 0.75rem", fontSize: "0.75rem", cursor: "pointer", fontWeight: emailFilter === f.key ? 600 : 400,
                }}>
                  {f.label}
                </button>
              ))}
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: MUTED, cursor: "pointer", marginLeft: "auto" }}>
                <input type="checkbox" checked={skipAlreadySent} onChange={e => setSkipAlreadySent(e.target.checked)} style={{ accentColor: GOLD }} />
                Hide already sent
              </label>
              <button onClick={() => downloadCsv([
                ["Name", "Email", "Card type", "Status"],
                ...emailRecipients.map(r => [r.name, r.email ?? "", r.cardType, r.alreadySent ? "sent" : "pending"]),
              ], "email-recipients")} style={btnGhost}>Export CSV</button>
            </div>

            {filteredEmailRecipients.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic", background: BG, borderRadius: "6px" }}>
                {emailRecipients.length === 0
                  ? "No email addresses found in attendance or gift records."
                  : "No one matches this filter. Try a different group or uncheck 'Hide already sent'."}
              </div>
            ) : (
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
                {/* Select all filtered */}
                <div style={{ padding: "0.65rem 1rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input
                    type="checkbox"
                    style={{ accentColor: GOLD, width: "16px", height: "16px" }}
                    checked={filteredEmailRecipients.length > 0 && filteredEmailRecipients.every(r => selectedEmails.has(r.email!))}
                    onChange={e => {
                      const s = new Set(selectedEmails);
                      if (e.target.checked) filteredEmailRecipients.forEach(r => s.add(r.email!));
                      else filteredEmailRecipients.forEach(r => s.delete(r.email!));
                      setSelectedEmails(s);
                    }}
                  />
                  <span style={{ fontSize: "0.78rem", color: MUTED }}>
                    Select all in view · <strong style={{ color: TEXT }}>{selectedEmails.size}</strong> selected total
                    {alreadySentCount > 0 && <span style={{ color: DIM }}> · {alreadySentCount} already sent</span>}
                  </span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <tbody>
                    {filteredEmailRecipients.map((r, i) => (
                      <tr key={i} style={{ borderBottom: i < filteredEmailRecipients.length - 1 ? `1px solid ${BORDER}` : "none", background: selectedEmails.has(r.email!) ? "#1e1a08" : "transparent" }}>
                        <td style={{ padding: "0.65rem 1rem", width: "36px" }}>
                          <input
                            type="checkbox"
                            style={{ accentColor: GOLD, width: "16px", height: "16px" }}
                            checked={selectedEmails.has(r.email!)}
                            onChange={e => {
                              const s = new Set(selectedEmails);
                              if (e.target.checked) s.add(r.email!); else s.delete(r.email!);
                              setSelectedEmails(s);
                            }}
                          />
                        </td>
                        <td style={{ padding: "0.65rem 0.5rem", color: TEXT, fontWeight: 500, whiteSpace: "nowrap" }}>{r.name}</td>
                        <td style={{ padding: "0.65rem 0.5rem", color: MUTED }}>{r.email}</td>
                        <td style={{ padding: "0.65rem 0.5rem" }}>{cardTypeBadge(r.cardType)}</td>
                        <td style={{ padding: "0.65rem 1rem", textAlign: "right" }}>
                          <StatusDot sent={!!r.alreadySent} ambiguous={r.ambiguous} />
                        </td>
                        <td style={{ padding: "0.65rem 1rem" }}>
                          <button onClick={() => handlePreview(r.cardType, r.email!)} style={btnGhost}>Preview</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} style={btnSecondary}>← Back</button>
              <button onClick={() => { setStep(3); loadSmsRecipients(); }} style={btnPrimary()}>
                Next: Choose who receives by text →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: SMS recipients ── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ fontSize: "1.1rem", fontFamily: "Garamond, Georgia, serif", color: TEXT }}>
              Who should receive a card by text message?
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: MUTED, lineHeight: 1.6 }}>
              These people have a phone number on file. Each text message will include a personal link to their own thank-you card.
              {smsRecipients.some(r => !smsSentPhones.has(r.phone)) === false && smsRecipients.length > 0 &&
                " Everyone has already been sent a text."}
            </p>

            {/* Filter row */}
            {!smsLoading && smsRecipients.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.75rem", color: DIM, marginRight: "0.25rem" }}>Show:</span>
                {([
                  { key: "unsent", label: "Not yet sent" },
                  { key: "all", label: "Everyone" },
                  { key: "email-too", label: "Also has email" },
                  { key: "sms-only", label: "Text only" },
                ] as const).map(f => (
                  <button key={f.key} onClick={() => setSmsFilter(f.key)} style={{
                    background: smsFilter === f.key ? GOLD : "none",
                    border: `1px solid ${smsFilter === f.key ? GOLD : BORDER}`,
                    borderRadius: "20px", color: smsFilter === f.key ? "#0e0b07" : DIM,
                    padding: "0.25rem 0.75rem", fontSize: "0.75rem", cursor: "pointer", fontWeight: smsFilter === f.key ? 600 : 400,
                  }}>
                    {f.label}
                  </button>
                ))}
                <button onClick={() => downloadCsv([
                  ["Name", "Phone", "Email"],
                  ...smsRecipients.map(r => [r.name, r.phone, r.email ?? ""]),
                ], "sms-recipients")} style={{ ...btnGhost, marginLeft: "auto" }}>Export CSV</button>
              </div>
            )}

            {smsLoading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: DIM }}>Loading…</div>
            ) : smsRecipients.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic", background: BG, borderRadius: "6px" }}>
                No phone numbers found. You can add them in the attendance or gift records above.
              </div>
            ) : filteredSmsRecipients.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic", background: BG, borderRadius: "6px" }}>
                No one matches this filter. Try a different group.
              </div>
            ) : (
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
                {/* Select all filtered */}
                <div style={{ padding: "0.65rem 1rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input
                    type="checkbox"
                    style={{ accentColor: GOLD, width: "16px", height: "16px" }}
                    checked={filteredSmsRecipients.length > 0 && filteredSmsRecipients.every(r => selectedPhones.has(r.phone))}
                    onChange={e => {
                      const s = new Set(selectedPhones);
                      if (e.target.checked) filteredSmsRecipients.forEach(r => s.add(r.phone));
                      else filteredSmsRecipients.forEach(r => s.delete(r.phone));
                      setSelectedPhones(s);
                    }}
                  />
                  <span style={{ fontSize: "0.78rem", color: MUTED }}>
                    Select all in view · <strong style={{ color: TEXT }}>{selectedPhones.size}</strong> selected total
                  </span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <tbody>
                    {filteredSmsRecipients.map((r, i) => {
                      const alreadySent = smsSentPhones.has(r.phone);
                      return (
                        <tr key={i} style={{ borderBottom: i < filteredSmsRecipients.length - 1 ? `1px solid ${BORDER}` : "none", background: selectedPhones.has(r.phone) ? "#1e1a08" : "transparent" }}>
                          <td style={{ padding: "0.65rem 1rem", width: "36px" }}>
                            <input
                              type="checkbox"
                              style={{ accentColor: GOLD, width: "16px", height: "16px" }}
                              checked={selectedPhones.has(r.phone)}
                              onChange={e => {
                                const s = new Set(selectedPhones);
                                if (e.target.checked) s.add(r.phone); else s.delete(r.phone);
                                setSelectedPhones(s);
                              }}
                            />
                          </td>
                          <td style={{ padding: "0.65rem 0.5rem", color: TEXT, fontWeight: 500, whiteSpace: "nowrap" }}>{r.name}</td>
                          <td style={{ padding: "0.65rem 0.5rem", color: MUTED, whiteSpace: "nowrap" }}>{r.phone}</td>
                          <td style={{ padding: "0.65rem 0.5rem", color: DIM }}>
                            {r.email ? r.email : <span style={{ fontStyle: "italic" }}>text only</span>}
                          </td>
                          <td style={{ padding: "0.65rem 1rem", textAlign: "right" }}>
                            {alreadySent ? <span style={{ color: DIM, fontSize: "0.72rem" }}>✓ Sent</span> : <span style={{ color: GREEN, fontSize: "0.72rem" }}>Ready</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(2)} style={btnSecondary}>← Back</button>
              <button onClick={() => setStep(4)} style={btnPrimary(selectedEmails.size === 0 && selectedPhones.size === 0)} disabled={selectedEmails.size === 0 && selectedPhones.size === 0}>
                Next: Review and send →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Review and send ── */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ fontSize: "1.1rem", fontFamily: "Garamond, Georgia, serif", color: TEXT }}>
              Ready to send
            </div>

            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1rem" }}>
                <div style={{ fontSize: "0.7rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Email cards</div>
                <div style={{ fontSize: "1.5rem", fontFamily: "Garamond, Georgia, serif", color: selectedEmails.size > 0 ? GOLD : DIM }}>{selectedEmails.size}</div>
                <div style={{ fontSize: "0.78rem", color: DIM }}>
                  {selectedEmails.size === 0 ? "None selected" : `${selectedEmails.size} ${selectedEmails.size === 1 ? "person" : "people"} will receive an email`}
                </div>
              </div>
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1rem" }}>
                <div style={{ fontSize: "0.7rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Text messages</div>
                <div style={{ fontSize: "1.5rem", fontFamily: "Garamond, Georgia, serif", color: selectedPhones.size > 0 ? GOLD : DIM }}>{selectedPhones.size}</div>
                <div style={{ fontSize: "0.78rem", color: DIM }}>
                  {selectedPhones.size === 0 ? "None selected" : `${selectedPhones.size} ${selectedPhones.size === 1 ? "person" : "people"} will receive a text`}
                </div>
              </div>
            </div>

            <div style={{ background: "#1f1208", border: "1px solid #4a2a0a", borderRadius: "6px", padding: "1rem", fontSize: "0.85rem", color: "#d4a86a", lineHeight: 1.6 }}>
              Once you click Send, cards will go out immediately and cannot be recalled. Please take a moment to preview a card above if you haven't already.
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setStep(3)} style={btnSecondary} disabled={sending}>← Back</button>
              <button onClick={handleSend} disabled={sending || (selectedEmails.size === 0 && selectedPhones.size === 0)} style={{
                ...btnPrimary(sending || (selectedEmails.size === 0 && selectedPhones.size === 0)),
                background: sending ? DIM : "#8b4a0a",
                minWidth: "200px",
              }}>
                {sending ? "Sending…" : `Send to ${selectedEmails.size + selectedPhones.size} ${selectedEmails.size + selectedPhones.size === 1 ? "person" : "people"}`}
              </button>
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {step === "done" && sendResult && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", alignItems: "center", textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "2.5rem", fontFamily: "Garamond, Georgia, serif", color: GOLD }}>Done</div>
            <p style={{ fontSize: "0.95rem", color: MUTED, lineHeight: 1.7, maxWidth: "480px", margin: 0 }}>
              Your thank-you cards have been sent on behalf of the family.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", width: "100%", maxWidth: "480px" }}>
              {sendResult.email && (
                <div style={{ background: BG, border: `1px solid ${sendResult.email.failed > 0 ? "#4a2a0a" : BORDER}`, borderRadius: "6px", padding: "1rem" }}>
                  <div style={{ fontSize: "0.7rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Email</div>
                  <div style={{ fontSize: "1.4rem", fontFamily: "Garamond, Georgia, serif", color: sendResult.email.failed > 0 ? "#d4a86a" : GREEN }}>
                    {sendResult.email.sent} sent
                  </div>
                  {sendResult.email.failed > 0 && (
                    <div style={{ fontSize: "0.75rem", color: RED, marginTop: "0.25rem" }}>{sendResult.email.failed} failed</div>
                  )}
                </div>
              )}
              {sendResult.sms && (
                <div style={{ background: BG, border: `1px solid ${sendResult.sms.failed > 0 ? "#4a2a0a" : BORDER}`, borderRadius: "6px", padding: "1rem" }}>
                  <div style={{ fontSize: "0.7rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Text</div>
                  <div style={{ fontSize: "1.4rem", fontFamily: "Garamond, Georgia, serif", color: sendResult.sms.failed > 0 ? "#d4a86a" : GREEN }}>
                    {sendResult.sms.sent} sent
                  </div>
                  {sendResult.sms.failed > 0 && (
                    <div style={{ fontSize: "0.75rem", color: RED, marginTop: "0.25rem" }}>{sendResult.sms.failed} failed</div>
                  )}
                </div>
              )}
            </div>

            {/* Send history */}
            {log.length > 0 && (
              <div style={{ width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden", textAlign: "left" }}>
                <div style={{ padding: "0.6rem 1rem", borderBottom: `1px solid ${BORDER}`, fontSize: "0.72rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Full send history
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {["Name", "Email / Phone", "Card type", "Sent"].map(h => (
                          <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {log.map((entry, i) => (
                        <tr key={entry.id} style={{ borderBottom: i < log.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                          <td style={{ padding: "0.5rem 0.75rem", color: TEXT }}>{entry.recipient_name}</td>
                          <td style={{ padding: "0.5rem 0.75rem", color: MUTED }}>{entry.recipient_email ?? entry.recipient_phone ?? "—"}</td>
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

            <button onClick={() => { setStep(1); setSendResult(null); }} style={btnSecondary}>
              Send another batch
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
