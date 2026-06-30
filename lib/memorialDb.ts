import { supabase } from "./supabase";
import { getAdminClient } from "./supabaseAdmin";
import type { MemorialConfig } from "@/types/memorial";

export type MemorialRow = {
  id: number;
  slug: string;
  culture: string;
  config: MemorialConfig;
  created_at: string;
  updated_at: string;
};

export async function getMemorialFromDb(slug: string): Promise<MemorialConfig | null> {
  const { data, error } = await supabase
    .from("memorials")
    .select("config")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data.config as MemorialConfig;
}

export async function listMemorialsFromDb(): Promise<MemorialRow[]> {
  const { data, error } = await supabase
    .from("memorials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as MemorialRow[];
}

export async function upsertMemorial(config: MemorialConfig): Promise<{ error: string | null }> {
  const { error } = await getAdminClient()
    .from("memorials")
    .upsert({
      slug: config.slug,
      culture: config.culture,
      config,
      updated_at: new Date().toISOString(),
    }, { onConflict: "slug" });

  return { error: error?.message ?? null };
}

export async function deleteMemorial(slug: string): Promise<{ error: string | null }> {
  const { error } = await getAdminClient()
    .from("memorials")
    .delete()
    .eq("slug", slug);

  return { error: error?.message ?? null };
}
