"use client";

import type { MemorialConfig } from "@/types/memorial";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  BorderStyle,
  ShadingType,
  convertInchesToTwip,
  TableOfContents,
  LineRuleType,
} from "docx";

const GOLD_HEX  = "C8962E";
const BLACK_HEX = "000000";
const GRAY_HEX  = "555555";

// 5.5" × 8.5" in twips (1 inch = 1440 twips)
const PAGE_W = convertInchesToTwip(5.5);
const PAGE_H = convertInchesToTwip(8.5);
// Mirror margins: inner 0.875", outer 0.625", top/bottom 0.75"
const MARGIN_INNER  = convertInchesToTwip(0.875);
const MARGIN_OUTER  = convertInchesToTwip(0.625);
const MARGIN_TOP    = convertInchesToTwip(0.75);
const MARGIN_BOTTOM = convertInchesToTwip(0.75);

function spacer(pts = 6) {
  return new Paragraph({ spacing: { before: 0, after: 0, line: pts * 20, lineRule: LineRuleType.EXACT } });
}

function goldRule() {
  return new Paragraph({
    border: { bottom: { color: GOLD_HEX, size: 6, style: BorderStyle.SINGLE } },
    spacing: { before: convertInchesToTwip(0.1), after: convertInchesToTwip(0.1) },
  });
}

