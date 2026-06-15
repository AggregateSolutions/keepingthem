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

          {/* Floral divider */}
          <div style={{ textAlign: "center", padding: "0.6rem 0 0", opacity: 0.5 }}>
            <svg width="260" height="28" viewBox="0 0 260 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="14" x2="95" y2="14" stroke={GOLD} strokeWidth="0.5" />
              <circle cx="108" cy="14" r="3" fill={GOLD} opacity="0.6" />
              <circle cx="120" cy="8" r="2" fill={GOLD} opacity="0.5" />
              <circle cx="120" cy="20" r="2" fill={GOLD} opacity="0.5" />
              <circle cx="130" cy="14" r="4" fill={GOLD} opacity="0.8" />
              <circle cx="140" cy="8" r="2" fill={GOLD} opacity="0.5" />
              <circle cx="140" cy="20" r="2" fill={GOLD} opacity="0.5" />
              <circle cx="152" cy="14" r="3" fill={GOLD} opacity="0.6" />
              <line x1="165" y1="14" x2="260" y2="14" stroke={GOLD} strokeWidth="0.5" />
              {/* Small petal accents */}
              <ellipse cx="130" cy="6" rx="2.5" ry="5" fill={GOLD} opacity="0.25" />
              <ellipse cx="130" cy="22" rx="2.5" ry="5" fill={GOLD} opacity="0.25" />
              <ellipse cx="118" cy="14" rx="5" ry="2.5" fill={GOLD} opacity="0.2" />
              <ellipse cx="142" cy="14" rx="5" ry="2.5" fill={GOLD} opacity="0.2" />
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
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", opacity: 0.35 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="8" cy="8" r="3" fill={GOLD} />
                <circle cx="16" cy="4" r="2" fill={GOLD} />
                <circle cx="4" cy="16" r="2" fill={GOLD} />
                <circle cx="14" cy="14" r="4" fill={GOLD} opacity="0.5" />
                <line x1="8" y1="8" x2="28" y2="28" stroke={GOLD} strokeWidth="0.5" />
                <line x1="16" y1="4" x2="28" y2="28" stroke={GOLD} strokeWidth="0.5" />
                <line x1="4" y1="16" x2="28" y2="28" stroke={GOLD} strokeWidth="0.5" />
              </svg>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ transform: "scaleX(-1)" }}>
                <circle cx="8" cy="8" r="3" fill={GOLD} />
                <circle cx="16" cy="4" r="2" fill={GOLD} />
                <circle cx="4" cy="16" r="2" fill={GOLD} />
                <circle cx="14" cy="14" r="4" fill={GOLD} opacity="0.5" />
                <line x1="8" y1="8" x2="28" y2="28" stroke={GOLD} strokeWidth="0.5" />
                <line x1="16" y1="4" x2="28" y2="28" stroke={GOLD} strokeWidth="0.5" />
                <line x1="4" y1="16" x2="28" y2="28" stroke={GOLD} strokeWidth="0.5" />
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

          {/* Soft floral row */}
          <div style={{ textAlign: "center", padding: "0.4rem 0", opacity: 0.3 }}>
            <svg width="200" height="16" viewBox="0 0 200 16" fill="none">
              <line x1="0" y1="8" x2="70" y2="8" stroke={GOLD} strokeWidth="0.5" />
              <circle cx="82" cy="8" r="2.5" fill={GOLD} />
              <circle cx="92" cy="4" r="1.5" fill={GOLD} />
              <circle cx="92" cy="12" r="1.5" fill={GOLD} />
              <circle cx="100" cy="8" r="3.5" fill={GOLD} />
              <circle cx="108" cy="4" r="1.5" fill={GOLD} />
              <circle cx="108" cy="12" r="1.5" fill={GOLD} />
              <circle cx="118" cy="8" r="2.5" fill={GOLD} />
              <line x1="130" y1="8" x2="200" y2="8" stroke={GOLD} strokeWidth="0.5" />
            </svg>
          </div>

          {/* QR code + tribute snippet */}
          <div style={{ padding: "0.9rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ flexShrink: 0, background: "#fff", padding: "6px", borderRadius: "4px" }}>
              <QRCodeSVG value={url} size={72} fgColor={DARK} bgColor="#ffffff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.6rem", color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.3rem" }}>
                Full memorial & RSVP
              </div>
              <div style={{ fontSize: "0.62rem", color: "#7a6a52", wordBreak: "break-all", marginBottom: "0.4rem" }}>
                {url}
              </div>
              <div style={{ fontSize: "0.62rem", color: "#a09070", fontStyle: "italic", lineHeight: 1.5 }}>
                Scan to view the memorial page, RSVP, and watch the live stream.
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
