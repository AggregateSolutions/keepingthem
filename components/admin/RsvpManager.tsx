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

const RELATION_OPTIONS = ["Immediate family", "Extended family", "Close friend", "Community member", "Other"];

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
  amount: string | null;
  attended: boolean;
  relation: string | null;
};

type LogEntry = {
  id: string;
  sent_at: string;
  recipient_name: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  card_type: string;
};

// Unified recipient — one row per person, tracks both email and SMS selection
type UnifiedRecipient = {
  name: string;
  email: string | null;
  phone: string | null;
  cardType: "attendance" | "donor" | "combined";
  relation?: string | null;
  contribution?: string;
  events?: string;
  alreadySentEmail: boolean;
  alreadySentSms: boolean;
  emailChecked: boolean;
  smsChecked: boolean;
};

const ATTENDANCE_MESSAGE = `Dear {name},

On behalf of our family, we want to express our deepest gratitude for your love, your presence, and your support during this time. As {relation}, your being there meant more than words can say.

We are comforted knowing that so many hearts carry the memory of our beloved with us.

With love and gratitude,`;

const DONOR_MESSAGE = `Dear {name},

On behalf of our family, we are deeply moved by your generosity and thoughtfulness during this difficult time. {contribution_sentence}

We are grateful beyond measure for your kindness.

With love and gratitude,`;

