export interface MemorialConfig {
  slug: string;
  name: string;
  years: string;
  title: string;
  tribute: string;
  photos: { src: string; alt: string }[];
  funeralService: {
    name: string;
    address: string;
    phone: string;
    date: string;
    time: string;
  };
  thanksgiving: {
    date: string;
    time: string;
    location: string;
  };
  stream: {
    url: string;
    label: string;
  };
  florists: {
    name: string;
    phone: string;
    url: string;
    address?: string;
  }[];
  program: {
    officiant: string;
    items: { title: string; sub: string }[];
  };
  adinkra: {
    symbol: string;
    meaning: string;
  };
  culture: string;
  dressCode: "black-and-white" | "red-and-black";
}

export interface MemorialListing {
  slug: string;
  name: string;
  years: string;
  description: string;
  culture: string;
}
