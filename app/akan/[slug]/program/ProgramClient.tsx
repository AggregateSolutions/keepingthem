"use client";

import type { MemorialConfig } from "@/types/memorial";
import Image from "next/image";

const GOLD = "#c8962e";
const CREAM = "#f5ead8";
const DARK_TEXT = "#1a1208";
const MID_TEXT = "#4a3820";
const FAINT_TEXT = "#9a7a52";
const BORDER = "#d4a84a";
const PAGE_BG = "#fdf6ec";

/* ── Shared decorative elements ─────────────────────────────── */

function KenteBorder({ height = 10 }: { height?: number }) {
  const colors = ["#c8962e","#1a5c1a","#8b1a1a","#c8962e","#1a5c1a","#8b1a1a","#c8962e","#1a5c1a","#8b1a1a","#c8962e","#1a5c1a","#8b1a1a"];
  return (
    <div style={{ display: "flex", height }}>
      {colors.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
    </div>
  );
}

function GoldRule() {
  return <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`, margin: "0.5rem 0" }} />;
}

function CornerFlower({ size = 48, flip = false }: { size?: number; flip?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <path d="M2 50 Q10 30 26 26 Q30 10 50 2" stroke={GOLD} strokeWidth="0.8" opacity="0.5" fill="none"/>
      <path d="M2 35 Q8 28 14 32" stroke={GOLD} strokeWidth="0.7" opacity="0.35" fill="none"/>
      <path d="M18 14 Q24 8 28 16" stroke={GOLD} strokeWidth="0.7" opacity="0.35" fill="none"/>
      <ellipse cx="10" cy="40" rx="4" ry="2" fill={GOLD} opacity="0.25" transform="rotate(-40 10 40)"/>
      <ellipse cx="22" cy="22" rx="4" ry="2" fill={GOLD} opacity="0.25" transform="rotate(-45 22 22)"/>
      <ellipse cx="38" cy="10" rx="4" ry="2" fill={GOLD} opacity="0.25" transform="rotate(-30 38 10)"/>
      <circle cx="26" cy="26" r="4.5" fill={GOLD} opacity="0.7"/>
      <ellipse cx="26" cy="18" rx="2.5" ry="5.5" fill={GOLD} opacity="0.4"/>
      <ellipse cx="26" cy="34" rx="2.5" ry="5.5" fill={GOLD} opacity="0.4"/>
      <ellipse cx="18" cy="26" rx="5.5" ry="2.5" fill={GOLD} opacity="0.4"/>
      <ellipse cx="34" cy="26" rx="5.5" ry="2.5" fill={GOLD} opacity="0.4"/>
      <ellipse cx="20" cy="20" rx="2.5" ry="5.5" fill={GOLD} opacity="0.25" transform="rotate(-45 20 20)"/>
      <ellipse cx="32" cy="20" rx="2.5" ry="5.5" fill={GOLD} opacity="0.25" transform="rotate(45 32 20)"/>
      <circle cx="26" cy="26" r="2" fill={PAGE_BG} opacity="0.6"/>
    </svg>
  );
}

function FloralDivider() {
  return (
    <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
      <svg width="300" height="36" viewBox="0 0 300 36" fill="none">
        <path d="M0 18 Q40 12 80 18 Q100 22 110 16" stroke={GOLD} strokeWidth="0.8" opacity="0.45" fill="none"/>
        <path d="M190 16 Q200 22 220 18 Q260 12 300 18" stroke={GOLD} strokeWidth="0.8" opacity="0.45" fill="none"/>
        <ellipse cx="30" cy="13" rx="5" ry="2.5" fill={GOLD} opacity="0.2" transform="rotate(-15 30 13)"/>
        <ellipse cx="65" cy="21" rx="5" ry="2.5" fill={GOLD} opacity="0.2" transform="rotate(10 65 21)"/>
        <ellipse cx="235" cy="21" rx="5" ry="2.5" fill={GOLD} opacity="0.2" transform="rotate(20 235 21)"/>
        <ellipse cx="270" cy="13" rx="5" ry="2.5" fill={GOLD} opacity="0.2" transform="rotate(-10 270 13)"/>
        <circle cx="150" cy="18" r="5" fill={GOLD} opacity="0.8"/>
        <ellipse cx="150" cy="8" rx="3" ry="6" fill={GOLD} opacity="0.4"/>
        <ellipse cx="150" cy="28" rx="3" ry="6" fill={GOLD} opacity="0.4"/>
        <ellipse cx="140" cy="18" rx="6" ry="3" fill={GOLD} opacity="0.4"/>
        <ellipse cx="160" cy="18" rx="6" ry="3" fill={GOLD} opacity="0.4"/>
        <ellipse cx="143" cy="11" rx="3" ry="6" fill={GOLD} opacity="0.25" transform="rotate(-45 143 11)"/>
        <ellipse cx="157" cy="11" rx="3" ry="6" fill={GOLD} opacity="0.25" transform="rotate(45 157 11)"/>
        <ellipse cx="143" cy="25" rx="3" ry="6" fill={GOLD} opacity="0.25" transform="rotate(45 143 25)"/>
        <ellipse cx="157" cy="25" rx="3" ry="6" fill={GOLD} opacity="0.25" transform="rotate(-45 157 25)"/>
        <circle cx="150" cy="18" r="2.5" fill={PAGE_BG} opacity="0.7"/>
      </svg>
    </div>
  );
}

function AdinkraWatermark() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/GyeNyame.png" alt="" style={{ width: 180, height: 180, objectFit: "contain", opacity: 0.04, filter: "sepia(1) saturate(2) hue-rotate(5deg)" }} />
    </div>
  );
}

function PageBorder({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: "relative",
      background: PAGE_BG,
      border: `2px solid ${BORDER}`,
      margin: "0 auto",
      width: "5.5in",
      minHeight: "8.5in",
      boxSizing: "border-box",
      pageBreakAfter: "always",
      ...style,
    }}>
      {/* Inner border line */}
      <div style={{
        position: "absolute",
        inset: 6,
        border: `0.5px solid ${GOLD}`,
        opacity: 0.4,
        pointerEvents: "none",
      }} />
      {children}
    </div>
  );
}

/* ── Pages ──────────────────────────────────────────────────── */

function CoverPage({ m }: { m: MemorialConfig }) {
  const photo = m.photos[0];
  return (
    <PagePage>
      <KenteBorder height={12} />
      <div style={{ padding: "0.5in 0.5in 0.35in", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", position: "relative" }}>
        {/* Corner flowers */}
        <div style={{ position: "absolute", top: "0.5in", left: "0.4in" }}><CornerFlower size={52} /></div>
        <div style={{ position: "absolute", top: "0.5in", right: "0.4in" }}><CornerFlower size={52} flip /></div>

        <div style={{ fontSize: "0.55rem", color: FAINT_TEXT, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "0.6rem" }}>
          In Loving Memory
        </div>
        <FloralDivider />
        <h1 style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 400, color: DARK_TEXT, textAlign: "center", margin: "0.1rem 0", letterSpacing: "0.03em", lineHeight: 1.2 }}>
          {m.name}
        </h1>
        <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "1rem", color: GOLD, letterSpacing: "0.14em", margin: "0.1rem 0" }}>
          {m.years}
        </div>
        <div style={{ fontSize: "0.6rem", color: FAINT_TEXT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.3rem" }}>
          {m.title}
        </div>
        <GoldRule />
      </div>

      {/* Photo */}
      {photo && (
        <div style={{ position: "relative", width: "100%", height: "3.2in", overflow: "hidden" }}>
          <Image src={photo.src} alt={photo.alt} fill style={{ objectFit: "cover", objectPosition: "center 20%" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(253,246,236,0.15) 0%, transparent 20%, transparent 75%, rgba(253,246,236,0.8) 100%)` }} />
        </div>
      )}

      {/* Service info */}
      <div style={{ padding: "0.25in 0.5in 0.1in", textAlign: "center" }}>
        <FloralDivider />
        <div style={{ fontSize: "0.65rem", color: FAINT_TEXT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.2rem" }}>
          Funeral Service
        </div>
        <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.85rem", color: DARK_TEXT, lineHeight: 1.7 }}>
          {m.funeralService.date} · {m.funeralService.time}<br />
          {m.funeralService.name}<br />
          <span style={{ fontSize: "0.75rem", color: MID_TEXT }}>{m.funeralService.address}</span>
        </div>
        {m.viewing && (
          <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.75rem", color: MID_TEXT, marginTop: "0.15rem" }}>
            Viewing: {m.viewing.date} · {m.viewing.startTime} – {m.viewing.endTime}
          </div>
        )}
        <div style={{ marginTop: "0.2rem", display: "flex", justifyContent: "space-between" }}>
          <CornerFlower size={40} />
          <CornerFlower size={40} flip />
        </div>
      </div>
      <KenteBorder height={12} />
    </PagePage>
  );
}

