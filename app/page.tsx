import Link from "next/link";
import Image from "next/image";
import LotusStripe from "@/components/LotusStripe";
import CultureTile from "@/components/CultureTile";

// Drop the direct CDN URL here when you have it from Pixabay
const HERO_IMAGE_URL = "";

const cultures = [
  { name: "Akan",            region: "Ghana",          language: "Twi",        accentColor: "#c8962e", slug: "/akan", live: true  },
  { name: "Yoruba",          region: "Nigeria",        language: "Yorùbá",     accentColor: "#6b4c9a", slug: "",      live: false },
  { name: "Irish",           region: "Ireland",        language: "Gaeilge",    accentColor: "#3a7a4a", slug: "",      live: false },
  { name: "Japanese",        region: "Japan",          language: "日本語",      accentColor: "#9a2a2a", slug: "",      live: false },
  { name: "Arabic / Levant", region: "Middle East",    language: "عربي",       accentColor: "#2a6a7a", slug: "",      live: false },
  { name: "Eastern European",region: "Poland · Ukraine",language: "Słowiański",accentColor: "#6a3a7a", slug: "",      live: false },
];

// Multi-language grief phrases — one from each tradition
const phrases = [
  { text: "They are not gone — they are kept.",       lang: "English"  },
  { text: "Wɔawu, nanso wɔte ase wɔ yɛn koma mu.",   lang: "Twi · Akan"    },
  { text: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",         lang: "Arabic"  },
  { text: "安らかに眠れ。あなたは忘れられない。",                  lang: "Japanese" },
  { text: "Ar dheis Dé go raibh a anam.",             lang: "Irish Gaelic" },
  { text: "Niech spoczywa w pokoju.",                 lang: "Polish" },
];

export default function Home() {
  return (
    <div style={{ background: "#211d19", minHeight: "100vh", color: "var(--text-main)" }}>

      {/* ── Top lotus stripe ── */}
      <LotusStripe />

      {/* ── Hero ── */}
      <section
        style={{
          position: "relative",
          minHeight: "72vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Hero image or gradient fallback */}
        {HERO_IMAGE_URL ? (
          <Image
            src={HERO_IMAGE_URL}
            alt="People from many cultures coming together in remembrance"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            unoptimized
          />
        ) : (
          <div
            style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 50% 60%, #3a2e22 0%, #1a1410 55%, #0f0c09 100%)",
            }}
          />
        )}

        {/* Overlay */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: HERO_IMAGE_URL
              ? "linear-gradient(to bottom, rgba(15,12,9,0.55) 0%, rgba(15,12,9,0.72) 60%, rgba(15,12,9,0.92) 100%)"
              : "transparent",
          }}
        />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 1, padding: "4rem 1.5rem", maxWidth: 700 }}>

          {/* Lotus ornament above wordmark */}
          <div style={{ marginBottom: "1.5rem" }} aria-hidden="true">
            <LotusOrnament />
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.4rem, 7vw, 4rem)",
              fontWeight: 400,
              color: "var(--cream)",
              letterSpacing: "0.04em",
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}
          >
            keepingthem.net
          </h1>

          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)",
              fontStyle: "italic",
              color: "#c4b49a",
              lineHeight: 1.75,
              marginBottom: "1.75rem",
              maxWidth: 520,
              margin: "0 auto 1.75rem",
            }}
          >
            A place to keep them, in the tradition of their people.
          </p>

          <div
            style={{
              width: 48,
              height: 1,
              background: "var(--gold)",
              margin: "0 auto 1.75rem",
            }}
          />

          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--text-muted)",
              lineHeight: 1.85,
              maxWidth: 480,
              margin: "0 auto 2.5rem",
            }}
          >
            Multicultural digital memorials — honoring the living memory of those we love through the ceremonies, languages, and wisdom of their people.
          </p>

          <Link
            href="/akan"
            style={{
              display: "inline-block",
              padding: "0.8rem 2.2rem",
              background: "transparent",
              border: "1px solid var(--gold)",
              borderRadius: "2px",
              color: "var(--gold)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            View Akan Memorials
          </Link>
        </div>
      </section>

      {/* ── Lotus divider ── */}
      <LotusStripe />

      {/* ── Multi-language grief phrases ── */}
      <section
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "3.5rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--text-faint)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "2rem",
          }}
        >
          In every language, every tradition
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {phrases.map((p) => (
            <div key={p.lang}>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1rem, 2.2vw, 1.2rem)",
                  fontStyle: "italic",
                  color: "#c4b49a",
                  lineHeight: 1.5,
                  marginBottom: "0.15rem",
                }}
              >
                {p.text}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-faint)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {p.lang}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lotus divider ── */}
      <LotusStripe />

      {/* ── Culture tiles ── */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "3.5rem 1.25rem 4.5rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
              fontWeight: 400,
              color: "var(--cream)",
              marginBottom: "0.5rem",
            }}
          >
            Honor their tradition
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: 480, margin: "0 auto" }}>
            Each culture directory holds memorials shaped by its own ceremonies, language, and way of remembrance.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1rem",
          }}
        >
          {cultures.map((c) => (
            <CultureTile
              key={c.name}
              name={c.name}
              region={c.region}
              language={c.language}
              accentColor={c.accentColor}
              slug={c.slug}
              live={c.live}
            />
          ))}
        </div>
      </section>

      {/* ── Bottom lotus stripe ── */}
      <LotusStripe flip />

      {/* ── Footer ── */}
      <footer
        style={{
          background: "#0f0c09",
          borderTop: "1px solid #2a2218",
          textAlign: "center",
          padding: "1.5rem 1.25rem",
          fontSize: "0.75rem",
          color: "var(--text-faint)",
          lineHeight: 2,
        }}
      >
        <div style={{ marginBottom: "0.4rem" }}>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#5a4a38" }}>keepingthem.net</span>
        </div>
        Honoring lives across cultures · Built with care for the families who grieve
      </footer>
    </div>
  );
}

/* ── Inline lotus / chrysanthemum ornament ── */
function LotusOrnament() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.75 }}
    >
      {/* 8 petals radiating from center — chrysanthemum / lotus form */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8;
        return (
          <g key={i} transform={`rotate(${angle}, 32, 32)`}>
            <path
              d="M32,32 C30,26 30,18 32,14 C34,18 34,26 32,32Z"
              fill={i % 2 === 0 ? "#c8962e" : "#6b8cba"}
              opacity={i % 2 === 0 ? 0.85 : 0.6}
            />
          </g>
        );
      })}
      {/* Inner ring */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8 + 22.5;
        return (
          <g key={`inner-${i}`} transform={`rotate(${angle}, 32, 32)`}>
            <path
              d="M32,32 C31,28 31,22 32,19 C33,22 33,28 32,32Z"
              fill="#c4b49a"
              opacity="0.4"
            />
          </g>
        );
      })}
      {/* Center circle */}
      <circle cx="32" cy="32" r="4" fill="#c8962e" opacity="0.9" />
      <circle cx="32" cy="32" r="2" fill="#f5ead8" opacity="0.8" />
    </svg>
  );
}
