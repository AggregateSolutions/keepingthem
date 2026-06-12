import { akanCulture } from "@/data/culture/akan";
import AdinkraGrid from "./AdinkraGrid";

export default function CultureGuide({ dressCode }: { dressCode: "black-and-white" | "red-and-black" }) {
  const dc = dressCode === "black-and-white"
    ? akanCulture.dressCode.elder
    : akanCulture.dressCode.standard;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* Dress code card */}
      <div className="info-card">
        <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
          Funeral attire — {dc.label}
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
          {dc.description}
        </p>
        <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>
            Thanksgiving attire — White
          </div>
          <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
            {akanCulture.dressCode.thanksgiving.description}
          </p>
        </div>
      </div>

      {/* Thanksgiving explanation */}
      <div className="info-card">
        <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
          {akanCulture.thanksgiving.title}
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
          {akanCulture.thanksgiving.body}
        </p>
      </div>

      {/* Akuapem context */}
      <div className="info-card">
        <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
          {akanCulture.akuapem.title}
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
          {akanCulture.akuapem.body}
        </p>
      </div>

      {/* Adinkra symbols */}
      <div>
        <div style={{ fontSize: "0.8rem", color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
          Adinkra symbols
        </div>
        <AdinkraGrid />
      </div>

    </div>
  );
}
