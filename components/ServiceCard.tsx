import type { MemorialConfig } from "@/types/memorial";

function ForkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-dim)", flexShrink: 0, marginTop: 3 }}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-dim)", flexShrink: 0, marginTop: 3 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-dim)", flexShrink: 0, marginTop: 3 }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-dim)", flexShrink: 0, marginTop: 3 }}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.13.96.36 1.9.69 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0122 14.92z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-dim)", flexShrink: 0, marginTop: 3 }}>
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.9rem", color: "var(--text-mid)", marginBottom: "0.35rem" }}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

interface Props {
  viewing?: MemorialConfig["viewing"];
  funeral: MemorialConfig["funeralService"];
  reception?: MemorialConfig["reception"];
  thanksgiving: MemorialConfig["thanksgiving"];
}

export default function ServiceCard({ viewing, funeral, reception, thanksgiving }: Props) {
  return (
    <>
      {viewing && (
        <div className="info-card">
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--gold)", marginBottom: "0.6rem" }}>
            Viewing
          </h3>
          <InfoRow icon={<CalendarIcon />}>{viewing.date} · {viewing.startTime} – {viewing.endTime}</InfoRow>
        </div>
      )}

      <div className="info-card">
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--gold)", marginBottom: "0.6rem" }}>
          Funeral service
        </h3>
        <InfoRow icon={<CalendarIcon />}>{funeral.date} · {funeral.time}</InfoRow>
        <InfoRow icon={<PinIcon />}>{funeral.address}</InfoRow>
        <InfoRow icon={<PhoneIcon />}>
          <a href={`tel:${funeral.phone.replace(/\D/g, "")}`} style={{ color: "var(--gold)", textDecoration: "none" }}>
            {funeral.phone}
          </a>
        </InfoRow>
        <InfoRow icon={<ClockIcon />}>{funeral.name}</InfoRow>
      </div>

      {reception && (
        <div className="info-card">
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--gold)", marginBottom: "0.6rem" }}>
            Reception
          </h3>
          <InfoRow icon={<CalendarIcon />}>{reception.date} · {reception.time}</InfoRow>
          <InfoRow icon={<PinIcon />}>{reception.name} — {reception.address}</InfoRow>
          {reception.notes && (
            <InfoRow icon={<ForkIcon />}>{reception.notes}</InfoRow>
          )}
        </div>
      )}

      <div className="info-card">
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "var(--gold)", marginBottom: "0.6rem" }}>
          Thanksgiving celebration
        </h3>
        <InfoRow icon={<CalendarIcon />}>{thanksgiving.date} · {thanksgiving.time}</InfoRow>
        <InfoRow icon={<PinIcon />}>{thanksgiving.location}</InfoRow>
        <p style={{ fontSize: "0.82rem", color: "#7a6a52", marginTop: "0.6rem", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
          A celebration of a life well-lived, held in the tradition of our people.
        </p>
      </div>
    </>
  );
}
