"use client";

import { useEffect, useRef, useState } from "react";
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

/* Repeating Akan geometric side border — diamond/chevron motif */
function SideBorder({ side }: { side: "left" | "right" }) {
  const flip = side === "right";
  return (
    <div style={{
      position: "absolute",
      top: 14,
      bottom: 14,
      [side]: 6,
      width: 18,
      overflow: "hidden",
      zIndex: 1,
      pointerEvents: "none",
      opacity: 0.55,
    }}>
      <svg width="18" height="800" viewBox="0 0 18 800" fill="none" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
        {/* Repeating diamond + chevron unit, 24px tall */}
        {Array.from({ length: 34 }).map((_, i) => {
          const y = i * 24;
          return (
            <g key={i}>
              {/* Diamond */}
              <polygon points={`9,${y+2} 16,${y+10} 9,${y+18} 2,${y+10}`} fill={GOLD} opacity="0.35" />
              <polygon points={`9,${y+5} 13,${y+10} 9,${y+15} 5,${y+10}`} fill={GOLD} opacity="0.6" />
              {/* Chevron below */}
              <polyline points={`2,${y+20} 9,${y+24} 16,${y+20}`} stroke={GOLD} strokeWidth="1" fill="none" opacity="0.4" />
            </g>
          );
        })}
        {/* Vertical spine */}
        <line x1="9" y1="0" x2="9" y2="800" stroke={GOLD} strokeWidth="0.5" opacity="0.25" />
      </svg>
    </div>
  );
}

/* Row of small Adinkra glyphs as page footer decoration */
function AdinkraFooterStrip() {
  return (
    <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center", gap: "0.35in", pointerEvents: "none", zIndex: 1, opacity: 0.18 }}>
      {/* Gye Nyame simplified */}
      {[0,1,2,3,4].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 80 80" fill={GOLD}>
          <path fillRule="evenodd" d="M40 4C46.6 4 52 9.4 52 16C52 22.6 46.6 28 40 28C33.4 28 28 22.6 28 16C28 9.4 33.4 4 40 4ZM40 10C36.7 10 34 12.7 34 16C34 19.3 36.7 22 40 22C43.3 22 46 19.3 46 16C46 12.7 43.3 10 40 10Z"/>
          <path fillRule="evenodd" d="M40 52C46.6 52 52 57.4 52 64C52 70.6 46.6 76 40 76C33.4 76 28 70.6 28 64C28 57.4 33.4 52 40 52ZM40 58C36.7 58 34 60.7 34 64C34 67.3 36.7 70 40 70C43.3 70 46 67.3 46 64C46 60.7 43.3 58 40 58Z"/>
          <path d="M40 25C40 25 33 24 26 28C18 33 12 41 14 50C16 58 24 63 32 60C38 58 41 52 39 47C37 42 32 40 28 42C25 44 25 48 27 50C29 52 33 52 35 50C36 49 36 47 35 46C34 45 33 46 33 47C33 48 34 48 34 47C34 46 33 45 32 46C31 47 31 49 33 50C35 51 38 50 39 47C40 44 39 40 36 37C33 34 29 33 26 36C22 39 21 45 24 50C27 56 34 59 40 57C40 55 40 25 40 25Z"/>
          <path d="M40 25C40 25 47 24 54 28C62 33 68 41 66 50C64 58 56 63 48 60C42 58 39 52 41 47C43 42 48 40 52 42C55 44 55 48 53 50C51 52 47 52 45 50C44 49 44 47 45 46C46 45 47 46 47 47C47 48 46 48 46 47C46 46 47 45 48 46C49 47 49 49 47 50C45 51 42 50 41 47C40 44 41 40 44 37C47 34 51 33 54 36C58 39 59 45 56 50C53 56 46 59 40 57C40 55 40 25 40 25Z"/>
        </svg>
      ))}
    </div>
  );
}

