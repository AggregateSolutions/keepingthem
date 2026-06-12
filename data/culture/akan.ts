export const akanCulture = {
  name: "Akan",
  region: "Ghana",
  about:
    "The Akan people of Ghana are known for their rich traditions of oral history, craft, music, and ceremony. Funeral rites are among the most important cultural events — a time not just for mourning, but for celebration of a life fully lived.",

  dressCode: {
    standard: {
      label: "Red & Black",
      description:
        "Traditional Akan funerals use red and black as mourning colors. Red represents the blood of life; black signifies grief and transition.",
    },
    elder: {
      label: "Black & White",
      description:
        "When a person dies past the age of 70, the dress code shifts to black and white. White honors a long life fully lived — a cause for celebration, not only grief. For deaths past 90, white may be worn even more prominently.",
    },
    thanksgiving: {
      label: "White",
      description:
        "The Thanksgiving celebration, held the day after the funeral, is a joyful occasion. White is worn to celebrate the journey of the soul and give thanks for the life shared.",
    },
  },

  thanksgiving: {
    title: "What is the Thanksgiving?",
    body:
      "The Thanksgiving ceremony (sometimes called the 'final funeral rites') is held the day after the burial. It is a celebration — food, music, dancing, and gathering — to give thanks for the life of the deceased and to formally release the family from mourning. It is considered as important as the funeral itself.",
  },

  akuapem: {
    title: "About the Akuapem",
    body:
      "The Akuapem are a sub-group of the Akan from the Eastern Region of Ghana, with Akropong as their traditional capital. They are known for their Presbyterian heritage, their role in the translation of the first Twi Bible, and their community in the diaspora particularly in the American South. When Akuapem elders die, their homegoing is attended with great ceremony.",
  },

  adinkra: [
    {
      symbol: "Gye Nyame",
      glyph: "𐒔",
      meaning: "Except for God",
      description:
        "The most widely known Adinkra symbol. It represents the supremacy and omnipotence of God — that nothing exists or happens outside of God's knowledge and will. It appears at births, funerals, and rites of passage.",
    },
    {
      symbol: "Sankofa",
      glyph: "𐒕",
      meaning: "Return and fetch it",
      description:
        'Depicted as a bird looking backward, Sankofa teaches that it is not wrong to go back and reclaim what was left behind. It is a symbol of learning from the past. "Se wo were fi na wosankofa a yenkyi" — It is not wrong to go back for what you forgot.',
    },
    {
      symbol: "Nkyinkyim",
      glyph: "𐒓",
      meaning: "Adaptability",
      description:
        "This symbol of twisting and turning represents the ability to adapt to life's changing circumstances. It is a symbol of initiative, dynamism, and versatility.",
    },
    {
      symbol: "Dwennimmen",
      glyph: "𐒘",
      meaning: "Humility and strength",
      description:
        "The ram's horns symbol represents the combination of strength and humility. Even the strong must practice humility. This speaks to the character of elders who lead through service.",
    },
  ],
};

export type AkanCulture = typeof akanCulture;
