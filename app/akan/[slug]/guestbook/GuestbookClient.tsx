"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Tribute {
  id: number;
  name: string;
  relation: string;
  message: string;
  created_at: string;
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase() + ".";
  return parts[0][0].toUpperCase() + ". " + parts[parts.length - 1][0].toUpperCase() + ".";
}

function TributeCard({ tribute }: { tribute: Tribute }) {
  const date = new Date(tribute.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      padding: "1.25rem 1.5rem",
    }}>
      <div style={{
        fontSize: "1.8rem",
        color: "var(--gold)",
        opacity: 0.25,
        fontFamily: "Georgia, serif",
        lineHeight: 1,
        marginBottom: "0.5rem",
      }}>"</div>
      <p style={{
        fontFamily: "var(--font-serif)",
        fontSize: "1rem",
        color: "#d4c4aa",
        lineHeight: 1.85,
        fontStyle: "italic",
        margin: "0 0 1rem",
      }}>
        {tribute.message}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--border)", paddingTop: "0.6rem" }}>
        <div>
          <span style={{ fontSize: "0.9rem", color: "var(--cream)", fontWeight: 500 }}>
            {toInitials(tribute.name)}
          </span>
          {tribute.relation && (
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
              · {tribute.relation}
            </span>
          )}
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>{date}</span>
      </div>
    </div>
  );
}

export default function GuestbookClient({ slug, name }: { slug: string; name: string }) {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("keepingthem_rsvps")
        .select("id, name, relation, message, created_at")
        .eq("memorial_slug", slug)
        .not("message", "is", null)
        .neq("message", "")
        .order("created_at", { ascending: false });

      setTributes(data ?? []);
      setLoading(false);
    }
    load();
  }, [slug]);

  return (
    <div>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: "2rem" }}>
        Those who loved {name} have left these words. May they bring comfort to the family and keep his memory alive.
      </p>

      {loading ? (
        <div style={{ fontSize: "0.85rem", color: "var(--text-faint)", fontStyle: "italic" }}>
          Loading tributes…
        </div>
      ) : tributes.length === 0 ? (
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "2rem",
          textAlign: "center",
          fontSize: "0.9rem",
          color: "var(--text-faint)",
          fontStyle: "italic",
        }}>
          No tributes yet. Be the first — RSVP on the{" "}
          <a href={`/akan/${slug}#rsvp`} style={{ color: "var(--gold)", textDecoration: "none" }}>
            memorial page
          </a>{" "}
          and leave a message for the family.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tributes.map((t) => <TributeCard key={t.id} tribute={t} />)}
        </div>
      )}

      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <a
          href={`/akan/${slug}#rsvp`}
          style={{
            display: "inline-block",
            color: "var(--gold)",
            border: "1px solid var(--gold)",
            borderRadius: "4px",
            padding: "0.6rem 1.5rem",
            fontSize: "0.82rem",
            textDecoration: "none",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Leave a tribute
        </a>
      </div>
    </div>
  );
}
