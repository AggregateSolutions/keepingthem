import type { MemorialConfig } from "@/types/memorial";

export default function ProgramSection({ program, adinkra }: { program: MemorialConfig["program"]; adinkra: MemorialConfig["adinkra"] }) {
  return (
    <>
      <div className="info-card" style={{ marginBottom: "1rem" }}>
        <div style={{ fontSize: "0.8rem", color: "#7a6a52", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>
          Officiant
        </div>
        <div style={{ color: "var(--text-mid)" }}>{program.officiant}</div>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {program.items.map((item, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "0.7rem 0",
              borderBottom: i < program.items.length - 1 ? "1px solid var(--brown-dark)" : "none",
              fontSize: "0.95rem",
              color: "var(--text-mid)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1rem",
                color: "var(--gold)",
                minWidth: "1.5rem",
                paddingTop: 1,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: "var(--text-main)", fontWeight: 500, display: "block" }}>
                {item.title}
              </strong>
              {item.sub && (
                <span style={{ fontSize: "0.82rem", color: "#7a6a52" }}>{item.sub}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="info-card" style={{ marginTop: "1.5rem", borderColor: "#5a3a1a" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
          Adinkra symbol
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", color: "var(--cream)", marginBottom: "0.3rem" }}>
          {adinkra.symbol}
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
          {adinkra.meaning}
        </div>
      </div>
    </>
  );
}
