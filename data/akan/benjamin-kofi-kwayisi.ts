import type { MemorialConfig } from "@/types/memorial";

const config: MemorialConfig = {
  slug: "benjamin-kofi-kwayisi",
  name: "Benjamin Kwadwo Kwayisi",
  years: "1936 – 2026",
  title: "Elder, Father, Okyeame",
  tribute:
    "A man of quiet wisdom, unshakeable dignity, and deep roots. Born of Akropong, he carried the spirit of the Akan people across generations and oceans. His counsel was sought by many; his laughter was remembered by all.",
  photos: [
    // { src: "/photos/kofi-1.jpg", alt: "Kofi Acheampong" },
    // { src: "/photos/kofi-2.jpg", alt: "Kofi Acheampong" },
  ],
  funeralService: {
    name: "Hamilton Mill Memorial Chapel & Gardens",
    address: "3481 Hamilton Mill Rd, Buford, GA 30501",
    phone: "(770) 945-6924",
    date: "Saturday, June 27, 2026",
    time: "11:00 AM",
  },
  thanksgiving: {
    date: "Sunday, June 28, 2026",
    time: "1:00 PM",
    location: "2029 Mapmaker Dr, Dacula, GA 30019",
  },
  stream: {
    url: "",
    label: "Watch the service live",
  },
  florists: [
    { name: "Petal & Grace Flowers",  phone: "(770) 555-0200", url: "" },
    { name: "Blooms by Adwoa",        phone: "(770) 555-0311", url: "" },
    { name: "Garden of Remembrance",  phone: "(770) 555-0445", url: "" },
  ],
  program: {
    officiant: "Rev. Emmanuel Asare",
    items: [
      { title: "Processional & opening prayer",  sub: "" },
      { title: "Scripture reading",              sub: "Psalm 23" },
      { title: "Hymn",                           sub: "Yen Ara Asase Ni" },
      { title: "Family tribute",                 sub: "" },
      { title: "Community tribute",              sub: "" },
      { title: "Homily",                         sub: "" },
      { title: "Closing hymn",                   sub: "" },
      { title: "Committal & benediction",        sub: "" },
    ],
  },
  adinkra: {
    symbol: "Gye Nyame",
    meaning: "Except for God — symbol of the supremacy and omnipotence of God",
  },
  culture: "akan",
  dressCode: "black-and-white",
};

export default config;
