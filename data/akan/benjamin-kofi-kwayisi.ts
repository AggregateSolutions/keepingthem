import type { MemorialConfig } from "@/types/memorial";

const config: MemorialConfig = {
  slug: "benjamin-kofi-kwayisi",
  name: "Benjamin Kwadwo Kwayisi",
  years: "1936 – 2026",
  title: "Elder, Father, Okyeame",
  tribute:
    "A man of quiet wisdom, unshakeable dignity, and deep roots. Born of Akropong, he carried the spirit of the Akan people across generations and oceans. His counsel was sought by many; his laughter was remembered by all.",
  photos: [
    { src: "/Papa_62.png", alt: "Memorial photo", primaryDuration: 8000 },
    // Add additional photos below — they will cycle every 4 seconds
    // { src: "/photo-2.jpg", alt: "Memorial photo" },
    // { src: "/photo-3.jpg", alt: "Memorial photo" },
    // { src: "/photo-4.jpg", alt: "Memorial photo" },
    // { src: "/photo-5.jpg", alt: "Memorial photo" },
    // { src: "/photo-6.jpg", alt: "Memorial photo" },
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
    { name: "Flower Jazz",             phone: "(770) 781-9465", url: "https://www.flowerjazz.net",             address: "1862 Auburn Rd Suite 106, Dacula, GA" },
    { name: "The Velvet Stem",         phone: "(678) 575-4840", url: "https://www.velvetstem.com",             address: "1854 Granite Hill Ct, Hoschton, GA" },
    { name: "Kroger Floral Buford",    phone: "(770) 614-1081", url: "https://www.kroger.com/stores/floral/ga/buford", address: "3300 Hamilton Mill Rd, Buford, GA" },
    { name: "Design House of Flowers", phone: "(770) 904-4488", url: "https://www.designhouseofflowers.com",   address: "1605 Buford Hwy Suite D, Buford, GA" },
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
