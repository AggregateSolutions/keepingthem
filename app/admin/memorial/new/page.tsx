import AdminShell from "@/components/admin/AdminShell";
import MemorialEditor from "@/components/admin/MemorialEditor";
import type { MemorialConfig } from "@/types/memorial";

const AKAN_DEFAULTS: MemorialConfig = {
  slug: "",
  name: "",
  years: "",
  title: "",
  tribute: "",
  culture: "akan",
  dressCode: "black-and-white",
  adinkra: {
    symbol: "Gye Nyame",
    meaning: "Except for God — symbol of the supremacy and omnipotence of God",
  },
  photos: [{ src: "", alt: "Memorial photo", primaryDuration: 8000 }],
  funeralService: { name: "", address: "", phone: "", date: "", time: "" },
  thanksgiving: { date: "", time: "", location: "Private residence", privateLocation: true },
  stream: { url: "", label: "Watch the service live" },
  florists: [],
  program: { officiant: "", mc: "", items: [] },
  programPhotos: [
    { section: "A Life Well Lived", photos: [] },
    { section: "Cherished Memories", photos: [] },
    { section: "Family", photos: [] },
  ],
};

export default function NewMemorialPage() {
  return (
    <AdminShell title="New memorial">
      <MemorialEditor initial={AKAN_DEFAULTS} isNew />
    </AdminShell>
  );
}