function coverPage(m: MemorialConfig): Paragraph[] {
  return [
    spacer(72),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "In Loving Memory", color: GOLD_HEX, size: 22, font: "Garamond" })],
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: m.name, bold: true, size: 52, font: "Garamond", color: BLACK_HEX })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: m.years, size: 28, font: "Garamond", color: GOLD_HEX, italics: true })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: m.title, size: 20, font: "Garamond", color: GRAY_HEX })],
      spacing: { after: 240 },
    }),
    // Photo placeholder
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: "F0E6D0", fill: "F0E6D0" },
      border: {
        top:    { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        bottom: { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        left:   { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        right:  { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
      },
      spacing: { before: 120, after: 120 },
      children: [new TextRun({ text: "[ COVER PHOTO ]", size: 18, color: GOLD_HEX, font: "Garamond", italics: true })],
    }),
    spacer(24),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: m.funeralService.date, size: 18, font: "Garamond", color: GRAY_HEX })],
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: m.funeralService.name, size: 18, font: "Garamond", color: GRAY_HEX })],
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: m.funeralService.address, size: 16, font: "Garamond", color: GRAY_HEX })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function tributePage(m: MemorialConfig): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "In Remembrance", size: 28, font: "Garamond", color: GOLD_HEX, bold: true })],
      spacing: { after: 160 },
    }),
    goldRule(),
    spacer(12),
    // Photo placeholder
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: "F0E6D0", fill: "F0E6D0" },
      border: {
        top:    { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        bottom: { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        left:   { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        right:  { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
      },
      spacing: { before: 80, after: 120 },
      children: [new TextRun({ text: "[ PHOTO ]", size: 16, color: GOLD_HEX, font: "Garamond", italics: true })],
    }),
    spacer(12),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: m.tribute, size: 20, font: "Garamond", italics: true, color: GRAY_HEX })],
      spacing: { after: 160, line: 360, lineRule: LineRuleType.AUTO },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function biographyPage(): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Biography", size: 28, font: "Garamond", color: GOLD_HEX, bold: true })],
      spacing: { after: 160 },
    }),
    goldRule(),
    spacer(12),
    new Paragraph({
      children: [new TextRun({
        text: "[ Insert biography here. Replace this placeholder with the full life story of the deceased. ]",
        size: 20, font: "Garamond", color: GRAY_HEX, italics: true,
      })],
      spacing: { after: 200, line: 360, lineRule: LineRuleType.AUTO },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function biographyContPage(): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Biography (continued)", size: 28, font: "Garamond", color: GOLD_HEX, bold: true })],
      spacing: { after: 160 },
    }),
    goldRule(),
    spacer(12),
    new Paragraph({
      children: [new TextRun({
        text: "[ Biography continued — add additional content here. Delete this page if not needed. ]",
        size: 20, font: "Garamond", color: GRAY_HEX, italics: true,
      })],
      spacing: { after: 200, line: 360, lineRule: LineRuleType.AUTO },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function orderOfServicePage(m: MemorialConfig): Paragraph[] {
  const items: Paragraph[] = [];

  items.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Order of Service", size: 28, font: "Garamond", color: GOLD_HEX, bold: true })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${m.funeralService.date}  ·  ${m.funeralService.time}`, size: 18, font: "Garamond", color: GRAY_HEX })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Officiant: ${m.program.officiant}`, size: 18, font: "Garamond", color: GRAY_HEX, italics: true })],
      spacing: { after: 160 },
    }),
    goldRule(),
    spacer(8),
  );

  m.program.items.forEach((item, i) => {
    items.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${String(i + 1).padStart(2, "0")}  `, size: 18, font: "Garamond", color: GOLD_HEX, bold: true }),
          new TextRun({ text: item.title, size: 20, font: "Garamond", color: BLACK_HEX, bold: true }),
          ...(item.sub ? [new TextRun({ text: `  ${item.sub}`, size: 18, font: "Garamond", color: GRAY_HEX })] : []),
        ],
        spacing: { before: 80, after: 80 },
        border: i < m.program.items.length - 1
          ? { bottom: { color: "E0D0B0", size: 2, style: BorderStyle.SINGLE } }
          : {},
      })
    );
  });

  items.push(new Paragraph({ children: [new PageBreak()] }));
  return items;
}

function hymnPage(num: number): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Hymn ${num}`, size: 22, font: "Garamond", color: GOLD_HEX })],
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "[ Hymn Title ]", size: 28, font: "Garamond", color: BLACK_HEX, bold: true })],
      spacing: { after: 160 },
    }),
    goldRule(),
    spacer(12),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "[ Insert hymn lyrics here — verse 1 ]",
        size: 20, font: "Garamond", color: GRAY_HEX, italics: true,
      })],
      spacing: { after: 120, line: 360, lineRule: LineRuleType.AUTO },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "[ Chorus ]",
        size: 20, font: "Garamond", color: GRAY_HEX, italics: true, bold: true,
      })],
      spacing: { after: 120, line: 360, lineRule: LineRuleType.AUTO },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "[ Insert hymn lyrics here — verse 2 ]",
        size: 20, font: "Garamond", color: GRAY_HEX, italics: true,
      })],
      spacing: { after: 120, line: 360, lineRule: LineRuleType.AUTO },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function photoSpread(label: string): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: label, size: 22, font: "Garamond", color: GOLD_HEX, italics: true })],
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: "F0E6D0", fill: "F0E6D0" },
      border: {
        top:    { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        bottom: { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        left:   { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        right:  { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
      },
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text: "[ PHOTO ]", size: 16, color: GOLD_HEX, font: "Garamond", italics: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "[ Caption ]", size: 16, font: "Garamond", color: GRAY_HEX, italics: true })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: "F0E6D0", fill: "F0E6D0" },
      border: {
        top:    { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        bottom: { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        left:   { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
        right:  { color: GOLD_HEX, size: 4, style: BorderStyle.SINGLE },
      },
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text: "[ PHOTO ]", size: 16, color: GOLD_HEX, font: "Garamond", italics: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "[ Caption ]", size: 16, font: "Garamond", color: GRAY_HEX, italics: true })],
      spacing: { after: 80 },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function reflectionsPage(): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Reflections", size: 28, font: "Garamond", color: GOLD_HEX, bold: true })],
      spacing: { after: 160 },
    }),
    goldRule(),
    spacer(12),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "[ Insert poem, scripture, or family reflection here ]",
        size: 20, font: "Garamond", color: GRAY_HEX, italics: true,
      })],
      spacing: { after: 200, line: 400, lineRule: LineRuleType.AUTO },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function acknowledgementsPage(): Paragraph[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Acknowledgements", size: 28, font: "Garamond", color: GOLD_HEX, bold: true })],
      spacing: { after: 160 },
    }),
    goldRule(),
    spacer(12),
    new Paragraph({
      children: [new TextRun({
        text: "The family of [ name ] wishes to express their heartfelt gratitude to all who have offered prayers, kind words, and support during this time of bereavement. Your love and presence bring comfort beyond measure.",
        size: 20, font: "Garamond", color: GRAY_HEX,
      })],
      spacing: { after: 160, line: 360, lineRule: LineRuleType.AUTO },
    }),
    new Paragraph({
      children: [new TextRun({
        text: "[ Add specific acknowledgements here — pallbearers, ushers, singers, clergy, organizations, etc. ]",
        size: 20, font: "Garamond", color: GRAY_HEX, italics: true,
      })],
      spacing: { after: 200, line: 360, lineRule: LineRuleType.AUTO },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function backCoverPage(m: MemorialConfig): Paragraph[] {
  return [
    spacer(48),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "☥", size: 64, color: GOLD_HEX, font: "Garamond" })],
      spacing: { after: 160 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: m.adinkra.symbol, size: 28, font: "Garamond", color: GOLD_HEX, bold: true })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: m.adinkra.meaning, size: 20, font: "Garamond", color: GRAY_HEX, italics: true })],
      spacing: { after: 240 },
    }),
    goldRule(),
    spacer(24),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: `${m.name}  ·  ${m.years}`,
        size: 22, font: "Garamond", color: BLACK_HEX,
      })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "Until we meet again.",
        size: 20, font: "Garamond", color: GRAY_HEX, italics: true,
      })],
      spacing: { after: 240 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: `keepingthem.net/akan/${m.slug}`,
        size: 16, font: "Garamond", color: GOLD_HEX,
      })],
    }),
  ];
}

