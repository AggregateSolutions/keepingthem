"use client";

import { QRCodeSVG } from "qrcode.react";
import type { MemorialConfig } from "@/types/memorial";
import Image from "next/image";

const GOLD = "#c8962e";
const CREAM = "#f0e6d0";
const DARK = "#0e0b07";

function ServiceRow({ label, date, time, location }: { label: string; date: string; time: string; location: string }) {
  return (
    <div style={{ marginBottom: "0.6rem" }}>
      <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: GOLD, marginBottom: "0.1rem" }}>{label}</div>
      <div style={{ fontSize: "0.75rem", color: CREAM, fontWeight: 500 }}>{date} · {time}</div>
      <div style={{ fontSize: "0.65rem", color: "#a09070" }}>{location}</div>
    </div>
  );
}

export default function FlyerClient({ m, slug }: { m: MemorialConfig; slug: string }) {
  const url = `https://keepingthem.net/akan/${slug}`;
  const photo = m.photos[0];

  return (
    <>
      {/* Screen: center the flyer with a print button */}
      <div className="flyer-screen-wrapper" style={{
        minHeight: "100vh",
        background: "#1a1208",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem 1rem",
        gap: "1.25rem",
      }}>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => window.print()}
            style={{
              background: GOLD, color: DARK, border: "none", borderRadius: "4px",
              padding: "0.6rem 1.5rem", fontFamily: "sans-serif", fontSize: "0.85rem",
              fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em",
            }}
          >
            Print / Save PDF
          </button>
          <a
            href={`/akan/${slug}`}
            style={{
              background: "transparent", color: GOLD, border: `1px solid ${GOLD}`,
              borderRadius: "4px", padding: "0.6rem 1.5rem", fontFamily: "sans-serif",
              fontSize: "0.85rem", textDecoration: "none", letterSpacing: "0.05em",
            }}
          >
            ← Memorial page
          </a>
        </div>

        {/* The flyer card */}
        <div id="flyer" style={{
          width: "100%",
          maxWidth: "420px",
          background: DARK,
          border: `2px solid ${GOLD}`,
          borderRadius: "4px",
          overflow: "hidden",
          fontFamily: "Georgia, serif",
        }}>
          {/* Kente stripe top */}
          <div style={{ display: "flex", height: "8px" }}>
            {["#c8962e","#1a5c1a","#8b1a1a","#c8962e","#1a5c1a","#8b1a1a","#c8962e","#1a5c1a","#8b1a1a","#c8962e"].map((c, i) => (
              <div key={i} style={{ flex: 1, background: c }} />
            ))}
          </div>

          {/* Photo */}
          {photo && (
            <div style={{ position: "relative", width: "100%", height: "400px", background: "#1a1208" }}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                style={{ objectFit: "cover", objectPosition: "center 25%" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, transparent 50%, rgba(14,11,7,0.95) 100%)",
              }} />
            </div>
          )}

          {/* Floral divider — full flower with petals and vines */}
          <div style={{ textAlign: "center", padding: "0.75rem 0 0" }}>
            <svg width="320" height="48" viewBox="0 0 320 48" fill="none">
              {/* Left vine */}
              <path d="M0 24 Q30 18 60 24 Q80 28 100 22" stroke={GOLD} strokeWidth="0.8" opacity="0.4" fill="none"/>
              <path d="M20 24 Q25 16 30 20" stroke={GOLD} strokeWidth="0.6" opacity="0.3" fill="none"/>
              <path d="M45 23 Q50 32 55 27" stroke={GOLD} strokeWidth="0.6" opacity="0.3" fill="none"/>
              <path d="M70 22 Q75 14 80 18" stroke={GOLD} strokeWidth="0.6" opacity="0.3" fill="none"/>
              {/* Left leaf accents */}
              <ellipse cx="30" cy="18" rx="5" ry="2.5" fill={GOLD} opacity="0.2" transform="rotate(-20 30 18)"/>
              <ellipse cx="55" cy="30" rx="5" ry="2.5" fill={GOLD} opacity="0.2" transform="rotate(15 55 30)"/>
              <ellipse cx="80" cy="16" rx="5" ry="2.5" fill={GOLD} opacity="0.2" transform="rotate(-25 80 16)"/>
              {/* Small bud left */}
              <circle cx="100" cy="22" r="3" fill={GOLD} opacity="0.5"/>
              <ellipse cx="100" cy="16" rx="2" ry="4" fill={GOLD} opacity="0.3"/>
              <ellipse cx="100" cy="28" rx="2" ry="4" fill={GOLD} opacity="0.3"/>
              <ellipse cx="94" cy="22" rx="4" ry="2" fill={GOLD} opacity="0.3"/>
              <ellipse cx="106" cy="22" rx="4" ry="2" fill={GOLD} opacity="0.3"/>
              {/* Centre flower */}
              <circle cx="160" cy="24" r="5" fill={GOLD} opacity="0.9"/>
              <ellipse cx="160" cy="11" rx="3.5" ry="7" fill={GOLD} opacity="0.45"/>
              <ellipse cx="160" cy="37" rx="3.5" ry="7" fill={GOLD} opacity="0.45"/>
              <ellipse cx="147" cy="24" rx="7" ry="3.5" fill={GOLD} opacity="0.45"/>
              <ellipse cx="173" cy="24" rx="7" ry="3.5" fill={GOLD} opacity="0.45"/>
              <ellipse cx="150" cy="14" rx="3.5" ry="7" fill={GOLD} opacity="0.3" transform="rotate(-45 150 14)"/>
              <ellipse cx="170" cy="14" rx="3.5" ry="7" fill={GOLD} opacity="0.3" transform="rotate(45 170 14)"/>
              <ellipse cx="150" cy="34" rx="3.5" ry="7" fill={GOLD} opacity="0.3" transform="rotate(45 150 34)"/>
              <ellipse cx="170" cy="34" rx="3.5" ry="7" fill={GOLD} opacity="0.3" transform="rotate(-45 170 34)"/>
              <circle cx="160" cy="24" r="3" fill={DARK} opacity="0.6"/>
              {/* Small bud right */}
              <circle cx="220" cy="22" r="3" fill={GOLD} opacity="0.5"/>
              <ellipse cx="220" cy="16" rx="2" ry="4" fill={GOLD} opacity="0.3"/>
              <ellipse cx="220" cy="28" rx="2" ry="4" fill={GOLD} opacity="0.3"/>
              <ellipse cx="214" cy="22" rx="4" ry="2" fill={GOLD} opacity="0.3"/>
              <ellipse cx="226" cy="22" rx="4" ry="2" fill={GOLD} opacity="0.3"/>
              {/* Right vine */}
              <path d="M320 24 Q290 18 260 24 Q240 28 220 22" stroke={GOLD} strokeWidth="0.8" opacity="0.4" fill="none"/>
              <path d="M300 24 Q295 16 290 20" stroke={GOLD} strokeWidth="0.6" opacity="0.3" fill="none"/>
              <path d="M275 23 Q270 32 265 27" stroke={GOLD} strokeWidth="0.6" opacity="0.3" fill="none"/>
              <path d="M250 22 Q245 14 240 18" stroke={GOLD} strokeWidth="0.6" opacity="0.3" fill="none"/>
              {/* Right leaf accents */}
              <ellipse cx="290" cy="18" rx="5" ry="2.5" fill={GOLD} opacity="0.2" transform="rotate(20 290 18)"/>
              <ellipse cx="265" cy="30" rx="5" ry="2.5" fill={GOLD} opacity="0.2" transform="rotate(-15 265 30)"/>
              <ellipse cx="240" cy="16" rx="5" ry="2.5" fill={GOLD} opacity="0.2" transform="rotate(25 240 16)"/>
            </svg>
          </div>

          {/* Name & years */}
          <div style={{ textAlign: "center", padding: "0.5rem 1.5rem 0.75rem", borderBottom: `1px solid #3a2e1a` }}>
            <div style={{ fontSize: "0.7rem", color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              In loving memory
            </div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 400, color: CREAM, margin: "0 0 0.2rem", letterSpacing: "0.02em" }}>
              {m.name}
            </h1>
            <div style={{ fontSize: "1rem", color: GOLD, letterSpacing: "0.12em", marginBottom: "0.2rem" }}>
              {m.years}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#a09070", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {m.title}
            </div>
            {/* Corner flower accents */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <path d="M2 50 Q10 30 26 26 Q30 10 50 2" stroke={GOLD} strokeWidth="0.7" opacity="0.35" fill="none"/>
                <path d="M2 35 Q8 28 14 32" stroke={GOLD} strokeWidth="0.6" opacity="0.25" fill="none"/>
                <path d="M18 14 Q24 8 28 16" stroke={GOLD} strokeWidth="0.6" opacity="0.25" fill="none"/>
                <ellipse cx="10" cy="40" rx="4" ry="2" fill={GOLD} opacity="0.2" transform="rotate(-40 10 40)"/>
                <ellipse cx="22" cy="22" rx="4" ry="2" fill={GOLD} opacity="0.2" transform="rotate(-45 22 22)"/>
                <ellipse cx="38" cy="10" rx="4" ry="2" fill={GOLD} opacity="0.2" transform="rotate(-30 38 10)"/>
                <circle cx="26" cy="26" r="4" fill={GOLD} opacity="0.6"/>
                <ellipse cx="26" cy="18" rx="2.5" ry="5.5" fill={GOLD} opacity="0.35"/>
                <ellipse cx="26" cy="34" rx="2.5" ry="5.5" fill={GOLD} opacity="0.35"/>
                <ellipse cx="18" cy="26" rx="5.5" ry="2.5" fill={GOLD} opacity="0.35"/>
                <ellipse cx="34" cy="26" rx="5.5" ry="2.5" fill={GOLD} opacity="0.35"/>
                <ellipse cx="20" cy="20" rx="2.5" ry="5.5" fill={GOLD} opacity="0.2" transform="rotate(-45 20 20)"/>
                <ellipse cx="32" cy="20" rx="2.5" ry="5.5" fill={GOLD} opacity="0.2" transform="rotate(45 32 20)"/>
                <circle cx="26" cy="26" r="2" fill={DARK} opacity="0.5"/>
              </svg>
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ transform: "scaleX(-1)" }}>
                <path d="M2 50 Q10 30 26 26 Q30 10 50 2" stroke={GOLD} strokeWidth="0.7" opacity="0.35" fill="none"/>
                <path d="M2 35 Q8 28 14 32" stroke={GOLD} strokeWidth="0.6" opacity="0.25" fill="none"/>
                <path d="M18 14 Q24 8 28 16" stroke={GOLD} strokeWidth="0.6" opacity="0.25" fill="none"/>
                <ellipse cx="10" cy="40" rx="4" ry="2" fill={GOLD} opacity="0.2" transform="rotate(-40 10 40)"/>
                <ellipse cx="22" cy="22" rx="4" ry="2" fill={GOLD} opacity="0.2" transform="rotate(-45 22 22)"/>
                <ellipse cx="38" cy="10" rx="4" ry="2" fill={GOLD} opacity="0.2" transform="rotate(-30 38 10)"/>
                <circle cx="26" cy="26" r="4" fill={GOLD} opacity="0.6"/>
                <ellipse cx="26" cy="18" rx="2.5" ry="5.5" fill={GOLD} opacity="0.35"/>
                <ellipse cx="26" cy="34" rx="2.5" ry="5.5" fill={GOLD} opacity="0.35"/>
                <ellipse cx="18" cy="26" rx="5.5" ry="2.5" fill={GOLD} opacity="0.35"/>
                <ellipse cx="34" cy="26" rx="5.5" ry="2.5" fill={GOLD} opacity="0.35"/>
                <ellipse cx="20" cy="20" rx="2.5" ry="5.5" fill={GOLD} opacity="0.2" transform="rotate(-45 20 20)"/>
                <ellipse cx="32" cy="20" rx="2.5" ry="5.5" fill={GOLD} opacity="0.2" transform="rotate(45 32 20)"/>
                <circle cx="26" cy="26" r="2" fill={DARK} opacity="0.5"/>
              </svg>
            </div>
          </div>

          {/* Service details */}
          <div style={{ padding: "0.9rem 1.5rem", borderBottom: `1px solid #3a2e1a` }}>
            <div style={{ fontSize: "0.6rem", color: "#7a6a52", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
              Service details
            </div>
            {m.viewing && (
              <ServiceRow
                label="Viewing"
                date={m.viewing.date}
                time={`${m.viewing.startTime} – ${m.viewing.endTime}`}
                location={m.funeralService.name}
              />
            )}
            <ServiceRow
              label="Funeral service"
              date={m.funeralService.date}
              time={m.funeralService.time}
              location={`${m.funeralService.name} · ${m.funeralService.address}`}
            />
            {m.reception && (
              <ServiceRow
                label="Reception"
                date={m.reception.date}
                time={m.reception.time}
                location={`${m.reception.name} · ${m.reception.address}`}
              />
            )}
            <ServiceRow
              label="Thanksgiving celebration"
              date={m.thanksgiving.date}
              time={m.thanksgiving.time}
              location={m.thanksgiving.location}
            />
          </div>

          {/* Floral row above QR */}
          <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
            <svg width="280" height="36" viewBox="0 0 280 36" fill="none">
              <path d="M0 18 Q40 12 80 18 Q100 22 118 16" stroke={GOLD} strokeWidth="0.7" opacity="0.35" fill="none"/>
              <path d="M162 16 Q180 22 200 18 Q240 12 280 18" stroke={GOLD} strokeWidth="0.7" opacity="0.35" fill="none"/>
              <ellipse cx="30" cy="13" rx="5" ry="2.5" fill={GOLD} opacity="0.18" transform="rotate(-15 30 13)"/>
              <ellipse cx="65" cy="21" rx="5" ry="2.5" fill={GOLD} opacity="0.18" transform="rotate(10 65 21)"/>
              <ellipse cx="100" cy="13" rx="5" ry="2.5" fill={GOLD} opacity="0.18" transform="rotate(-20 100 13)"/>
              <ellipse cx="180" cy="21" rx="5" ry="2.5" fill={GOLD} opacity="0.18" transform="rotate(20 180 21)"/>
              <ellipse cx="215" cy="13" rx="5" ry="2.5" fill={GOLD} opacity="0.18" transform="rotate(-10 215 13)"/>
              <ellipse cx="250" cy="21" rx="5" ry="2.5" fill={GOLD} opacity="0.18" transform="rotate(15 250 21)"/>
              {/* Centre flower */}
              <circle cx="140" cy="18" r="4.5" fill={GOLD} opacity="0.7"/>
              <ellipse cx="140" cy="8" rx="3" ry="6" fill={GOLD} opacity="0.35"/>
              <ellipse cx="140" cy="28" rx="3" ry="6" fill={GOLD} opacity="0.35"/>
              <ellipse cx="130" cy="18" rx="6" ry="3" fill={GOLD} opacity="0.35"/>
              <ellipse cx="150" cy="18" rx="6" ry="3" fill={GOLD} opacity="0.35"/>
              <ellipse cx="133" cy="11" rx="3" ry="6" fill={GOLD} opacity="0.22" transform="rotate(-45 133 11)"/>
              <ellipse cx="147" cy="11" rx="3" ry="6" fill={GOLD} opacity="0.22" transform="rotate(45 147 11)"/>
              <ellipse cx="133" cy="25" rx="3" ry="6" fill={GOLD} opacity="0.22" transform="rotate(45 133 25)"/>
              <ellipse cx="147" cy="25" rx="3" ry="6" fill={GOLD} opacity="0.22" transform="rotate(-45 147 25)"/>
              <circle cx="140" cy="18" r="2" fill={DARK} opacity="0.5"/>
            </svg>
          </div>

          {/* QR codes — memorial + Zelle side by side */}
          <div style={{ padding: "0.9rem 1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
              <div style={{ background: "#fff", padding: "6px", borderRadius: "4px" }}>
                <QRCodeSVG value={url} size={68} fgColor={DARK} bgColor="#ffffff" />
              </div>
              <div style={{ fontSize: "0.58rem", color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
                Memorial & RSVP
              </div>
              <div style={{ fontSize: "0.55rem", color: "#7a6a52", textAlign: "center", fontStyle: "italic" }}>
                Scan to visit page
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
              <div style={{ background: "#fff", padding: "6px", borderRadius: "4px" }}>
                <QRCodeSVG value="zelle://send?phone=6787726856" size={68} fgColor={DARK} bgColor="#ffffff" />
              </div>
              <div style={{ fontSize: "0.58rem", color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
                Send via Zelle
              </div>
              <div style={{ fontSize: "0.55rem", color: "#7a6a52", textAlign: "center", fontStyle: "italic" }}>
                Contributions welcome
              </div>
            </div>
          </div>

          {/* Adinkra footer */}
          <div style={{ textAlign: "center", padding: "0.5rem 1rem 0.75rem", borderTop: `1px solid #3a2e1a` }}>
            <div style={{ fontFamily: "serif", fontSize: "1.2rem", color: "#3d2e1a", marginBottom: "0.15rem" }}>✦</div>
            <div style={{ fontSize: "0.62rem", color: "#7a6a52", fontStyle: "italic" }}>
              {m.adinkra.symbol} — {m.adinkra.meaning}
            </div>
          </div>

          {/* Kente stripe bottom */}
          <div style={{ display: "flex", height: "8px" }}>
            {["#8b1a1a","#1a5c1a","#c8962e","#8b1a1a","#1a5c1a","#c8962e","#8b1a1a","#1a5c1a","#c8962e","#8b1a1a"].map((c, i) => (
              <div key={i} style={{ flex: 1, background: c }} />
            ))}
          </div>
        </div>

        <div style={{ fontSize: "0.75rem", color: "#7a6a52", fontFamily: "sans-serif" }}>
          keepingthem.net
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; background: white; }
          .flyer-screen-wrapper {
            background: white !important;
            padding: 0 !important;
            min-height: unset !important;
          }
          button, a[href] { display: none !important; }
          #flyer {
            max-width: 100% !important;
            border: 2px solid ${GOLD} !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
