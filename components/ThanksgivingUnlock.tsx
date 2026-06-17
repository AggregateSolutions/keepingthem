"use client";

import { useState } from "react";

export default function ThanksgivingUnlock({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passphrase.trim() || locked) return;
    setLoading(true);
    setError("");

    const res = await fetch("/.netlify/functions/unlock-thanksgiving", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passphrase: passphrase.trim(), slug }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.status === 429) {
      setLocked(true);
      setError(data.error);
      return;
    }

    if (!res.ok) {
      setError(data.error ?? "Incorrect passphrase.");
      return;
    }

    // Store in component state only — never persisted
    setLocation(data.location);
    setPassphrase("");
  }

  if (location) {
    return (
      <span style={{ color: "var(--text-mid)" }}>{location}</span>
    );
  }

  return (
    <span>
      <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Private residence · Dacula, GA</span>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            marginLeft: "0.6rem", background: "none", border: "none",
            color: "var(--gold)", fontSize: "0.8rem", cursor: "pointer",
            textDecoration: "underline", padding: 0, fontFamily: "var(--font-sans)",
          }}
        >
          View address
        </button>
      )}
      {open && (
        <form onSubmit={handleSubmit} style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <input
            type="text"
            placeholder="Enter family passphrase"
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
            disabled={locked}
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem", maxWidth: "220px" }}
            autoFocus
          />
          {error && (
            <div style={{ fontSize: "0.78rem", color: "#d68f8f" }}>{error}</div>
          )}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="submit"
              disabled={loading || locked}
              style={{
                background: "var(--gold)", color: "var(--bg-deep)", border: "none",
                borderRadius: "4px", padding: "0.35rem 0.9rem", fontSize: "0.8rem",
                cursor: loading || locked ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              {loading ? "Checking…" : "Unlock"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setError(""); setPassphrase(""); }}
              style={{
                background: "none", border: "none", color: "var(--text-faint)",
                fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-sans)",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </span>
  );
}