const COMBINED_MESSAGE = `Dear {name},

On behalf of our family, we want to express our heartfelt gratitude for both your presence and your generosity. As {relation}, your being with us at {events} meant the world to us. {contribution_sentence}

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
  // Raw data
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [merged, setMerged] = useState<MergedRecipient[]>([]);
  const [unified, setUnified] = useState<UnifiedRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Records panel
  const [recordsTab, setRecordsTab] = useState<"attendees" | "messages" | "gifts">("attendees");

  // Wizard step
  const [step, setStep] = useState<1 | 2 | 3 | "done">(1);

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

  // Test send
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testTemplate, setTestTemplate] = useState<"attendance" | "donor" | "combined">("attendance");
  const [testPreviewEmail, setTestPreviewEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Step 2 — unified recipient filter
  const [recipientFilter, setRecipientFilter] = useState<"all" | "unsent" | "attendance" | "donor" | "combined">("unsent");
  const [skipAlreadySent, setSkipAlreadySent] = useState(true);

  // Send state
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ email: { sent: number; failed: number; failures: string[] } | null; sms: { sent: number; failed: number; failures: string[] } | null } | null>(null);

  // Donor form
  const emptyDonorForm = { name: "", email: "", phone: "", note: "", amount: "", relation: "", attended: false };
  const [donorForm, setDonorForm] = useState(emptyDonorForm);
  const [donorSaving, setDonorSaving] = useState(false);
  const [donorError, setDonorError] = useState("");
  const [editingDonorId, setEditingDonorId] = useState<string | null>(null);

  // RSVP editing
  const [editingRsvpId, setEditingRsvpId] = useState<string | null>(null);
  const [rsvpForm, setRsvpForm] = useState<Partial<Rsvp>>({});
  const [rsvpSaving, setRsvpSaving] = useState(false);
  const [rsvpError, setRsvpError] = useState("");

  function buildUnified(mergedList: MergedRecipient[], smsList: { name: string; phone: string; email: string | null; cardType: "attendance" | "donor" | "combined"; relation?: string | null }[], sentPhones: Set<string>): UnifiedRecipient[] {
    const result: UnifiedRecipient[] = [];
    const smsMap = new Map<string, typeof smsList[0]>();
    for (const r of smsList) smsMap.set(r.name.toLowerCase().trim(), r);

    for (const m of mergedList) {
      if (m.ambiguous) continue;
      const sms = smsMap.get(m.name.toLowerCase().trim());
      result.push({
        name: m.name,
        email: m.email,
        phone: sms?.phone ?? null,
        cardType: m.cardType,
        relation: m.relation ?? null,
        contribution: m.contribution,
        events: m.events,
        alreadySentEmail: !!m.alreadySent,
        alreadySentSms: sms ? sentPhones.has(sms.phone) : false,
        emailChecked: !!m.email && !m.alreadySent,
        smsChecked: !!sms?.phone && !sentPhones.has(sms.phone),
      });
      if (sms) smsMap.delete(m.name.toLowerCase().trim());
    }

    // Add SMS-only people not in merged (donors/attendees with phone but no email in merged)
    for (const r of smsList) {
      const key = r.name.toLowerCase().trim();
      if (!smsMap.has(key)) continue;
      result.push({
        name: r.name,
        email: r.email,
        phone: r.phone,
        cardType: r.cardType,
        relation: r.relation ?? null,
        alreadySentEmail: false,
        alreadySentSms: sentPhones.has(r.phone),
        emailChecked: false,
        smsChecked: !sentPhones.has(r.phone),
      });
    }

    return result;
  }

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/send-thankyou?slug=${slug}`).then(r => r.json()),
      fetch(`/api/admin/send-sms?slug=${slug}`).then(r => r.json()),
    ])
      .then(([d, smsData]) => {
        if (d.error) { setError(d.error); return; }
        const sentPhones = new Set<string>((d.log ?? []).map((l: LogEntry) => l.recipient_phone).filter(Boolean));
        setRsvps((d.rsvps ?? []).slice().sort((a: Rsvp, b: Rsvp) => a.name.localeCompare(b.name)));
        setTributes(d.tributes ?? []);
        setDonors(d.donors ?? []);
        setLog(d.log ?? []);
        setMerged(d.merged ?? []);
        setUnified(buildUnified(d.merged ?? [], smsData.recipients ?? [], sentPhones).sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [slug]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const totalGuests = rsvps.reduce((sum, r) => sum + (parseInt(r.guests) || 1), 0);
  const mergedEmails = new Set(merged.map(r => r.email?.toLowerCase()).filter(Boolean));
  const tributesWithEmail = tributes.filter(t => t.email && !mergedEmails.has(t.email.toLowerCase()));

  const emailCount = unified.filter(r => r.emailChecked && r.email).length;
  const smsCount = unified.filter(r => r.smsChecked && r.phone).length;

  const filteredUnified = unified.filter(r => {
    const hasChannel = r.email || r.phone;
    if (!hasChannel) return false;
    if (skipAlreadySent && r.alreadySentEmail && r.alreadySentSms) return false;
    if (recipientFilter === "unsent") return !r.alreadySentEmail || !r.alreadySentSms;
    if (recipientFilter === "attendance") return r.cardType === "attendance";
    if (recipientFilter === "donor") return r.cardType === "donor";
    if (recipientFilter === "combined") return r.cardType === "combined";
    return true;
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
    recipientOverride?: { name: string; relation?: string | null; events?: string; contribution?: string },
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
        contributionNote: overrideContribution ?? recipientOverride?.contribution ?? (recipient as MergedRecipient)?.contribution ?? contributionNote ?? undefined,
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
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
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

    const emailsToSend = unified.filter(r => r.emailChecked && r.email).map(r => r.email!);
    const phonesToSend = unified.filter(r => r.smsChecked && r.phone).map(r => r.phone!);

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
            body: JSON.stringify({ ...sharedPayload, siteUrl: window.location.origin, recipientPhones: phonesToSend }),
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
    setDonorForm(emptyDonorForm);
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

  async function patchRsvpRelation(id: string, relation: string) {
    setRsvps(prev => prev.map(r => r.id === id ? { ...r, relation: relation || null } : r));
    await fetch(`/api/admin/rsvps?id=${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relation: relation || null }),
    });
  }

  async function patchDonorRelation(id: string, relation: string) {
    setDonors(prev => prev.map(d => d.id === id ? { ...d, relation: relation || null } : d));
    await fetch(`/api/admin/donors?id=${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relation: relation || null }),
    });
  }

  const rsvpEvents = (r: Rsvp) =>
    [r.attend_funeral && "Funeral", r.attend_reception && "Reception", r.attend_thanksgiving && "Thanksgiving"]
      .filter(Boolean).join(" · ") || "—";

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: DIM }}>Loading…</div>;
  if (error) return <div style={{ padding: "1.5rem", color: RED }}>{error}</div>;

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

      {/* ── Records panel — always visible ── */}
      <div style={{ marginBottom: "2rem", background: CARD, border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "0.75rem 1.25rem", borderBottom: `1px solid ${BORDER}`, fontSize: "0.72rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Records
        </div>
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
                ["Name", "Email", "Phone", "Amount", "Relation", "Gift note", "Added"],
                ...donors.map(d => [d.name, d.email ?? "", d.phone ?? "", d.amount ?? "", d.relation ?? "", d.note ?? "", new Date(d.created_at).toLocaleDateString()]),
              ], "gifts")} style={{ ...btnGhost, fontSize: "0.75rem" }}>Export CSV</button>
            )}
          </div>
        </div>

        {/* Who attended */}
        {recordsTab === "attendees" && (
          <div style={{ maxHeight: "420px", overflowY: "auto" }}>
            {editingRsvpId && (
              <div style={{ padding: "1.25rem", borderBottom: `1px solid ${BORDER}`, background: "#1e1a08" }}>
                <div style={{ fontSize: "0.82rem", color: GOLD, marginBottom: "1rem", fontWeight: 600 }}>Editing record</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div><label style={labelStyle}>Name</label><input style={inputStyle} value={rsvpForm.name ?? ""} onChange={e => setRsvpForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={rsvpForm.email ?? ""} onChange={e => setRsvpForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={rsvpForm.phone ?? ""} onChange={e => setRsvpForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div><label style={labelStyle}>Guests</label><input style={inputStyle} value={rsvpForm.guests ?? "1"} onChange={e => setRsvpForm(f => ({ ...f, guests: e.target.value }))} /></div>
                  <div>
                    <label style={labelStyle}>Relationship to the deceased</label>
                    <select style={{ ...inputStyle, appearance: "none" as const }} value={rsvpForm.relation ?? ""} onChange={e => setRsvpForm(f => ({ ...f, relation: e.target.value }))}>
                      <option value="">Please select</option>
                      {RELATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
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
            {rsvps.length === 0
              ? <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic" }}>No attendance records yet.</div>
              : (
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
                          <td style={{ padding: "0.3rem 0.75rem" }}>
                            <select
                              value={r.relation ?? ""}
                              onChange={e => patchRsvpRelation(r.id, e.target.value)}
                              style={{ background: "transparent", border: `1px solid transparent`, borderRadius: "4px", color: r.relation ? MUTED : DIM, fontSize: "0.82rem", cursor: "pointer", padding: "0.25rem 0.4rem", appearance: "none" as const }}
                              onMouseEnter={e => (e.currentTarget.style.borderColor = BORDER)}
                              onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
                            >
                              <option value="">— select —</option>
                              {RELATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
                            </select>
                          </td>
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
          </div>
        )}

        {/* Messages left */}
        {recordsTab === "messages" && (
          <div style={{ maxHeight: "420px", overflowY: "auto" }}>
            {tributes.length === 0
              ? <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic" }}>No messages yet.</div>
              : (
                <div style={{ overflowX: "auto" }}>
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
          </div>
        )}

        {/* Gifts received */}
        {recordsTab === "gifts" && (
          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1rem" }}>
              <div style={{ fontSize: "0.8rem", color: MUTED, marginBottom: "0.75rem" }}>
                {editingDonorId ? "Edit gift record" : "Add a gift — flowers, donations, or any other contribution"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={donorForm.name} onChange={e => setDonorForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
                <div><label style={labelStyle}>Email</label><input style={inputStyle} value={donorForm.email} onChange={e => setDonorForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" type="email" /></div>
                <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={donorForm.phone} onChange={e => setDonorForm(f => ({ ...f, phone: e.target.value }))} placeholder="(555) 000-0000" /></div>
                <div><label style={labelStyle}>Amount <span style={{ color: DIM }}>(internal only — never shown in card)</span></label><input style={inputStyle} value={donorForm.amount} onChange={e => setDonorForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. $300.00" /></div>
                <div>
                  <label style={labelStyle}>Relationship to the deceased</label>
                  <select style={{ ...inputStyle, appearance: "none" as const }} value={donorForm.relation} onChange={e => setDonorForm(f => ({ ...f, relation: e.target.value }))}>
                    <option value="">Please select</option>
                    {RELATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>What they gave <span style={{ color: DIM }}>(appears in thank-you card)</span></label>
                  <input style={inputStyle} value={donorForm.note} onChange={e => setDonorForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. generous monetary gift, beautiful floral arrangement, or time and service" />
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.82rem", color: MUTED, marginTop: "0.75rem" }}>
                <input type="checkbox" checked={donorForm.attended} onChange={e => setDonorForm(f => ({ ...f, attended: e.target.checked }))} style={{ accentColor: GOLD }} />
                They attended the service (will receive an "Attended + gift" card instead of "Gift only")
              </label>
              {donorError && <div style={{ color: RED, fontSize: "0.78rem", marginTop: "0.5rem" }}>{donorError}</div>}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <button onClick={saveDonor} disabled={donorSaving} style={btnPrimary(donorSaving)}>
                  {donorSaving ? "Saving…" : editingDonorId ? "Save changes" : "Add gift"}
                </button>
                {editingDonorId && (
                  <button onClick={() => { setEditingDonorId(null); setDonorForm(emptyDonorForm); }} style={btnSecondary}>Cancel</button>
                )}
              </div>
            </div>

            {donors.length > 0 && (
              <div style={{ maxHeight: "420px", overflowY: "auto", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["Name", "Email", "Phone", "Amount", "Relation", "What they gave", "Card type", "Preview", ""].map((h, i) => (
                        <th key={i} style={{ padding: "0.6rem 0.75rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((d, i) => (
                      <tr key={d.id} style={{ borderBottom: i < donors.length - 1 ? `1px solid ${BORDER}` : "none", background: i % 2 === 0 ? "transparent" : "#1e1408" }}>
                        <td style={{ padding: "0.6rem 0.75rem", color: TEXT, fontWeight: 500, whiteSpace: "nowrap" }}>{d.name}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{d.email ?? <span style={{ color: DIM }}>—</span>}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: MUTED, whiteSpace: "nowrap" }}>{d.phone ?? <span style={{ color: DIM }}>—</span>}</td>
                        <td style={{ padding: "0.6rem 0.75rem", color: MUTED }}>{d.amount ?? <span style={{ color: DIM }}>—</span>}</td>
                        <td style={{ padding: "0.3rem 0.75rem" }}>
                          <select
                            value={d.relation ?? ""}
                            onChange={e => patchDonorRelation(d.id, e.target.value)}
                            style={{ background: "transparent", border: `1px solid transparent`, borderRadius: "4px", color: d.relation ? MUTED : DIM, fontSize: "0.82rem", cursor: "pointer", padding: "0.25rem 0.4rem", appearance: "none" as const }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = BORDER)}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
                          >
                            <option value="">— select —</option>
                            {RELATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "0.6rem 0.75rem", color: DIM, fontStyle: "italic" }}>{d.note ?? "—"}</td>
                        <td style={{ padding: "0.6rem 0.75rem" }}>{cardTypeBadge(d.attended ? "combined" : "donor")}</td>
                        <td style={{ padding: "0.6rem 0.75rem" }}>
                          <button onClick={() => handlePreview(d.attended ? "combined" : "donor", undefined, d.note ?? undefined, { name: d.name, relation: d.relation })} style={btnGhost}>Preview card</button>
                        </td>
                        <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                          <button onClick={() => { setEditingDonorId(d.id); setDonorForm({ name: d.name, email: d.email ?? "", phone: d.phone ?? "", note: d.note ?? "", amount: d.amount ?? "", relation: d.relation ?? "", attended: d.attended }); }} style={{ ...btnGhost, marginRight: "0.75rem" }}>Edit</button>
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

      {/* ══════════════════════════════════════════════════════
          SEND THANK-YOU WIZARD
      ══════════════════════════════════════════════════════ */}

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "8px", padding: "1.75rem" }}>
        <div style={{ fontSize: "0.72rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem" }}>
          Send thank-you cards
        </div>

        {step !== "done" && (
          <StepBar step={step} steps={["Design card", "Who gets a card?", "Review & Send"]} />
        )}

        {/* ── Step 1: Card design ── */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "1.1rem", fontFamily: "Garamond, Georgia, serif", color: TEXT, marginBottom: "0.4rem" }}>
                  Design the thank-you card
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: MUTED, lineHeight: 1.6 }}>
                  Each card is personalised automatically — name, relationship, events attended, and any gift will be filled in for each person.
                </p>
              </div>
              <button onClick={() => handlePreview(activeTemplate)} style={{ ...btnSecondary, fontSize: "0.82rem", whiteSpace: "nowrap" as const }}>
                Preview card →
              </button>
            </div>

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
                Variables: <code style={{ color: GOLD }}>{"{name}"}</code> first name ·{" "}
                <code style={{ color: GOLD }}>{"{relation}"}</code> relationship ·{" "}
                <code style={{ color: GOLD }}>{"{events}"}</code> services attended ·{" "}
                <code style={{ color: GOLD }}>{"{contribution_sentence}"}</code> their gift as a sentence
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
                  <select value={testPreviewEmail} onChange={e => { setTestPreviewEmail(e.target.value); setTestResult(null); }}
                    style={{ ...inputStyle, appearance: "none" as const }}>
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
              <button onClick={() => setStep(2)} style={btnPrimary()}>Next: Who gets a card? →</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Unified recipients ── */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ fontSize: "1.1rem", fontFamily: "Garamond, Georgia, serif", color: TEXT }}>
              Who gets a card?
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: MUTED, lineHeight: 1.6 }}>
              Select who should receive a thank-you card and how — by email, by text, or both. Uncheck any channel you'd like to skip for a specific person.
            </p>

            {/* Filter row */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.75rem", color: DIM, marginRight: "0.25rem" }}>Filter:</span>
              {([
                { key: "unsent", label: "Not yet sent" },
                { key: "all", label: "Everyone" },
                { key: "attendance", label: "Attended" },
                { key: "donor", label: "Gift only" },
                { key: "combined", label: "Attended + gift" },
              ] as const).map(f => (
                <button key={f.key} onClick={() => setRecipientFilter(f.key)} style={{
                  background: recipientFilter === f.key ? GOLD : "none",
                  border: `1px solid ${recipientFilter === f.key ? GOLD : BORDER}`,
                  borderRadius: "20px", color: recipientFilter === f.key ? "#0e0b07" : DIM,
                  padding: "0.25rem 0.75rem", fontSize: "0.75rem", cursor: "pointer", fontWeight: recipientFilter === f.key ? 600 : 400,
                }}>
                  {f.label}
                </button>
              ))}
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: MUTED, cursor: "pointer", marginLeft: "auto" }}>
                <input type="checkbox" checked={skipAlreadySent} onChange={e => setSkipAlreadySent(e.target.checked)} style={{ accentColor: GOLD }} />
                Hide already sent
              </label>
              <button onClick={() => downloadCsv([
                ["Name", "Email", "Phone", "Card type", "Relation", "Email selected", "SMS selected"],
                ...unified.map(r => [r.name, r.email ?? "", r.phone ?? "", r.cardType, r.relation ?? "", r.emailChecked ? "Yes" : "No", r.smsChecked ? "Yes" : "No"]),
              ], "recipients")} style={btnGhost}>Export CSV</button>
            </div>

            {filteredUnified.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: DIM, fontSize: "0.85rem", fontStyle: "italic", background: BG, borderRadius: "6px" }}>
                {unified.length === 0
                  ? "No recipients found. Add email addresses or phone numbers in the records above."
                  : "No one matches this filter. Try a different group or uncheck 'Hide already sent'."}
              </div>
            ) : (
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}`, background: "#1e1a08" }}>
                      <th style={{ padding: "0.6rem 1rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Name</th>
                      <th style={{ padding: "0.6rem 0.5rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Card type</th>
                      <th style={{ padding: "0.6rem 0.5rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Relation</th>
                      <th style={{ padding: "0.6rem 0.5rem", textAlign: "center", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                          <input type="checkbox" style={{ accentColor: GOLD }}
                            checked={filteredUnified.filter(r => r.email).every(r => r.emailChecked)}
                            onChange={e => setUnified(prev => prev.map(r =>
                              filteredUnified.some(f => f.name === r.name) && r.email ? { ...r, emailChecked: e.target.checked } : r
                            ))}
                          />
                          <span>Email</span>
                        </div>
                      </th>
                      <th style={{ padding: "0.6rem 0.5rem", textAlign: "center", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
                          <input type="checkbox" style={{ accentColor: GOLD }}
                            checked={filteredUnified.filter(r => r.phone).every(r => r.smsChecked)}
                            onChange={e => setUnified(prev => prev.map(r =>
                              filteredUnified.some(f => f.name === r.name) && r.phone ? { ...r, smsChecked: e.target.checked } : r
                            ))}
                          />
                          <span>Text</span>
                        </div>
                      </th>
                      <th style={{ padding: "0.6rem 1rem", textAlign: "left", color: MUTED, fontWeight: 400, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnified.map((r, i) => (
                      <tr key={i} style={{ borderBottom: i < filteredUnified.length - 1 ? `1px solid ${BORDER}` : "none", background: (r.emailChecked || r.smsChecked) ? "#1e1a08" : "transparent" }}>
                        <td style={{ padding: "0.65rem 1rem", color: TEXT, fontWeight: 500, whiteSpace: "nowrap" }}>
                          {r.name}
                          {r.alreadySentEmail && r.email && <span style={{ color: DIM, fontSize: "0.7rem", marginLeft: "0.4rem" }}>✓ email sent</span>}
                          {r.alreadySentSms && r.phone && <span style={{ color: DIM, fontSize: "0.7rem", marginLeft: "0.4rem" }}>✓ text sent</span>}
                        </td>
                        <td style={{ padding: "0.65rem 0.5rem" }}>{cardTypeBadge(r.cardType)}</td>
                        <td style={{ padding: "0.65rem 0.5rem", color: MUTED, fontSize: "0.78rem" }}>{r.relation ?? <span style={{ color: DIM }}>—</span>}</td>
                        <td style={{ padding: "0.65rem 0.5rem", textAlign: "center" }}>
                          {r.email
                            ? <input type="checkbox" style={{ accentColor: GOLD, width: "16px", height: "16px" }}
                                checked={r.emailChecked}
                                onChange={e => setUnified(prev => prev.map(u => u.name === r.name ? { ...u, emailChecked: e.target.checked } : u))}
                              />
                            : <span style={{ color: DIM, fontSize: "0.7rem" }}>—</span>
                          }
                        </td>
                        <td style={{ padding: "0.65rem 0.5rem", textAlign: "center" }}>
                          {r.phone
                            ? <input type="checkbox" style={{ accentColor: GOLD, width: "16px", height: "16px" }}
                                checked={r.smsChecked}
                                onChange={e => setUnified(prev => prev.map(u => u.name === r.name ? { ...u, smsChecked: e.target.checked } : u))}
                              />
                            : <span style={{ color: DIM, fontSize: "0.7rem" }}>—</span>
                          }
                        </td>
                        <td style={{ padding: "0.65rem 1rem" }}>
                          <button onClick={() => handlePreview(r.cardType, r.email ?? undefined, r.contribution, { name: r.name, relation: r.relation, events: r.events, contribution: r.contribution })} style={btnGhost}>Preview</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "0.65rem 1rem", borderTop: `1px solid ${BORDER}`, fontSize: "0.78rem", color: MUTED }}>
                  <strong style={{ color: TEXT }}>{emailCount}</strong> email{emailCount !== 1 ? "s" : ""} · <strong style={{ color: TEXT }}>{smsCount}</strong> text{smsCount !== 1 ? "s" : ""} selected
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} style={btnSecondary}>← Back</button>
              <button onClick={() => setStep(3)} style={btnPrimary(emailCount === 0 && smsCount === 0)} disabled={emailCount === 0 && smsCount === 0}>
                Next: Review & Send →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review & Send ── */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ fontSize: "1.1rem", fontFamily: "Garamond, Georgia, serif", color: TEXT }}>
              Review & Send
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1rem" }}>
                <div style={{ fontSize: "0.7rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Email cards</div>
                <div style={{ fontSize: "1.5rem", fontFamily: "Garamond, Georgia, serif", color: emailCount > 0 ? GOLD : DIM }}>{emailCount}</div>
                <div style={{ fontSize: "0.78rem", color: DIM, marginBottom: emailCount > 0 ? "0.75rem" : 0 }}>
                  {emailCount === 0 ? "None selected" : `${emailCount} ${emailCount === 1 ? "person" : "people"} will receive an email`}
                </div>
                {emailCount > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {unified.filter(r => r.emailChecked && r.email).map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.82rem", color: TEXT }}>{r.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {cardTypeBadge(r.cardType)}
                          <button onClick={() => handlePreview(r.cardType, r.email!, r.contribution, { name: r.name, relation: r.relation, events: r.events, contribution: r.contribution })} style={btnGhost}>Preview</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1rem" }}>
                <div style={{ fontSize: "0.7rem", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>Text messages</div>
                <div style={{ fontSize: "1.5rem", fontFamily: "Garamond, Georgia, serif", color: smsCount > 0 ? GOLD : DIM }}>{smsCount}</div>
                <div style={{ fontSize: "0.78rem", color: DIM, marginBottom: smsCount > 0 ? "0.75rem" : 0 }}>
                  {smsCount === 0 ? "None selected" : `${smsCount} ${smsCount === 1 ? "person" : "people"} will receive a text`}
                </div>
                {smsCount > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    {unified.filter(r => r.smsChecked && r.phone).map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.82rem", color: TEXT }}>{r.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "0.7rem", color: DIM }}>{r.phone}</span>
                          {cardTypeBadge(r.cardType)}
                          <button onClick={() => handlePreview(r.cardType, undefined, r.contribution, { name: r.name, relation: r.relation, events: r.events, contribution: r.contribution })} style={btnGhost}>Preview</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: "#1f1208", border: "1px solid #4a2a0a", borderRadius: "6px", padding: "1rem", fontSize: "0.85rem", color: "#d4a86a", lineHeight: 1.6 }}>
              Once you click Send, cards will go out immediately and cannot be recalled. Please take a moment to preview a card above if you haven't already.
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setStep(2)} style={btnSecondary} disabled={sending}>← Back</button>
              <button onClick={handleSend} disabled={sending || (emailCount === 0 && smsCount === 0)} style={{
                ...btnPrimary(sending || (emailCount === 0 && smsCount === 0)),
                background: sending ? DIM : "#8b4a0a",
                minWidth: "200px",
              }}>
                {sending ? "Sending…" : `Send to ${emailCount + smsCount} ${emailCount + smsCount === 1 ? "person" : "people"}`}
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
