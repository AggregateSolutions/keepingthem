"use client";

import { useEffect, useState } from "react";

export default function StickyRsvpButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <a
      href="#rsvp"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 100,
        background: "var(--gold)",
        color: "var(--bg-deep)",
        fontFamily: "var(--font-sans)",
        fontSize: "0.85rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        textDecoration: "none",
        padding: "0.65rem 1.25rem",
        borderRadius: "4px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
        transition: "opacity 0.2s",
      }}
    >
      RSVP
    </a>
  );
}