/* Top corner ornaments — all four corners */
function PageCorners() {
  return (
    <>
      <div style={{ position: "absolute", top: 14, left: 14, zIndex: 1, pointerEvents: "none" }}><CornerFlower size={38} /></div>
      <div style={{ position: "absolute", top: 14, right: 14, zIndex: 1, pointerEvents: "none" }}><CornerFlower size={38} flip /></div>
      <div style={{ position: "absolute", bottom: 14, left: 14, zIndex: 1, pointerEvents: "none", transform: "scaleY(-1)" }}><CornerFlower size={38} /></div>
      <div style={{ position: "absolute", bottom: 14, right: 14, zIndex: 1, pointerEvents: "none", transform: "scale(-1, -1)" }}><CornerFlower size={38} /></div>
    </>
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
      <div style={{ padding: "0.35in 0.5in 0.35in", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", position: "relative" }}>
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
        <div style={{ position: "relative", width: "100%", height: "2.8in", overflow: "hidden" }}>
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
            Viewing (optional): {m.viewing.date} · {m.viewing.startTime} – {m.viewing.endTime}
          </div>
        )}
        {m.reception && (
          <div style={{ marginTop: "0.18rem" }}>
            <div style={{ fontSize: "0.6rem", color: FAINT_TEXT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.1rem", marginTop: "0.15rem" }}>
              Reception
            </div>
            <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.78rem", color: DARK_TEXT, lineHeight: 1.6 }}>
              {m.reception.date} · {m.reception.time}<br />
              <span style={{ fontSize: "0.7rem", color: MID_TEXT }}>{m.reception.name} · {m.reception.address}</span>
            </div>
          </div>
        )}
        <div style={{ marginTop: "0.2rem", display: "flex", justifyContent: "space-between" }}>
          <CornerFlower size={40} />
          <CornerFlower size={40} flip />
        </div>
      </div>
    </PagePage>
  );
}

function TributePage({ m }: { m: MemorialConfig }) {
  const photo = m.photos[1] ?? m.photos[0];
  return (
    <PagePage>
      <div style={{ padding: "0.35in 0.5in 0.2in", position: "relative" }}>
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
    </PagePage>
  );
}

// px available for bio content inside a page (8.5in - kente top/bottom - padding top/bottom)
// 8.5in @ 96dpi = 816px, minus 8px kente × 2, minus ~48px padding top/bottom = ~752px
const BIO_CONTENT_HEIGHT_PX = 752;
const BIO_PADDING = "0.25in 0.3in 0.25in";

function renderBioPara(para: string, i: number) {
  const isHeading = para.startsWith("**") && para.endsWith("**");
  const text = isHeading ? para.slice(2, -2) : para;
  return isHeading ? (
    <div key={i} style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.82rem", fontWeight: 700, color: GOLD, marginBottom: "0.2rem", marginTop: "0.35rem", letterSpacing: "0.03em" }}>
      {text}
    </div>
  ) : (
    <p key={i} style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.82rem", color: DARK_TEXT, lineHeight: 1.8, marginBottom: "0.4rem", textAlign: "justify", margin: "0 0 0.4rem" }}>
      {para}
    </p>
  );
}

function BiographyPage({ m }: { m: MemorialConfig }) {
  const probeRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[][] | null>(null);

  const allParas = m.biography ? m.biography.split("\n\n").filter(p => p.trim()) : [];

  useEffect(() => {
    if (!m.biography || !probeRef.current) return;

    // Measure each paragraph's rendered height using the off-screen probe div
    const probe = probeRef.current;
    const paraHeights: number[] = [];
    for (let i = 0; i < allParas.length; i++) {
      // Clear and render one para at a time
      const el = probe.children[i] as HTMLElement;
      if (el) paraHeights.push(el.offsetHeight + (i > 0 ? 6.4 : 0)); // 0.4rem margin
    }

    // Greedily fill pages
    const result: string[][] = [];
    let current: string[] = [];
    let used = 0;
    // Reserve space for heading (SectionHeading + GoldRule + marginTop ~= 72px first page, 40px continued)
    let reserved = 72;

    for (let i = 0; i < allParas.length; i++) {
      const h = paraHeights[i] ?? 40;
      const isHeading = allParas[i].startsWith("**") && allParas[i].endsWith("**");
      // Keep heading with next para — peek at next height too
      const nextH = isHeading && i + 1 < allParas.length ? (paraHeights[i + 1] ?? 40) : 0;

      if (current.length > 0 && used + h + nextH + reserved > BIO_CONTENT_HEIGHT_PX) {
        result.push(current);
        current = [];
        used = 0;
        reserved = 40; // continued pages have smaller header
      }

      current.push(allParas[i]);
      used += h;
    }
    if (current.length) result.push(current);
    setPages(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.biography]);

  if (!m.biography) {
    return (
      <PagePage>
        <div style={{ padding: BIO_PADDING, position: "relative" }}>
          <AdinkraWatermark />
          <div style={{ position: "relative", zIndex: 1 }}>
            <SectionHeading>Biography</SectionHeading>
            <GoldRule />
            <p style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.82rem", color: FAINT_TEXT, fontStyle: "italic", lineHeight: 1.85, marginTop: "0.2in" }}>
              [ Biography to be added ]
            </p>
          </div>
        </div>
      </PagePage>
    );
  }

  return (
    <>
      {/* Off-screen probe: render all paras at actual width to measure heights */}
      <div ref={probeRef} style={{
        position: "fixed", top: 0, left: "-9999px", width: "calc(5.5in - 0.6in)",
        fontFamily: "Garamond, Georgia, serif", fontSize: "0.82rem", lineHeight: 1.8,
        visibility: "hidden", pointerEvents: "none", zIndex: -1,
      }}>
        {allParas.map((para, i) => renderBioPara(para, i))}
      </div>

      {/* Render pages once measured; before that, show all on one page so it's not blank */}
      {(pages ?? [allParas]).map((paras, pageIndex) => (
        <PagePage key={pageIndex}>
          <div style={{ padding: BIO_PADDING, position: "relative" }}>
            <AdinkraWatermark />
            <div style={{ position: "relative", zIndex: 1 }}>
              {pageIndex === 0 ? (
                <>
                  <SectionHeading>Biography</SectionHeading>
                  <GoldRule />
                </>
              ) : (
                <div style={{ textAlign: "center", marginBottom: "0.08in" }}>
                  <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.6rem", color: FAINT_TEXT, letterSpacing: "0.1em", fontStyle: "italic" }}>
                    Biography (continued)
                  </div>
                  <GoldRule />
                </div>
              )}
              <div style={{ marginTop: "0.12in" }}>
                {paras.map((para, i) => renderBioPara(para, i))}
              </div>
            </div>
          </div>
        </PagePage>
      ))}
    </>
  );
}

const ORDER_ITEMS_PER_PAGE = 20;

function OrderOfServiceItemList({ items, startIndex, totalItems }: { items: { title: string; sub: string }[]; startIndex: number; totalItems: number }) {
  return (
    <div style={{ marginTop: "0.1in" }}>
      {items.map((item, i) => {
        const globalIndex = startIndex + i;
        return (
          <div key={i} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
            padding: "0.12rem 0",
            borderBottom: globalIndex < totalItems - 1 ? `1px solid #e8d8b8` : "none",
          }}>
            <span style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.7rem", color: GOLD, minWidth: "1.2rem", paddingTop: 1, fontWeight: 600 }}>
              {String(globalIndex + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1 }}>
              <span style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.82rem", color: DARK_TEXT, fontWeight: 600 }}>
                {item.title}
              </span>
              {item.sub && (
                <span style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.74rem", color: MID_TEXT, marginLeft: "0.4rem", fontStyle: "italic" }}>
                  {item.sub}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderOfServicePage({ m }: { m: MemorialConfig }) {
  const pages = chunkArray(m.program.items, ORDER_ITEMS_PER_PAGE);
  const total = m.program.items.length;

  return (
    <>
      {pages.map((pageItems, pageIndex) => (
        <PagePage key={pageIndex}>
          <div style={{ padding: "0.3in 0.45in 0.15in", position: "relative" }}>
            <AdinkraWatermark />
            <div style={{ position: "relative", zIndex: 1 }}>
              {pageIndex === 0 ? (
                <>
                  <SectionHeading>Order of Service</SectionHeading>
                  <div style={{ textAlign: "center", marginBottom: "0.08in" }}>
                    <div style={{ fontSize: "0.62rem", color: FAINT_TEXT, fontFamily: "Garamond, Georgia, serif", fontStyle: "italic" }}>
                      {m.funeralService.date} · {m.funeralService.time}
                    </div>
                    <div style={{ fontSize: "0.6rem", color: FAINT_TEXT, marginTop: "0.03rem" }}>
                      Officiant: {m.program.officiant}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", marginBottom: "0.08in" }}>
                  <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "0.6rem", color: FAINT_TEXT, letterSpacing: "0.1em", fontStyle: "italic" }}>
                    Order of Service (continued)
                  </div>
                </div>
              )}
              <GoldRule />
              <OrderOfServiceItemList
                items={pageItems}
                startIndex={pageIndex * ORDER_ITEMS_PER_PAGE}
                totalItems={total}
              />
              <FloralDivider />
            </div>
          </div>
        </PagePage>
      ))}
    </>
  );
}

function HymnPage({ hymn, num }: { hymn: { title: string; lyrics: string }; num: number }) {
  return (
    <PagePage>
      <div style={{ padding: "0.35in 0.5in", position: "relative" }}>
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
    </PagePage>
  );
}

type PhotoEntry = { src: string; alt: string; caption?: string; fit?: "cover" | "contain" };

function PhotoPage({ section, photos, showSection }: { section: string; photos: PhotoEntry[]; showSection: boolean }) {
  return (
    <PagePage>
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
    </PagePage>
  );
}

function AcknowledgementsPage({ m }: { m: MemorialConfig }) {
  return (
    <PagePage>
      <div style={{ padding: "0.35in 0.5in", position: "relative" }}>
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
    </PagePage>
  );
}

function BackCoverPage({ m }: { m: MemorialConfig }) {
  const lastPhoto = m.photos[m.photos.length - 1];
  return (
    <PagePage>
      <div style={{ padding: "0.35in 0.5in", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem", position: "relative" }}>
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
    </PagePage>
  );
}

/* ── Helpers ─────────────────────────────────────────────────── */

function PagePage({ children }: { children: React.ReactNode }) {
  return (
    <div className="program-page" style={{
      background: PAGE_BG,
      width: "5.5in",
      height: "8.5in",
      margin: "0 auto",
      boxSizing: "border-box",
      position: "relative",
      border: `1.5px solid ${BORDER}`,
      pageBreakAfter: "always",
      overflow: "hidden",
    }}>
      {/* Kente stripes pinned to top and bottom */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3, pointerEvents: "none" }}>
        <KenteBorder height={8} />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3, pointerEvents: "none" }}>
        <KenteBorder height={8} />
      </div>
      {/* Inner gold line */}
      <div style={{ position: "absolute", inset: 7, border: `0.5px solid ${GOLD}`, opacity: 0.3, pointerEvents: "none", zIndex: 2 }} />
      {/* Side borders */}
      <SideBorder side="left" />
      <SideBorder side="right" />
      {/* Four corner flowers */}
      <PageCorners />
      {/* Adinkra footer strip */}
      <AdinkraFooterStrip />
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", margin: "0 0 0.1in", position: "relative" }}>
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`, opacity: 0.4 }} />
      <h2 style={{
        display: "inline-block",
        position: "relative",
        background: PAGE_BG,
        padding: "0 0.15in",
        fontFamily: "Garamond, Georgia, serif",
        fontSize: "1.05rem",
        fontWeight: 400,
        color: GOLD,
        letterSpacing: "0.1em",
        margin: 0,
        textTransform: "uppercase",
    }}>
        {children}
      </h2>
    </div>
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

const PAGE_WIDTH_IN = 5.5;
const PAGE_HEIGHT_IN = 8.5;

/* ── Main component ─────────────────────────────────────────── */
export default function ProgramClient({ m }: { m: MemorialConfig }) {
  useEffect(() => {
    function scalePages() {
      const pxPerIn = 96;
      const pageWidthPx = PAGE_WIDTH_IN * pxPerIn;
      const pageHeightPx = PAGE_HEIGHT_IN * pxPerIn;
      const available = window.innerWidth - 32; // 1rem padding each side
      if (available < pageWidthPx) {
        const scale = available / pageWidthPx;
        const scaledHeight = pageHeightPx * scale;
        document.querySelectorAll<HTMLElement>(".program-page").forEach((el) => {
          el.style.transform = `scale(${scale})`;
          el.style.marginBottom = `${scaledHeight - pageHeightPx}px`;
        });
      } else {
        document.querySelectorAll<HTMLElement>(".program-page").forEach((el) => {
          el.style.transform = "";
          el.style.marginBottom = "";
        });
      }
    }
    scalePages();
    window.addEventListener("resize", scalePages);
    return () => window.removeEventListener("resize", scalePages);
  }, []);
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

        {/* Booklet print instructions */}
        <div className="booklet-instructions" style={{
          maxWidth: "480px",
          background: "#241a0a",
          border: `1px solid ${GOLD}`,
          borderRadius: "6px",
          padding: "1rem 1.25rem",
          fontFamily: "sans-serif",
          fontSize: "0.78rem",
          color: "#c4a86a",
          lineHeight: 1.7,
        }}>
          <div style={{ fontWeight: 700, color: GOLD, marginBottom: "0.4rem", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.7rem" }}>
            Printing as a booklet
          </div>
          <div style={{ color: "#9a7a4a", marginBottom: "0.6rem" }}>
            Each page is 5.5″ × 8.5″. To print as a center-fold booklet on standard 8.5″ × 11″ paper:
          </div>
          <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "#b09060", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <li>Click <strong style={{ color: GOLD }}>Print / Save PDF</strong> above and save as PDF first</li>
            <li>Open the PDF in <strong style={{ color: GOLD }}>Adobe Acrobat</strong> (free Reader works)</li>
            <li>File → Print → under <strong style={{ color: GOLD }}>Page Sizing</strong>, choose <strong style={{ color: GOLD }}>Booklet</strong></li>
            <li>Set paper to <strong style={{ color: GOLD }}>Letter (8.5″ × 11″) landscape</strong></li>
            <li>Print double-sided, flip on short edge, then fold and staple in the center</li>
          </ol>
          <div style={{ marginTop: "0.6rem", color: "#6a5030", fontSize: "0.72rem" }}>
            On Mac: Print dialog → Layout → Two-Sided → Short-Edge binding also works for simple folded booklets.
          </div>
        </div>

        <div style={{ fontSize: "0.72rem", color: "#7a6a52", fontFamily: "sans-serif" }}>
          Enable "Background graphics" in print settings to preserve colors
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
        .program-page {
          transform-origin: top center;
        }
        @media print {
          body { margin: 0; background: white; }
          .program-screen-wrapper {
            background: white !important;
            padding: 0 !important;
            gap: 0 !important;
            min-height: unset !important;
          }
          button, a[href], .booklet-instructions { display: none !important; }
          .program-page {
            page-break-after: always;
            margin: 0 !important;
            border: none !important;
            width: 5.5in !important;
            min-height: 8.5in !important;
            transform: none !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </>
  );
}
