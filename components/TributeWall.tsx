"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Tribute {
  id: number;
  name: string;
  relation: string;
  message: string;
  created_at: string;
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
      padding: "1rem 1.25rem",
      position: "relative",
    }}>
      <div style={{
        fontSize: "1.5rem",
        color: "var(--gold)",
        opacity: 0.3,
        fontFamily: "Georgia, serif",
        lineHeight: 1,
        marginBottom: "0.4rem",
      }}>"</div>
      <p style={{
        fontFamily: "var(--font-serif)",
        fontSize: "0.95rem",
        color: "#d4c4aa",
        lineHeight: 1.8,
        fontStyle: "italic",
        margin: "0 0 0.75rem",
      }}>
        {tribute.message}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <span style={{ fontSize: "0.85rem", color: "var(--cream)", fontWeight: 500 }}>
            {tribute.name}
          </span>
          {tribute.relation && (
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginLeft: "0.4rem" }}>
              · {tribute.relation}
            </span>
          )}
        </div>
        <span style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>{date}</span>
      </div>
    </div>
  );
}

export default function TributeWall({ slug, limit = 4 }: { slug: string; limit?: number }) {
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, count } = await supabase
        .from("keepingthem_rsvps")
        .select("id, name, relation, message, created_at", { count: "exact" })
        .eq("memorial_slug", slug)
        .not("message", "is", null)
        .neq("message", "")
        .order("created_at", { ascending: false })
        .limit(limit);

      setTributes(data ?? []);
      setTotal(count ?? 0);
      setLoading(false);
    }
    load();
  }, [slug, limit]);

  if (loading) {
    return (
      <div style={{ fontSize: "0.85rem", color: "var(--text-faint)", fontStyle: "italic", padding: "1rem 0" }}>
        Loading tributes…
      </div>
    );
  }

  if (tributes.length === 0) {
    return (
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "1.5rem",
        textAlign: "center",
        fontSize: "0.85rem",
        color: "var(--text-faint)",
        fontStyle: "italic",
      }}>
        Be the first to leave a tribute — scroll down to the RSVP section.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {tributes.map((t) => <TributeCard key={t.id} tribute={t} />)}
      </div>
      {total > limit && (
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <Link
            href={`/akan/${slug}/guestbook`}
            style={{
              color: "var(--gold)",
              fontSize: "0.82rem",
              textDecoration: "none",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              borderBottom: "1px solid var(--gold)",
              paddingBottom: "1px",
            }}
          >
            View all {total} tributes →
          </Link>
        </div>
      )}
    </div>
  );
}
