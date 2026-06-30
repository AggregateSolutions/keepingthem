"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SeedButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleSeed() {
    setLoading(true);
    setResult("");
    const res = await fetch("/api/admin/seed", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setResult(`Error: ${data.error}`);
      return;
    }

    const ok = data.results.filter((r: { ok: boolean }) => r.ok).length;
    const failed = data.results.filter((r: { ok: boolean }) => !r.ok).length;
    setResult(`Seeded ${ok}${failed > 0 ? `, ${failed} failed` : ""}`);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <button
        onClick={handleSeed}
        disabled={loading}
        style={{
          background: "none", border: "1px solid #4a3820", color: "#9a7a52",
          borderRadius: "4px", padding: "0.5rem 1rem", fontSize: "0.82rem",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Seeding…" : "Seed from files"}
      </button>
      {result && <span style={{ fontSize: "0.78rem", color: "#6aaa6a" }}>{result}</span>}
    </div>
  );
}
