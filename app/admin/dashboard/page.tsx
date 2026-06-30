import { listMemorialsFromDb } from "@/lib/memorialDb";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import SeedButton from "@/components/admin/SeedButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const memorials = await listMemorialsFromDb();

  return (
    <AdminShell title="Memorials">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.85rem", color: "#7a6a52" }}>
          {memorials.length} memorial{memorials.length !== 1 ? "s" : ""} on file
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {memorials.length === 0 && <SeedButton />}
          <Link href="/admin/memorial/new" style={{
            background: "#c8962e", color: "#0e0b07", borderRadius: "4px",
            padding: "0.5rem 1.25rem", fontSize: "0.85rem", fontWeight: 600,
            textDecoration: "none", letterSpacing: "0.04em",
          }}>
            + New memorial
          </Link>
        </div>
      </div>

      {memorials.length === 0 ? (
        <div style={{
          background: "#241a0a", border: "1px solid #4a3820", borderRadius: "6px",
          padding: "2rem", textAlign: "center", color: "#7a6a52", fontSize: "0.9rem",
        }}>
          No memorials yet.{" "}
          <span style={{ color: "#9a7a52" }}>Use "Seed from files" above to import existing memorials, or create a new one.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {memorials.map((m) => {
            const config = m.config;
            return (
              <div key={m.slug} style={{
                background: "#241a0a", border: "1px solid #4a3820", borderRadius: "6px",
                padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Garamond, Georgia, serif", fontSize: "1.1rem", color: "#f5ead8", marginBottom: "0.15rem" }}>
                    {config.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#7a6a52" }}>
                    {config.culture} · {config.years}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Link href={`/admin/memorial/${m.slug}`} style={linkStyle("#c8962e")}>
                    Edit
                  </Link>
                  <Link href={`/akan/${m.slug}`} target="_blank" style={linkStyle("#4a3820", "#9a7a52")}>
                    View
                  </Link>
                  <Link href={`/akan/${m.slug}/flyer`} target="_blank" style={linkStyle("#4a3820", "#9a7a52")}>
                    Flyer
                  </Link>
                  <Link href={`/akan/${m.slug}/program`} target="_blank" style={linkStyle("#4a3820", "#9a7a52")}>
                    Program
                  </Link>
                  <Link href={`/admin/memorial/${m.slug}/rsvps`} style={linkStyle("#1a3a1a", "#6aaa6a")}>
                    RSVPs
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

function linkStyle(bg: string, color = "#0e0b07"): React.CSSProperties {
  return {
    background: bg, color, borderRadius: "4px", padding: "0.35rem 0.75rem",
    fontSize: "0.78rem", fontWeight: 600, textDecoration: "none",
    border: `1px solid ${bg}`, whiteSpace: "nowrap",
  };
}