async function generateDoc(m: MemorialConfig): Promise<Blob> {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: {
            top:    MARGIN_TOP,
            bottom: MARGIN_BOTTOM,
            left:   MARGIN_INNER,
            right:  MARGIN_OUTER,
          },
        },
      },
      children: [
        ...coverPage(m),
        ...tributePage(m),
        ...biographyPage(),
        ...biographyContPage(),
        ...orderOfServicePage(m),
        ...hymnPage(1),
        ...hymnPage(2),
        ...hymnPage(3),
        ...photoSpread("A Life Well Lived"),
        ...photoSpread("Cherished Memories"),
        ...photoSpread("Family"),
        ...photoSpread("Friends & Community"),
        ...reflectionsPage(),
        ...acknowledgementsPage(),
        ...backCoverPage(m),
      ],
    }],
  });

  return await Packer.toBlob(doc);
}

export default function ProgramClient({ m }: { m: MemorialConfig }) {
  async function handleDownload() {
    const blob = await generateDoc(m);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${m.slug}-program.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1208",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1.5rem",
      padding: "2rem",
      fontFamily: "sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "0.75rem", color: "#c8962e", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
          Program Booklet
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.8rem", color: "#f0e6d0", fontWeight: 400, margin: "0 0 0.25rem" }}>
          {m.name}
        </h1>
        <div style={{ color: "#7a6a52", fontSize: "0.9rem" }}>{m.years}</div>
      </div>

      <div style={{ background: "#2a1e10", border: "1px solid #5a3a1a", borderRadius: "4px", padding: "1.25rem 1.5rem", maxWidth: 380, fontSize: "0.82rem", color: "#a09070", lineHeight: 1.7 }}>
        <strong style={{ color: "#c8962e", display: "block", marginBottom: "0.4rem" }}>Before downloading</strong>
        The .docx file includes placeholder text for biography, hymn lyrics, photos, and acknowledgements.
        Open in Microsoft Word or Google Docs to fill in the content, insert photos, and adjust formatting before converting to PDF.
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={handleDownload}
          style={{
            background: "#c8962e", color: "#0e0b07", border: "none", borderRadius: "4px",
            padding: "0.7rem 1.75rem", fontSize: "0.9rem", fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.05em",
          }}
        >
          Download Program (.docx)
        </button>
        <a
          href={`/akan/${m.slug}`}
          style={{
            background: "transparent", color: "#c8962e", border: "1px solid #c8962e",
            borderRadius: "4px", padding: "0.7rem 1.5rem", fontSize: "0.9rem",
            textDecoration: "none", letterSpacing: "0.05em",
          }}
        >
          ← Memorial page
        </a>
      </div>

      <div style={{ fontSize: "0.72rem", color: "#4a3a2a" }}>
        5.5″ × 8.5″ · Center-bound booklet · 16 pages
      </div>
    </div>
  );
}
