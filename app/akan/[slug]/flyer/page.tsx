import { notFound } from "next/navigation";
import type { Metadata } from "next";
import akanMemorials from "@/data/akan";
import type { MemorialConfig } from "@/types/memorial";
import FlyerClient from "./FlyerClient";

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
  return { title: `Flyer · ${m.name} · keepingthem.net` };
}

export default async function FlyerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = memorials[slug];
  if (!m) notFound();

  return <FlyerClient m={m} slug={slug} />;
}
