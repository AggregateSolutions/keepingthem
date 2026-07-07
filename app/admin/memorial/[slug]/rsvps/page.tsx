import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import RsvpManager from "@/components/admin/RsvpManager";
import { getMemorialFromDb } from "@/lib/memorialDb";

export const dynamic = "force-dynamic";

export default async function RsvpsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await getMemorialFromDb(slug);
  if (!config) notFound();

  return (
    <AdminShell title={`RSVPs · ${config.name}`}>
      <div style={{ marginBottom: "1rem" }}>
        <a href={`/admin/memorial/${slug}`} style={{ fontSize: "0.82rem", color: "#9a7a52", textDecoration: "none" }}>
          ← Back to memorial
        </a>
      </div>
      <RsvpManager
        slug={slug}
        deceasedName={config.name}
        years={config.years}
        photoUrl={config.photos?.[0]?.src}
      />
    </AdminShell>
  );
}
