import { akanCulture } from "@/data/culture/akan";

/* ── Faithful SVG renderings of each Adinkra symbol ─────────── */

function GyeNyame() {
  // Gye Nyame — stylized fern-like form with bilateral symmetry
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 64 }}>
      {/* Central vertical stem */}
      <line x1="40" y1="10" x2="40" y2="70" stroke="#c8962e" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Top arc */}
      <path d="M28,18 Q40,6 52,18" stroke="#c8962e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Bottom arc */}
      <path d="M28,62 Q40,74 52,62" stroke="#c8962e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Left fronds */}
      <path d="M40,28 Q28,24 22,28 Q28,32 40,28Z" fill="#c8962e" opacity="0.85"/>
      <path d="M40,38 Q26,33 18,37 Q26,43 40,38Z" fill="#c8962e" opacity="0.85"/>
      <path d="M40,48 Q28,44 22,48 Q28,52 40,48Z" fill="#c8962e" opacity="0.85"/>
      {/* Right fronds */}
      <path d="M40,28 Q52,24 58,28 Q52,32 40,28Z" fill="#c8962e" opacity="0.85"/>
      <path d="M40,38 Q54,33 62,37 Q54,43 40,38Z" fill="#c8962e" opacity="0.85"/>
      <path d="M40,48 Q52,44 58,48 Q52,52 40,48Z" fill="#c8962e" opacity="0.85"/>
      {/* Center dot */}
      <circle cx="40" cy="40" r="3" fill="#f5ead8"/>
    </svg>
  );
}

function Sankofa() {
  // Sankofa — bird looking backward, heart-shaped body
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 64 }}>
      {/* Body — heart shape */}
      <path
        d="M40,62 C20,50 12,36 16,24 C18,16 26,12 32,16 C35,18 38,22 40,26 C42,22 45,18 48,16 C54,12 62,16 64,24 C68,36 60,50 40,62Z"
        fill="none" stroke="#c8962e" strokeWidth="2.2"
      />
      {/* Neck curving back */}
      <path d="M40,26 Q36,16 30,12 Q22,8 20,14" stroke="#c8962e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Head facing backward */}
      <circle cx="20" cy="13" r="5" stroke="#c8962e" strokeWidth="2" fill="none"/>
      {/* Beak */}
      <path d="M15,11 L10,9" stroke="#c8962e" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Eye */}
      <circle cx="19" cy="12" r="1.2" fill="#c8962e"/>
      {/* Tail feathers */}
      <path d="M40,62 Q44,70 50,72" stroke="#c8962e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M40,62 Q40,72 44,76" stroke="#c8962e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Egg on back */}
      <ellipse cx="40" cy="36" rx="6" ry="7" stroke="#c8962e" strokeWidth="1.8" fill="none"/>
    </svg>
  );
}

function Nkyinkyim() {
  // Nkyinkyim — S/Z twisting chain motif
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 64 }}>
      {/* Four interlocking twisted units forming a cross */}
      {/* Top unit */}
      <path d="M40,10 C32,10 28,18 36,22 C44,26 40,34 32,34" stroke="#c8962e" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Bottom unit */}
      <path d="M40,70 C48,70 52,62 44,58 C36,54 40,46 48,46" stroke="#c8962e" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Left unit */}
      <path d="M10,40 C10,32 18,28 22,36 C26,44 34,40 34,32" stroke="#c8962e" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Right unit */}
      <path d="M70,40 C70,48 62,52 58,44 C54,36 46,40 46,48" stroke="#c8962e" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Center knot */}
      <circle cx="40" cy="40" r="4" fill="#c8962e"/>
      <circle cx="40" cy="40" r="2" fill="#1a1410"/>
    </svg>
  );
}

function Dwennimmen() {
  // Dwennimmen — two rams' horns facing each other
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 64, height: 64 }}>
      {/* Top-left horn — curves outward then inward */}
      <path d="M40,40 C36,34 26,28 18,30 C10,32 8,42 14,46 C18,48 24,44 26,40 C28,36 32,36 36,40" stroke="#c8962e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Top-right horn */}
      <path d="M40,40 C44,34 54,28 62,30 C70,32 72,42 66,46 C62,48 56,44 54,40 C52,36 48,36 44,40" stroke="#c8962e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Bottom-left horn */}
      <path d="M40,40 C36,46 26,52 18,50 C10,48 8,38 14,34 C18,32 24,36 26,40 C28,44 32,44 36,40" stroke="#c8962e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Bottom-right horn */}
      <path d="M40,40 C44,46 54,52 62,50 C70,48 72,38 66,34 C62,32 56,36 54,40 C52,44 48,44 44,40" stroke="#c8962e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Center */}
      <circle cx="40" cy="40" r="5" stroke="#c8962e" strokeWidth="2" fill="none"/>
      <circle cx="40" cy="40" r="2" fill="#c8962e"/>
    </svg>
  );
}

const symbolComponents: Record<string, React.FC> = {
  "Gye Nyame":  GyeNyame,
  "Sankofa":    Sankofa,
  "Nkyinkyim":  Nkyinkyim,
  "Dwennimmen": Dwennimmen,
};

export default function AdinkraGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
      }}
    >
      {akanCulture.adinkra.map((a) => {
        const Symbol = symbolComponents[a.symbol];
        return (
          <div
            key={a.symbol}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "1.25rem",
            }}
          >
            {/* Symbol glyph */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
              {Symbol ? <Symbol /> : null}
            </div>

            <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>
              {a.symbol}
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--cream)", marginBottom: "0.5rem", fontStyle: "italic" }}>
              "{a.meaning}"
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
              {a.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
