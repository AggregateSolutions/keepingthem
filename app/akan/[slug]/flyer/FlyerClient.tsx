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
            <div style={{ position: "relative", width: "100%", height: "260px", background: "#1a1208" }}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, transparent 50%, rgba(14,11,7,0.95) 100%)",
              }} />
            </div>
          )}

          {/* Name & years */}
          <div style={{ textAlign: "center", padding: "1rem 1.5rem 0.75rem", borderBottom: `1px solid #3a2e1a` }}>
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
