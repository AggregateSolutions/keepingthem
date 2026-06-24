import type { MemorialConfig } from "@/types/memorial";

const config: MemorialConfig = {
  slug: "benjamin-kwadwo-kwayisi",
  name: "Benjamin Kwadwo Kwayisi",
  years: "January 16th, 1936 – June 9th, 2026",
  title: "Elder, Father, Okyeame",
  tribute:
    "A man of quiet wisdom, unshakeable dignity, and deep roots. Born of Akropong, he carried the spirit of the Akan people across generations and oceans. His counsel was sought by many; his laughter is remembered by all.",
  photos: [
    { src: "/Papa_62.png", alt: "Memorial photo", primaryDuration: 8000 },
    // Add additional photos below — they will cycle every 4 seconds
      { src: "/Dad_Headshot_1.png",         alt: "" },
      { src: "/Dad_Goldas_Final_Grad.jpeg", alt: "Memorial photo" },
      //{ src: "/Dad_78th_birthday.png", alt: "Memorial photo" },
     // { src: "/Dad_Mom_1.png", alt: "Benjamin And His Boo" },
    // { src: "/photo-5.jpg", alt: "Memorial photo" },
    // { src: "/photo-6.jpg", alt: "Memorial photo" },
    //{ src: "/DAD_ENJOYING_A_LAUGH.jpeg", alt: "Memorial photo" },
  ],
  viewing: {
    date: "Saturday, June 27th, 2026",
    startTime: "11:00 AM",
    endTime: "1:00 PM",
  },
  funeralService: {
    name: "Hamilton Mill Memorial Chapel & Gardens",
    address: "3481 Hamilton Mill Rd, Buford, GA 30519",
    phone: "(770) 945-6924",
    date: "Saturday, June 27, 2026",
    time: "1:00 PM - 3:00 PM",
  },
  reception: {
    name: "Stonehedge Venue",
    address: "406 E. Shadburn Ave, Buford, GA 30518",
    date: "Saturday, June 27, 2026",
    time: "3:00 PM",
    notes: "A reception with food and fellowship will follow the service. Please RSVP so the family can prepare.",
  },
  thanksgiving: {
    date: "Sunday, June 28, 2026",
    time: "1:00 PM",
    location: "Private ResidenceDacula, GA",
    privateLocation: true,
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
    officiant: "Danny Newbern",
    mc: "Rueben Darko",
    items: [
      { title: "Gathering Music",                 sub: "Classical Arrangement"},
      { title: "Call To Order",                   sub: "Rueben Darko"},
      { title: "Procession ",                     sub: "" },
      { title: "Invocation",                      sub: "Pastor's Welcoming Message/Prayer - Pastor, Danny Newbern" },
      { title: "Music Dedication",                sub: "Aliah Aiken - Amazing Grace" },
      { title: "Scripture Reading",               sub: "Psalm 23 - Noah Kwayisi" },
      { title: "Obituary Reading",                sub: "Benjamin Kwayisi Jr" },
      { title: "Hymn",                            sub: "Blessed Assurance" },
      { title: "Music Dedication",                sub: "Aliah Aiken - You Raised Me Up" },
      { title: "Scripture Reading",               sub: "Isaiah 40:28-31 (For His Aviation Roots & Resilience) - Cairo Kwayisi" },
      { title: "Sermon",                          sub: "Pastor, Danny Newbern" },
      { title: "Ghanaian Music Dedication",       sub: "Juliet Tetteh-Hago" },
      { title: "Euology",                         sub: "Peter Onen" },
      //{ title: "Poem Reading",                    sub: "TBA"},
      { title: "Tributes",                        sub: "Family, Friends, Colleagues"},
      { title: "Thank You Message",               sub: "Golda Kwayisi"},
      { title: "Closing hymn",                    sub: "Rock of Ages" },
      //{ title: "Closing Musical Dedication",      sub: "Aliah Aiken - Its So Hard To Say Goodbye"},
      { title: "Closing Slideshow and Pallbearer Gathering", sub: ""},
      { title: "Committal & benediction",         sub: "" },
    ],
  },
  adinkra: {
    symbol: "Gye Nyame",
    meaning: "Except for God — symbol of the supremacy and omnipotence of God",
  },
  culture: "akan",
  dressCode: "black-and-white",

  programPhotos: [
    {
      section: "A Life Well Lived",
      photos: [
        { src: "/DAD_SOLO_1.jpeg",                 alt: "Portrait",             caption: "" },
        { src: "/Kwayisi_Family_Pics_2018_44.jpg", alt: "Kwayisi #1",           caption: ""  },
        { src: "/Dad_Headshot_2.png",              alt: "Portrait",             caption: "" },
        { src: "/Dad_Ghana_Aviation_1.png",        alt: "Ghana Aviation",       caption: "A life of service" },
        { src: "/Dad_Ghana_Aviation_2.png",        alt: "Ghana Aviation",       caption: "Scottland" },
        { src: "/Dad_Graduation_Aviation_1.png",   alt: "Aviation Graduation",  caption: "Master of Aviation  " },
        { src: "/Dad_Ghana_Comittee_1.png",        alt: "Ghana Committee",      caption: "" },
        { src: "/DAD_Muhammed_Others.png",         alt: "With friends",         caption: "World Vision Crew",   fit: "contain" },
      ],
    },
    {
      section: "Cherished Memories",
      photos: [
        { src: "/Dad_Mom_1.png",                   alt: "Benjamin and His Boo",   caption: "Together always" },
        { src: "/DAD_BABY_GOLDA_1.jpeg",           alt: "Dadys Girl",             caption: "Dad and Yaa" },
        { src: "/Kwayisi_Family_Pics_2018_40.jpg", alt: "She Loveves Her DAD!",                       caption: "A Daddy's Girl!" },
        { src: "/Dad_Mom_MrT_1.png",               alt: "Family moment",          caption: "Celebrating Extended Family" },
        { src: "/Dad_Christmas_WintersChapel.png", alt: "Christmas",              caption: "Tree Skills" },
        { src: "/DAD_AND_UNCLE_PETER.jpeg",        alt: "With Uncle Peter",       caption: "Good Friends" },
        { src: "/Dad_78th_birthday.png",           alt: "78th Birthday",          caption: "Celebrating 78 years" },
        { src: "/PAPPA_AND_HIS_GRANDKIDS_1.png",   alt: "A Blessing",             caption: "They've Always Looked Up To Him", position: "center 68%" },
      ],
    },
    {
      section: "Family",
      photos: [
        { src: "/Kwayisi_Family_Pics_2018_17.jpg", alt: "Kwayisi Wall",       fit: "contain"},
        { src: "/DAD_Family_Nelsons_1.png",        alt: "The Nelson Gang",    fit: "contain",         caption: "" },
        { src: "/SISTER_BERNICE_RIP.jpg",          alt: "Bernice Gloria Aboagye RIP",   caption: "" },
        { src: "/KWAYISI_SISTERS_GHANA.JPG",       alt: "Kwayisi Sisters",    caption: "" },
      ],
    },
  ],

  biography: `**Early Life, Education, and Early Aviation Career:**

Benjamin Kwadwo Kwayisi was born on January the 16th, 1936 in Otwitri, a suburb of Akropong in the Eastern Region of Ghana. He was born to Comfort Afua Afi and Kwaku Atiemo. Both are now deceased. Benjamin has three siblings, his sisters Lydia Yaboaa Atiemo, Margaret Amene Darko, and Victoria Obenewa Darko. As a young boy, Benjamin lived with his aunt and attended Akropong Presbyterian Primary and J.H.S., followed by attending Secondary school at Accra High School in Accra, Ghana’s capital city. After graduating high school, Benjamin did not have to perform his National Service and was able to go straight to Civil aviation. Usually, all who graduate from Ghanaian tertiary institutions must complete one-year of mandatory service in a professional post for the country.  

**First Marriage & Family:**

During part of his foundational chapter in Ghana, Benjamin married his late first wife, Beatrice Emelia Offei, in Akropong Ghana in 1959. Together, they were blessed with five children. Benjamin is survived by four of his children from this marriage. Christina Appiah, Patience Kwayisi, Susie Ohene Asante, and Esther Kwayisi. 

**Second Marriage & Path to America:**

Benjamin later found love and partnership again, marrying his beloved wife Margaret Kwayisi in Accra, Ghana. Together they welcomed their son Benjamin Kwayisi Jr. Driven by a lifelong commitment to learning and the desire to reach the pinnacle of his field, Benjamin made the momentous decision to relocate to the United States to further his education 

**Humanitarian Service and the Final Flight:**

Following his Graduation, he moved to Atlanta, Ga where he would find himself taking a position with World Vision. Answering a profound humanitarian call, he spent a little over 6 courageous months flying famine relief aid missions in Ethiopia, delivering life-saving food and supplies during a historic crisis. This selflessness would ultimately serve as the final proud chapter of his active piloting career.  

Upon returning from Africa, his focus shifted back to his family and his higher education. In 1985, while in Atlanta, he and his wife celebrated the birth of their daughter, Golda Meir Kwayisi, who would grow up to honor her father's dedication to service by becoming a surgeon. Following this chapter, his dedication to his craft brought him back to Florida, where he successfully obtained his Master’s degree in Aviation from Embry-Riddle. 

**Political Unrest & Systemic Barriers:**

While he was advancing his highest academic achievements and pursuing his Ph.D., his home country underwent a hostile political takeover led by Jerry Rawlings. Because Benjamin was entirely unaffiliated with the new ruling party, and there were political tensions brewing back home and civil aviation, he determined that returning home would not be advisable. This decision went on to weigh heavily on him as it separated him from his aviation roots, his culture, and his older children on a different continent.

Following his academic success, he set out to build a corporate and operational career in the United States, applying for high-level Air Traffic Control, corporate aviation management, and executive MBA-level roles. However, despite holding advanced degrees from Embry-Riddle and rare global flight experience, he faced a complex web of systemic challenges. As a foreign-born professional navigating the American corporate landscape in his late 40s, he encountered deep-seated institutional barriers. In an era where executive aviation roles lacked diverse representation, his accent, background, and age became arbitrary hurdles that overshadowed his immense capability. 

**A Legacy of Resilience, Hard Work, and Wisdom:**

Refusing to let these professional setbacks define his worth, Benjamin chose the path of humility and fierce devotion to his family. While working on his Ph.D., he relocated his family back to Atlanta and stepped into a completely new chapter, taking a role as a shipping clerk with the A.L. Williams Insurance Company (now known as Primerica). He dedicated himself to this work with the same excellence he brought to the skies, remaining with the company until his well-earned retirement in 2018. 

Beyond his professional achievements and his incredible resilience, Benjamin was known above all for his profound mind, his admiration for education, and the love he had for his family. Throughout his life, family and friends regularly came to him to seek counseling, drawn to his deep wisdom and grounded perspective. He never failed them, always offering a listening ear and guidance born from a life of rich experience, sacrifice, and integrity. `,

survivors: [
  { relation: "Wife", name: "Margaret Kwayisi" },
  { relation: "Son", name: "Benjamin Kwayisi Jr." },
  { relation: "Daughters", name: "Golda Meir Kwayisi, Christina Appiah, Patience Kwayisi, Susie Ohene Asante, and Esther Kwayisi" },
],
preceded: [
  { relation: "First Wife", name: "Beatrice Emelia Offei" },
  { relation: "Parents", name: "Comfort Afua Afi and Kwaku Atiemo" },
  { relation: "Daughter", name: "Bernice Gloria Aboagye" },
],

acknowledgements: {
  sections: [
    {
      title: "Chief Mourners",
      names: "Nana Agyiri Kumi (Aboasahene), Nana Obirago I (Aboasahemea), Abusuapanyin Kwame Ampomah, Obeapanyin Janet Korkor Debrah, Obeapanyin Victoria Obenewa Darko (Sister), Odikro Asa Kwadwo, Obeapanyin Yaa Ofobea, Obeapanyin Adwoa Ofobea, and Obeapanyin Amma Nyarkoa.",
    },
    {
      title: "Nephews and Nieces",
      names: "Mrs. Florence Bafour Asamoah & Siblings, Mrs. Irene Enyonam Gyimah & Siblings, Ellen Owusua & Siblings, and Mrs. Mercy Atramea Bekoe & Siblings.",
    },
  ],
  closing: "The family of Benjamin Kwadwo Kwayisi wishes to express their heartfelt gratitude to all who offered prayers, kind words, flowers, and unwavering support during this time of bereavement. Your love and presence bring comfort beyond measure.",
},

hymns: [
  {
    title: "Blessed Assurance",
    lyrics: `Blessed assurance, Jesus is mine!
O, what a foretaste of glory divine!
Heir of salvation, purchase of God,
born of His Spirit, washed in His blood.

This is my story, this is my song,
praising my Savior all the day long;
this is my story, this is my song,
praising my Savior all the day long.

Perfect submission, perfect delight,
visions of rapture now burst on my sight;
angels descending, bring from above
echoes of mercy, whispers of love.

This is my story, this is my song,
praising my Savior all the day long;
this is my story, this is my song,
praising my Savior all the day long.

Perfect submission, all is at rest,
I in my Savior am happy and blest;
watching and waiting, looking above,
filled with His goodness, lost in His love.

This is my story, this is my song,
praising my Savior all the day long;
this is my story, this is my song,
praising my Savior all the day long.`,
  },

  {
    title: "Rock of Ages",
    lyrics: `Rock of Ages, cleft for me,
let me hide myself in thee;
let the water and the blood,
from thy wounded side which flowed,
be of sin the double cure;
save from wrath and make me pure.

Not the labors of my hands
can fulfill thy law's demands;
could my zeal no respite know,
could my tears forever flow,
all for sin could not atone;
thou must save, and thou alone.

Nothing in my hand I bring,
simply to the cross I cling;
naked, come to thee for dress;
helpless, look to thee for grace;
foul, I to the fountain fly;
wash me, Savior, or I die.

While I draw this fleeting breath,
when mine eyes shall close in death,
when I soar to worlds unknown,
see thee on thy judgment throne,
Rock of Ages, cleft for me,
let me hide myself in thee.`,
  },
],
  };

export default config;
