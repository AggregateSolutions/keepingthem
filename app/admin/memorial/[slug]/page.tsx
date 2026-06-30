import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import MemorialEditor from "@/components/admin/MemorialEditor";
import { getMemorialFromDb } from "@/lib/memorialDb";

export const dynamic = "force-dynamic";

export default async function EditMemorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await getMemorialFromDb(slug);
  if (!config) notFound();

  return (
    <AdminShell title={`Edit · ${config.name}`}>
      <MemorialEditor initial={config} isNew={false} />
    </AdminShell>
  );
}
