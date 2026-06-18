import { notFound } from "next/navigation";
import type { Metadata } from "next";
import akanMemorials from "@/data/akan";
import type { MemorialConfig } from "@/types/memorial";
import ProgramClient from "./ProgramClient";

const memorials: Record<string, MemorialConfig> = Object.fromEntries(
  akanMemorials.map((m) => [m.slug, m])
);

export function generateStaticParams() {
  return akanMemorials.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = memorials[slug];
  if (!m) return {};
  return { title: `Program · ${m.name} · keepingthem.net` };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = memorials[slug];
  if (!m) notFound();

  return <ProgramClient m={m} />;
}
