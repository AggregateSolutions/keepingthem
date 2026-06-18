import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import KenteStripe from "@/components/KenteStripe";
import akanMemorials from "@/data/akan";
import type { MemorialConfig } from "@/types/memorial";
import GuestbookClient from "./GuestbookClient";

const memorials: Record<string, MemorialConfig> = Object.fromEntries(
  akanMemorials.map((m) => [m.slug, m])
);

export function generateStaticParams() {
  return akanMemorials.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = memorials[slug];
  if (!m) return {};
  return { title: `Tributes · ${m.name} · keepingthem.net` };
}

export default async function GuestbookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = memorials[slug];
  if (!m) notFound();

  return (
    <>
      <KenteStripe />

      <header style={{ background: "var(--bg-deep)", borderBottom: "1px solid var(--border)", padding: "2rem 1.5rem 1.75rem", textAlign: "center" }}>
        <nav style={{ marginBottom: "1.25rem" }}>
          <Link href={`/akan/${slug}`} style={{ color: "var(--gold)", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ← Back to memorial
          </Link>
        </nav>
        <div style={{ fontSize: "0.75rem", color: "var(--gold)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
          Tributes &amp; Messages
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.6rem, 5vw, 2.4rem)", fontWeight: 400, color: "var(--cream)", letterSpacing: "0.03em", marginBottom: "0.2rem" }}>
          {m.name}
        </h1>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--gold)", letterSpacing: "0.12em" }}>
          {m.years}
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>
        <GuestbookClient slug={slug} name={m.name} />
      </main>

      <KenteStripe />

      <footer style={{ background: "var(--bg-deep)", borderTop: "1px solid var(--border)", textAlign: "center", padding: "1.25rem", fontSize: "0.75rem", color: "var(--text-faint)" }}>
        In loving memory &nbsp;·&nbsp; {m.name} &nbsp;·&nbsp; {m.years}
      </footer>
    </>
  );
}
