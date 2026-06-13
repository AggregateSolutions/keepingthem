import type { MemorialConfig } from "@/types/memorial";

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-dim)", flexShrink: 0 }}>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.13.96.36 1.9.69 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0122 14.92z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-dim)", flexShrink: 0 }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export default function FloristGrid({ florists }: { florists: MemorialConfig["florists"] }) {
  return (
    <>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
        If you'd like to send flowers, the florists below are local to the service and can arrange delivery. There is no obligation — your presence alone is a gift to the family.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {florists.map((f) => (
          <div
            key={f.name}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "1rem 1.25rem",
            }}
          >
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--cream)", marginBottom: "0.5rem" }}>
              {f.name}
            </h4>
            {f.address && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.4rem", marginBottom: "0.3rem" }}>
                <PinIcon />
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{f.address}</span>
              </div>
            )}
            {f.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                <PhoneIcon />
                <a
                  href={`tel:${f.phone.replace(/\D/g, "")}`}
                  style={{ color: "var(--gold)", fontSize: "0.85rem", textDecoration: "none" }}
                >
                  {f.phone}
                </a>
              </div>
            )}
            {f.url && (
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--gold)", fontSize: "0.82rem", display: "block", marginTop: "0.4rem", textDecoration: "none" }}
              >
                Visit website ↗
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