function TributePage({ m }: { m: MemorialConfig }) {
  const photo = m.photos[1] ?? m.photos[0];
  return (
    <PagePage>
      <KenteBorder height={8} />
      <div style={{ padding: "0.4in 0.5in 0.2in", position: "relative" }}>
        <AdinkraWatermark />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionHeading>In Remembrance</SectionHeading>
          <GoldRule />
          {photo && (
            <div style={{ position: "relative", width: "2.2in", height: "2.8in", margin: "0.2in auto", border: `1px solid ${BORDER}` }}>
              <Image src={photo.src} alt={photo.alt} fill style={{ objectFit: "cover", objectPosition: "center 15%" }} />
            </div>
          )}
          <FloralDivider />
          <p style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.85rem", fontStyle: "italic", color: MID_TEXT, lineHeight: 1.9, textAlign: "center", margin: "0.1in 0.3in" }}>
            {m.tribute}
          </p>
        </div>
      </div>
      <KenteBorder height={8} />
    </PagePage>
  );
}

function BiographyPage({ m }: { m: MemorialConfig }) {
  return (
    <PagePage>
      <KenteBorder height={8} />
      <div style={{ padding: "0.4in 0.5in", position: "relative" }}>
        <AdinkraWatermark />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionHeading>Biography</SectionHeading>
          <GoldRule />
          <div style={{ marginTop: "0.2in" }}>
            {m.biography ? (
              m.biography.split("\n\n").map((para, i) => {
                const isHeading = para.startsWith("**") && para.endsWith("**");
                const text = isHeading ? para.slice(2, -2) : para;
                return isHeading ? (
                  <div key={i} style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.88rem", fontWeight: 700, color: GOLD, marginBottom: "0.25rem", marginTop: "0.4rem", letterSpacing: "0.03em" }}>
                    {text}
                  </div>
                ) : (
                  <p key={i} style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.82rem", color: DARK_TEXT, lineHeight: 1.85, marginBottom: "0.5rem", textAlign: "justify" }}>
                    {para}
                  </p>
                );
              })
            ) : (
              <p style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.82rem", color: FAINT_TEXT, fontStyle: "italic", lineHeight: 1.85 }}>
                [ Biography to be added ]
              </p>
            )}
          </div>
        </div>
      </div>
      <KenteBorder height={8} />
    </PagePage>
  );
}

