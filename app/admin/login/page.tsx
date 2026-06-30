"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") ?? "/admin/dashboard";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push(from);
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#1a1208", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "2rem",
    }}>
      <div style={{
        background: "#241a0a", border: "1px solid #c8962e", borderRadius: "8px",
        padding: "2.5rem 2rem", width: "100%", maxWidth: "360px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "1.5rem", color: "#c8962e", marginBottom: "0.25rem" }}>
            keepingthem.net
          </div>
          <div style={{ fontSize: "0.8rem", color: "#7a6a52", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Admin Panel
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#9a7a52", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "0.4rem" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              required
              style={{
                width: "100%", padding: "0.6rem 0.75rem", background: "#1a1208",
                border: "1px solid #4a3820", borderRadius: "4px", color: "#f5ead8",
                fontSize: "0.95rem", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{ fontSize: "0.82rem", color: "#d68f8f", background: "#1f0d0d", border: "1px solid #4a1a1a", borderRadius: "4px", padding: "0.5rem 0.75rem" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#c8962e", color: "#0e0b07", border: "none", borderRadius: "4px",
              padding: "0.7rem", fontSize: "0.9rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: "0.05em",
            }}
          >
            {loading ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
