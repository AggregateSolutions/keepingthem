import { akanCulture } from "@/data/culture/akan";

const PNG_FILTER = "sepia(1) saturate(3) hue-rotate(5deg) brightness(0.85)";

const symbolImages: Record<string, string> = {
  "Gye Nyame":  "/GyeNyame.png",
  "Sankofa":    "/Sankofa.png",
  "Nkyinkyim":  "/NKYINKYIM.png",
  "Dwennimmen": "/DWENNIMMEN.png",
};

export default function AdinkraGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
      {akanCulture.adinkra.map((a) => {
        const pngSrc = symbolImages[a.symbol];
        return (
          <div
            key={a.symbol}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "6px", padding: "1.25rem" }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
              {pngSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pngSrc} alt={a.symbol} style={{ width: 64, height: 64, objectFit: "contain", filter: PNG_FILTER }} />
              ) : null}
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
