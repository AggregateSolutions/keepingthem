import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import KenteStripe from "@/components/KenteStripe";
import ServiceCard from "@/components/ServiceCard";
import StreamBanner from "@/components/StreamBanner";
import FloristGrid from "@/components/FloristGrid";
import ProgramSection from "@/components/ProgramSection";
import CultureGuide from "@/components/CultureGuide";
import RsvpForm from "@/components/RsvpForm";
import PhotoSlideshow from "@/components/PhotoSlideshow";
import StickyRsvpButton from "@/components/StickyRsvpButton";
import akanMemorials from "@/data/akan";
import type { MemorialConfig } from "@/types/memorial";

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

  const photo = m.photos[0];
  const ogImage = photo
    ? `https://keepingthem.net${photo.src}`
    : "https://keepingthem.net/og-default.png";

  const serviceDetail = `Funeral · ${m.funeralService.date} · ${m.funeralService.time} · ${m.funeralService.name}`;
  const description = `${m.tribute} ${serviceDetail}`;

  return {
    title: `In memoriam · ${m.name} · keepingthem.net`,
    description,
    openGraph: {
      title: `In memoriam · ${m.name}`,
      description,
      url: `https://keepingthem.net/akan/${slug}`,
      siteName: "keepingthem.net",
      images: [{ url: ogImage, width: 1200, height: 630, alt: `In memoriam · ${m.name}` }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `In memoriam · ${m.name}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function MemorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = memorials[slug];
  if (!m) notFound();

  return (
    <>
      <KenteStripe />

      {/* ── Site header ── */}
      <header style={{ background: "var(--bg-deep)", borderBottom: "1px solid var(--border)", padding: "2.5rem 1.5rem 2rem", textAlign: "center" }}>
        <nav style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/akan" style={{ color: "var(--gold)", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            ← Akan Memorials
          </Link>
          <Link href={`/akan/${slug}/flyer`} style={{ color: "var(--gold)", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid var(--gold)", padding: "0.3rem 0.75rem", borderRadius: "4px" }}>
            Flyer
          </Link>
        </nav>
        <div style={{ fontSize: "48px", color: "var(--gold)", marginBottom: "0.5rem", fontFamily: "serif" }} aria-hidden="true">☥</div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 6vw, 3.2rem)", fontWeight: 500, color: "var(--cream)", letterSpacing: "0.03em", marginBottom: "0.2rem" }}>
          {m.name}
        </h1>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", color: "var(--gold)", letterSpacing: "0.15em", marginBottom: "0.4rem" }}>
          {m.years}
        </div>
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {m.title}
        </div>
      </header>

      {/* ── In-page nav ── */}
      <nav style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 0, background: "var(--bg-deep)", borderBottom: "1px solid var(--border)", padding: "0 1rem" }}>
        {[
          ["#remembrance", "Remembrance"],
          ["#service", "Service Details"],
          ["#stream", "Watch Live"],
          ["#flowers", "Send Flowers"],
          ["#program", "Program"],
          ["#culture", "Culture Guide"],
          ["#rsvp", "RSVP"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            style={{ color: "var(--gold)", textDecoration: "none", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0.85rem 1rem", borderBottom: "2px solid transparent", display: "inline-block" }}
          >
            {label}
          </a>
        ))}
      </nav>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "2rem 1.25rem 4rem" }}>

        {/* ── Remembrance ── */}
        <section id="remembrance" style={{ marginBottom: "3rem" }}>
          {m.photos.length > 0 ? (
            <PhotoSlideshow photos={m.photos} defaultDuration={8000} />
          ) : (
            <div style={{ background: "#2a1e10", border: "1px solid var(--border)", borderRadius: "4px", padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: "var(--text-faint)", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.4 }}>
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <span>Photos coming soon</span>
            </div>
          )}
          <div className="section-title">In remembrance</div>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontStyle: "italic", color: "#d4c4aa", lineHeight: 1.9, borderLeft: "2px solid var(--gold)", paddingLeft: "1.25rem", marginBottom: "1.5rem" }}>
            {m.tribute}
          </p>
        </section>

        {/* ── Service Details ── */}
        <section id="service" style={{ marginBottom: "3rem" }}>
          <div className="section-title">Service details</div>
          <ServiceCard viewing={m.viewing} funeral={m.funeralService} reception={m.reception} thanksgiving={m.thanksgiving} slug={slug} />
        </section>

        {/* ── Watch Live ── */}
        <section id="stream" style={{ marginBottom: "3rem" }}>
          <div className="section-title">Watch live</div>
          <StreamBanner url={m.stream.url} label={m.stream.label} />
        </section>

        {/* ── Send Flowers ── */}
        <section id="flowers" style={{ marginBottom: "3rem" }}>
          <div className="section-title">Send flowers</div>
          <FloristGrid florists={m.florists} />
        </section>

        {/* ── Order of Service ── */}
        <section id="program" style={{ marginBottom: "3rem" }}>
          <div className="section-title">Order of service</div>
          <ProgramSection program={m.program} adinkra={m.adinkra} />
        </section>

        {/* ── Akan Culture Guide ── */}
        <section id="culture" style={{ marginBottom: "3rem" }}>
          <div className="section-title">Akan culture guide</div>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: 1.8 }}>
            For guests who may be less familiar with Akan funeral traditions, the following is offered as a guide to honor the family and participate with cultural awareness.
          </p>
          <CultureGuide dressCode={m.dressCode} />
        </section>

        {/* ── RSVP ── */}
        <section id="rsvp" style={{ marginBottom: "3rem" }}>
          <div className="section-title">RSVP</div>
          <RsvpForm funeral={m.funeralService} thanksgiving={m.thanksgiving} reception={m.reception} memorialSlug={m.slug} culture={m.culture} />
        </section>

      </main>

      {/* ── Footer adinkra ── */}
      <div style={{ textAlign: "center", padding: "2rem 1rem 1rem", color: "var(--text-faint)", fontSize: "0.8rem" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
          <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.45">
            {/* Gye Nyame — vertical trunk with cross bars and curved terminals */}
            <line x1="24" y1="4" x2="24" y2="52" stroke="#c8962e" strokeWidth="2"/>
            {/* Top horizontal bar */}
            <line x1="10" y1="12" x2="38" y2="12" stroke="#c8962e" strokeWidth="2"/>
            <path d="M10 12 Q6 12 6 8 Q6 4 10 4" stroke="#c8962e" strokeWidth="1.5" fill="none"/>
            <path d="M38 12 Q42 12 42 8 Q42 4 38 4" stroke="#c8962e" strokeWidth="1.5" fill="none"/>
            {/* Middle horizontal bar */}
            <line x1="8" y1="28" x2="40" y2="28" stroke="#c8962e" strokeWidth="2"/>
            <path d="M8 28 Q3 28 3 24 Q3 20 8 20" stroke="#c8962e" strokeWidth="1.5" fill="none"/>
            <path d="M40 28 Q45 28 45 24 Q45 20 40 20" stroke="#c8962e" strokeWidth="1.5" fill="none"/>
            {/* Bottom horizontal bar */}
            <line x1="10" y1="44" x2="38" y2="44" stroke="#c8962e" strokeWidth="2"/>
            <path d="M10 44 Q6 44 6 48 Q6 52 10 52" stroke="#c8962e" strokeWidth="1.5" fill="none"/>
            <path d="M38 44 Q42 44 42 48 Q42 52 38 52" stroke="#c8962e" strokeWidth="1.5" fill="none"/>
            {/* Centre diamond */}
            <rect x="20" y="24" width="8" height="8" transform="rotate(45 24 28)" fill="#c8962e" opacity="0.6"/>
          </svg>
        </div>
        <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.95rem", color: "var(--text-faint)" }}>
          {m.adinkra.symbol} — {m.adinkra.meaning}
        </p>
      </div>

      <StickyRsvpButton />

      <KenteStripe />

      <footer style={{ background: "var(--bg-deep)", borderTop: "1px solid var(--border)", textAlign: "center", padding: "1.25rem", fontSize: "0.75rem", color: "var(--text-faint)" }}>
        In loving memory &nbsp;·&nbsp; {m.name} &nbsp;·&nbsp; {m.years}
      </footer>
    </>
  );
}