function OrderOfServicePage({ m }: { m: MemorialConfig }) {
  return (
    <PagePage>
      <KenteBorder height={8} />
      <div style={{ padding: "0.4in 0.45in", position: "relative" }}>
        <AdinkraWatermark />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionHeading>Order of Service</SectionHeading>
          <div style={{ textAlign: "center", marginBottom: "0.15in" }}>
            <div style={{ fontSize: "0.65rem", color: FAINT_TEXT, fontFamily: "Garamond, Georgia, serif", fontStyle: "italic" }}>
              {m.funeralService.date} · {m.funeralService.time}
            </div>
            <div style={{ fontSize: "0.62rem", color: FAINT_TEXT, marginTop: "0.05rem" }}>
              Officiant: {m.program.officiant}
            </div>
          </div>
          <GoldRule />
          <div style={{ marginTop: "0.15in" }}>
            {m.program.items.map((item, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem",
                padding: "0.18rem 0",
                borderBottom: i < m.program.items.length - 1 ? `1px solid #e8d8b8` : "none",
              }}>
                <span style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.7rem", color: GOLD, minWidth: "1.2rem", paddingTop: 1, fontWeight: 600 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.8rem", color: DARK_TEXT, fontWeight: 600 }}>
                    {item.title}
                  </span>
                  {item.sub && (
                    <span style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.72rem", color: MID_TEXT, marginLeft: "0.4rem", fontStyle: "italic" }}>
                      {item.sub}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <FloralDivider />
        </div>
      </div>
      <KenteBorder height={8} />
    </PagePage>
  );
}

function HymnPage({ hymn, num }: { hymn: { title: string; lyrics: string }; num: number }) {
  return (
    <PagePage>
      <KenteBorder height={8} />
      <div style={{ padding: "0.4in 0.5in", position: "relative" }}>
        <AdinkraWatermark />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "0.05in" }}>
            <div style={{ fontSize: "0.55rem", color: FAINT_TEXT, letterSpacing: "0.14em", textTransform: "uppercase" }}>Hymn {num}</div>
          </div>
          <SectionHeading>{hymn.title}</SectionHeading>
          <GoldRule />
          <div style={{ marginTop: "0.2in" }}>
            {hymn.lyrics.split("\n\n").map((verse, i) => (
              <div key={i} style={{ marginBottom: "0.6rem" }}>
                <p style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.82rem", color: DARK_TEXT, lineHeight: 1.9, textAlign: "center", whiteSpace: "pre-line", margin: 0 }}>
                  {verse}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <KenteBorder height={8} />
    </PagePage>
  );
}

type PhotoEntry = { src: string; alt: string; caption?: string; fit?: "cover" | "contain" };

function PhotoPage({ section, photos, showSection }: { section: string; photos: PhotoEntry[]; showSection: boolean }) {
  return (
    <PagePage>
      <KenteBorder height={8} />
      <div style={{ padding: "0.2in 0.4in 0.15in", position: "relative" }}>
        {showSection && (
          <>
            <div style={{ textAlign: "center", margin: "0.05in 0 0" }}>
              <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.65rem", color: FAINT_TEXT, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.05in" }}>
                {section}
              </div>
            </div>
            <GoldRule />
            <FloralDivider />
          </>
        )}
        {!showSection && (
          <div style={{ textAlign: "center", marginBottom: "0.1in" }}>
            <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.6rem", color: FAINT_TEXT, letterSpacing: "0.1em", fontStyle: "italic" }}>
              {section} (continued)
            </div>
            <GoldRule />
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.15in" }}>
          {photos.map((p, i) => (
            <div key={i}>
              <div style={{ position: "relative", height: "2.35in", border: `1px solid ${BORDER}`, background: "#f0e6d0" }}>
                <Image src={p.src} alt={p.alt} fill style={{ objectFit: p.fit ?? "cover", objectPosition: p.fit === "contain" ? "center center" : "center 15%" }} />
              </div>
              {p.caption && (
                <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.58rem", color: FAINT_TEXT, fontStyle: "italic", textAlign: "center", marginTop: "0.04in" }}>
                  {p.caption}
                </div>
              )}
            </div>
          ))}
        </div>
        <FloralDivider />
      </div>
      <KenteBorder height={8} />
    </PagePage>
  );
}

function AcknowledgementsPage({ m }: { m: MemorialConfig }) {
  return (
    <PagePage>
      <KenteBorder height={8} />
      <div style={{ padding: "0.4in 0.5in", position: "relative" }}>
        <AdinkraWatermark />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionHeading>Acknowledgements</SectionHeading>
          <GoldRule />
          <p style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.82rem", color: DARK_TEXT, lineHeight: 1.9, marginTop: "0.2in", textAlign: "justify" }}>
            The family of {m.name} wishes to express their heartfelt gratitude to all who have offered prayers, kind words, and unwavering support during this time of bereavement. Your love and presence bring comfort beyond measure.
          </p>
          <p style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.82rem", color: FAINT_TEXT, fontStyle: "italic", lineHeight: 1.9, marginTop: "0.4in", textAlign: "center" }}>
            [ Add specific acknowledgements here — pallbearers, ushers, singers, clergy, organizations ]
          </p>
          <FloralDivider />
        </div>
      </div>
      <KenteBorder height={8} />
    </PagePage>
  );
}

function BackCoverPage({ m }: { m: MemorialConfig }) {
  const lastPhoto = m.photos[m.photos.length - 1];
  return (
    <PagePage>
      <KenteBorder height={12} />
      <div style={{ padding: "0.4in 0.5in", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem", position: "relative" }}>
        <div style={{ position: "absolute", top: "0.4in", left: "0.4in" }}><CornerFlower size={52} /></div>
        <div style={{ position: "absolute", top: "0.4in", right: "0.4in" }}><CornerFlower size={52} flip /></div>
        <div style={{ position: "relative", zIndex: 1, width: "100%", textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/GyeNyame.png" alt="Gye Nyame" style={{ width: 64, height: 64, objectFit: "contain", filter: "sepia(1) saturate(3) hue-rotate(5deg) brightness(0.75)", opacity: 0.7, margin: "0.3in auto 0.1in" }} />
          <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.75rem", color: GOLD, letterSpacing: "0.1em" }}>
            {m.adinkra.symbol}
          </div>
          <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.65rem", color: FAINT_TEXT, fontStyle: "italic", marginBottom: "0.15in" }}>
            {m.adinkra.meaning}
          </div>
          <GoldRule />
          {lastPhoto && (
            <div style={{ position: "relative", width: "2in", height: "2.5in", margin: "0.2in auto", border: `1px solid ${BORDER}` }}>
              <Image src={lastPhoto.src} alt={lastPhoto.alt} fill style={{ objectFit: "cover", objectPosition: "center 15%" }} />
            </div>
          )}
          <FloralDivider />
          <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "1.1rem", color: DARK_TEXT, letterSpacing: "0.03em", marginTop: "0.1in" }}>
            {m.name}
          </div>
          <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.8rem", color: GOLD, letterSpacing: "0.12em", margin: "0.05rem 0" }}>
            {m.years}
          </div>
          <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.7rem", color: FAINT_TEXT, fontStyle: "italic", marginTop: "0.15in" }}>
            Until we meet again.
          </div>
          <div style={{ marginTop: "0.2in", display: "flex", justifyContent: "space-between" }}>
            <CornerFlower size={40} />
            <CornerFlower size={40} flip />
          </div>
        </div>
      </div>
      <KenteBorder height={12} />
    </PagePage>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function PagePage({ children }: { children: React.ReactNode }) {
  return (
    <div className="program-page" style={{
      background: PAGE_BG,
      width: "5.5in",
      minHeight: "8.5in",
      margin: "0 auto",
      boxSizing: "border-box",
      position: "relative",
      border: `1.5px solid ${BORDER}`,
      pageBreakAfter: "always",
      overflow: "hidden",
    }}>
      {/* Inner gold line */}
      <div style={{ position: "absolute", inset: 7, border: `0.5px solid ${GOLD}`, opacity: 0.3, pointerEvents: "none", zIndex: 2 }} />
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "Garamond, Georgia, serif",
      fontSize: "1.1rem",
      fontWeight: 400,
      color: GOLD,
      textAlign: "center",
      letterSpacing: "0.08em",
      margin: "0 0 0.1in",
      textTransform: "uppercase",
    }}>
      {children}
    </h2>
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/* ── Main component ─────────────────────────────────────────── */
export default function ProgramClient({ m }: { m: MemorialConfig }) {
  // Flatten sections into pages of 4, tracking section label and whether it's the first page of that section
  const photoPages: { section: string; photos: PhotoEntry[]; showSection: boolean }[] = [];
  for (const group of m.programPhotos ?? []) {
    const chunks = chunkArray(group.photos, 4);
    chunks.forEach((chunk, i) => {
      photoPages.push({ section: group.section, photos: chunk, showSection: i === 0 });
    });
  }

  return (
    <>
      <div className="program-screen-wrapper" style={{
        minHeight: "100vh",
        background: "#1a1208",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 1rem",
        gap: "1.5rem",
      }}>
        {/* Controls */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => window.print()}
            style={{
              background: GOLD, color: "#0e0b07", border: "none", borderRadius: "4px",
              padding: "0.6rem 1.5rem", fontFamily: "sans-serif", fontSize: "0.85rem",
              fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em",
            }}
          >
            Print / Save PDF
          </button>
          <a href={`/akan/${m.slug}`} style={{
            background: "transparent", color: GOLD, border: `1px solid ${GOLD}`,
            borderRadius: "4px", padding: "0.6rem 1.5rem", fontFamily: "sans-serif",
            fontSize: "0.85rem", textDecoration: "none", letterSpacing: "0.05em",
          }}>
            ← Memorial page
          </a>
        </div>

        <div style={{ fontSize: "0.72rem", color: "#7a6a52", fontFamily: "sans-serif" }}>
          5.5″ × 8.5″ · Center-bound booklet · Enable "Background graphics" in print settings
        </div>

        {/* Pages */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
          <CoverPage m={m} />
          <TributePage m={m} />
          <BiographyPage m={m} />
          <OrderOfServicePage m={m} />
          {m.hymns?.map((hymn, i) => (
            <HymnPage key={i} hymn={hymn} num={i + 1} />
          ))}
          {photoPages.map((page, i) => (
            <PhotoPage key={i} section={page.section} photos={page.photos} showSection={page.showSection} />
          ))}
          <AcknowledgementsPage m={m} />
          <BackCoverPage m={m} />
        </div>

        <div style={{ fontSize: "0.72rem", color: "#4a3a2a", fontFamily: "sans-serif" }}>
          keepingthem.net
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; background: white; }
          .program-screen-wrapper {
            background: white !important;
            padding: 0 !important;
            gap: 0 !important;
            min-height: unset !important;
          }
          button, a[href] { display: none !important; }
          .program-page {
            page-break-after: always;
            margin: 0 !important;
            border: none !important;
            width: 5.5in !important;
            min-height: 8.5in !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </>
  );
}
