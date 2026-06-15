export interface MemorialConfig {
  slug: string;
  name: string;
  years: string;
  title: string;
  tribute: string;
  photos: { src: string; alt: string; primaryDuration?: number }[];
  viewing?: {
    date: string;
    startTime: string;
    endTime: string;
  };
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
  reception?: {
    name: string;
    address: string;
    date: string;
    time: string;
    notes?: string;
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
