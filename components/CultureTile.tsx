"use client";

import Link from "next/link";

interface CultureTileProps {
  name: string;
  region: string;
  language: string;
  accentColor: string;
  slug?: string;
  live: boolean;
}

export default function CultureTile({ name, region, language, accentColor, slug, live }: CultureTileProps) {
  const inner = (
    <div
      style={{
        background: live ? "var(--bg-card)" : "#1a1612",
        border: `1px solid ${live ? "#4a3a28" : "#2a2218"}`,
        borderRadius: "6px",
        overflow: "hidden",
        opacity: live ? 1 : 0.55,
        transition: "border-color 0.2s, opacity 0.2s",
        height: "100%",
      }}
      onMouseEnter={live ? e => (e.currentTarget.style.borderColor = accentColor) : undefined}
      onMouseLeave={live ? e => (e.currentTarget.style.borderColor = "#4a3a28") : undefined}
    >
      {/* Accent stripe */}
      <div style={{ height: 4, background: accentColor, opacity: live ? 1 : 0.4 }} />
      <div style={{ padding: "1.1rem 1.25rem 1.25rem" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 500, color: live ? "var(--cream)" : "var(--text-faint)", marginBottom: "0.2rem" }}>
          {name}
        </div>
        <div style={{ fontSize: "0.78rem", color: live ? "var(--text-muted)" : "var(--text-faint)", letterSpacing: "0.05em", marginBottom: "0.6rem" }}>
          {region} · {language}
        </div>
        {live ? (
          <div style={{ fontSize: "0.78rem", color: accentColor, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            View memorials →
          </div>
        ) : (
          <div style={{ fontSize: "0.75rem", color: "#3d3028", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Coming soon
          </div>
        )}
      </div>
    </div>
  );

  if (live && slug) {
    return (
      <Link href={slug} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        {inner}
      </Link>
    );
  }
  return <div style={{ height: "100%" }}>{inner}</div>;
}
