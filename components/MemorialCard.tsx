"use client";

import Link from "next/link";

interface Props {
  slug: string;
  name: string;
  years: string;
  description: string;
  service: string;
  culture: string;
}

export default function MemorialCard({ slug, name, years, description, service, culture }: Props) {
  return (
    <Link href={`/${culture}/${slug}`} style={{ textDecoration: "none", display: "block", marginBottom: "1rem" }}>
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "1.5rem",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 500, color: "var(--cream)" }}>
            {name}
          </h2>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--gold)", letterSpacing: "0.1em" }}>
            {years}
          </span>
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "0.75rem" }}>
          {description}
        </p>
        <div style={{ fontSize: "0.8rem", color: "var(--text-faint)", letterSpacing: "0.04em" }}>
          Service — {service} &nbsp;·&nbsp; <span style={{ color: "var(--gold)" }}>View memorial →</span>
        </div>
      </div>
    </Link>
  );
}
