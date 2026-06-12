import Link from "next/link";
import type { Metadata } from "next";
import KenteStripe from "@/components/KenteStripe";
import MemorialCard from "@/components/MemorialCard";
import akanMemorials from "@/data/akan";

export const metadata: Metadata = {
  title: "Akan Memorials — keepingthem.net",
  description: "Honoring Akan lives through culturally-grounded digital memorials.",
};

export default function AkanDirectory() {
  return (
    <>
      <KenteStripe />

      <header style={{ background: "var(--bg-deep)", borderBottom: "1px solid var(--border)", padding: "2.5rem 1.5rem 2rem", textAlign: "center" }}>
        <nav style={{ marginBottom: "2rem" }}>
          <Link href="/" style={{ color: "var(--gold)", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ← keepingthem.net
          </Link>
        </nav>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 500, color: "var(--cream)", letterSpacing: "0.03em", marginBottom: "0.4rem" }}>
          Akan Memorials
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
          Ghana · Akan people · Funeral &amp; Thanksgiving traditions
        </p>
      </header>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "2.5rem 1.25rem 4rem" }}>
        <p style={{ fontSize: "0.9rem", color: "var(--text-faint)", marginBottom: "2rem", lineHeight: 1.8 }}>
          The Akan people of Ghana mark death and homegoing through ceremony, remembrance, and thanksgiving — a tradition that honors both the grief of those left behind and the completion of a life well-lived. Each memorial on this page holds the spirit of that tradition.
        </p>

        <div>
          {akanMemorials.map((m) => (
            <MemorialCard
              key={m.slug}
              slug={m.slug}
              name={m.name}
              years={m.years}
              description={m.title}
              service={m.funeralService.date}
              culture="akan"
            />
          ))}
        </div>
      </main>

      <KenteStripe />
      <footer style={{ background: "var(--bg-deep)", borderTop: "1px solid var(--border)", textAlign: "center", padding: "1.25rem", fontSize: "0.75rem", color: "var(--text-faint)" }}>
        keepingthem.net — Akan memorials
      </footer>
    </>
  );
}
