"use client";

import { useState, useEffect, useCallback } from "react";

interface Photo {
  src: string;
  alt: string;
  primaryDuration?: number; // ms — only used for index 0
}

interface Props {
  photos: Photo[];
  defaultDuration?: number; // ms for non-primary photos
}

function PhotoFrame({ src, alt, fading }: { src: string; alt: string; fading?: boolean }) {
  return (
    <div style={{ position: "relative", width: "100%", height: 780, overflow: "hidden" }}>
      {/* Blurred background fills side bars */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          filter: "blur(18px) brightness(0.4) saturate(0.7)",
          transform: "scale(1.1)",
        }}
      />
      {/* Sharp foreground image — full subject visible */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          position: "relative",
          display: "block",
          margin: "0 auto",
          height: "100%",
          width: "auto",
          maxWidth: "100%",
          objectFit: "contain",
          opacity: fading ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      />
    </div>
  );
}

export default function PhotoSlideshow({ photos, defaultDuration = 4000 }: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 300);
  }, []);

  const next = useCallback(() => goTo((current + 1) % photos.length), [current, photos.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + photos.length) % photos.length), [current, photos.length, goTo]);

  // Auto-advance — primary photo (index 0) gets its own longer duration
  useEffect(() => {
    if (photos.length <= 1) return;
    const duration = current === 0
      ? (photos[0].primaryDuration ?? defaultDuration)
      : defaultDuration;
    const timer = setTimeout(next, duration);
    return () => clearTimeout(timer);
  }, [current, photos, defaultDuration, next]);

  if (photos.length === 0) return null;

  // Single photo — no controls needed
  if (photos.length === 1) {
    return (
      <div style={{ marginBottom: "1.5rem", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border)" }}>
        <PhotoFrame src={photos[0].src} alt={photos[0].alt} />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {/* Main photo frame */}
      <div style={{ position: "relative", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border)" }}>
        <PhotoFrame src={photos[current].src} alt={photos[current].alt} fading={fading} />

        {/* Prev arrow */}
        <button
          onClick={prev}
          aria-label="Previous photo"
          style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            background: "rgba(15,12,9,0.65)", border: "1px solid var(--border)",
            borderRadius: "2px", color: "var(--gold)", width: 36, height: 36,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem",
          }}
        >
          ‹
        </button>

        {/* Next arrow */}
        <button
          onClick={next}
          aria-label="Next photo"
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "rgba(15,12,9,0.65)", border: "1px solid var(--border)",
            borderRadius: "2px", color: "var(--gold)", width: 36, height: 36,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem",
          }}
        >
          ›
        </button>

        {/* Photo counter */}
        <div style={{
          position: "absolute", bottom: 10, right: 12,
          background: "rgba(15,12,9,0.7)", borderRadius: "2px",
          padding: "2px 8px", fontSize: "0.72rem", color: "var(--text-muted)",
          letterSpacing: "0.06em",
        }}>
          {current + 1} / {photos.length}
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to photo ${i + 1}`}
            style={{
              width: i === current ? 20 : 8,
              height: 8,
              borderRadius: "4px",
              background: i === current ? "var(--gold)" : "var(--border)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "width 0.3s ease, background 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
