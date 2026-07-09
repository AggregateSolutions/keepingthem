"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminShell({ children, title }: { children: React.ReactNode; title: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#1a1208", color: "#f5ead8", fontFamily: "sans-serif" }}>
      {/* Top nav */}
      <div style={{
        background: "#0e0b07", borderBottom: "1px solid #4a3820",
        padding: "0 1.5rem", display: "flex", alignItems: "center", gap: "1.5rem", height: "52px",
      }}>
        <Link href="/admin/dashboard" style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "1.1rem", color: "#c8962e", textDecoration: "none", fontWeight: 400 }}>
          keepingthem
        </Link>
        <span style={{ color: "#4a3820" }}>›</span>
        <span style={{ fontSize: "0.85rem", color: "#9a7a52" }}>Admin</span>
        <div style={{ flex: 1 }} />
        <Link href="/admin/dashboard" style={{ fontSize: "0.8rem", color: "#7a6a52", textDecoration: "none" }}>
          Dashboard
        </Link>
        <button
          onClick={handleLogout}
          style={{
            background: "none", border: "1px solid #4a3820", color: "#7a6a52",
            borderRadius: "4px", padding: "0.3rem 0.75rem", fontSize: "0.78rem",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1 style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "1.6rem", fontWeight: 400, color: "#c8962e", marginBottom: "1.5rem" }}>
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
