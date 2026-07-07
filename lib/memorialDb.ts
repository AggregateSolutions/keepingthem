import type { MemorialConfig } from "@/types/memorial";

export type MemorialRow = {
  id: number;
  slug: string;
  culture: string;
  config: MemorialConfig;
  created_at: string;
  updated_at: string;
};

function ktHeaders(serviceRole = false) {
  const key = serviceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
    "Accept-Profile": "keepingthem",
    "Content-Profile": "keepingthem",
  };
}

function ktUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/keepingthem/v1/${path}`;
}

export async function getMemorialFromDb(slug: string): Promise<MemorialConfig | null> {
  const res = await fetch(
    ktUrl(`memorials?slug=eq.${encodeURIComponent(slug)}&select=config&limit=1`),
    { headers: ktHeaders() }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0]?.config ?? null;
}

export async function listMemorialsFromDb(): Promise<MemorialRow[]> {
  const res = await fetch(
    ktUrl("memorials?order=created_at.desc"),
    { headers: ktHeaders() }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function upsertMemorial(config: MemorialConfig): Promise<{ error: string | null }> {
  const res = await fetch(ktUrl("memorials?on_conflict=slug"), {
    method: "POST",
    headers: {
      ...ktHeaders(true),
      "Prefer": "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      slug: config.slug,
      culture: config.culture,
      config,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { error: body };
  }
  return { error: null };
}

export async function deleteMemorial(slug: string): Promise<{ error: string | null }> {
  const res = await fetch(
    ktUrl(`memorials?slug=eq.${encodeURIComponent(slug)}`),
    { method: "DELETE", headers: ktHeaders(true) }
  );
  if (!res.ok) {
    const body = await res.text();
    return { error: body };
  }
  return { error: null };
}
