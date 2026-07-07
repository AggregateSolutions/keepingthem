export type EcardData = {
  deceasedName: string;
  years: string;
  photoUrl?: string;
  recipientFirstName: string;
  recipientFullName: string;
  relation?: string;
  events?: string;
  message: string;
  familyName: string;
  signatureUrl?: string;
  contributionNote?: string;
};

const GOLD = "#c8962e";
const PAGE_BG = "#fdf6ec";
const DARK_TEXT = "#1a1208";
const MID_TEXT = "#4a3820";
const FAINT_TEXT = "#9a7a52";
const BORDER = "#d4a84a";

// Kente stripe as an HTML table — works in all email clients
const KENTE_STRIPE = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
  <tr>
    <td style="height:8px;background:#c8962e;"></td>
    <td style="height:8px;background:#1a5c1a;"></td>
    <td style="height:8px;background:#8b1a1a;"></td>
    <td style="height:8px;background:#c8962e;"></td>
    <td style="height:8px;background:#1a5c1a;"></td>
    <td style="height:8px;background:#8b1a1a;"></td>
    <td style="height:8px;background:#c8962e;"></td>
    <td style="height:8px;background:#1a5c1a;"></td>
    <td style="height:8px;background:#8b1a1a;"></td>
    <td style="height:8px;background:#c8962e;"></td>
    <td style="height:8px;background:#1a5c1a;"></td>
    <td style="height:8px;background:#8b1a1a;"></td>
  </tr>
</table>`;

// Floral SVG divider — centered
const FLORAL_DIVIDER = `
<div style="text-align:center;margin:0.75rem 0;">
  <svg width="280" height="32" viewBox="0 0 300 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 18 Q40 12 80 18 Q100 22 110 16" stroke="${GOLD}" stroke-width="0.8" opacity="0.45" fill="none"/>
    <path d="M190 16 Q200 22 220 18 Q260 12 300 18" stroke="${GOLD}" stroke-width="0.8" opacity="0.45" fill="none"/>
    <ellipse cx="30" cy="13" rx="5" ry="2.5" fill="${GOLD}" opacity="0.2" transform="rotate(-15 30 13)"/>
    <ellipse cx="65" cy="21" rx="5" ry="2.5" fill="${GOLD}" opacity="0.2" transform="rotate(10 65 21)"/>
    <ellipse cx="235" cy="21" rx="5" ry="2.5" fill="${GOLD}" opacity="0.2" transform="rotate(20 235 21)"/>
    <ellipse cx="270" cy="13" rx="5" ry="2.5" fill="${GOLD}" opacity="0.2" transform="rotate(-10 270 13)"/>
    <circle cx="150" cy="18" r="5" fill="${GOLD}" opacity="0.8"/>
    <ellipse cx="150" cy="8" rx="3" ry="6" fill="${GOLD}" opacity="0.4"/>
    <ellipse cx="150" cy="28" rx="3" ry="6" fill="${GOLD}" opacity="0.4"/>
    <ellipse cx="140" cy="18" rx="6" ry="3" fill="${GOLD}" opacity="0.4"/>
    <ellipse cx="160" cy="18" rx="6" ry="3" fill="${GOLD}" opacity="0.4"/>
    <ellipse cx="143" cy="11" rx="3" ry="6" fill="${GOLD}" opacity="0.25" transform="rotate(-45 143 11)"/>
    <ellipse cx="157" cy="11" rx="3" ry="6" fill="${GOLD}" opacity="0.25" transform="rotate(45 157 11)"/>
    <ellipse cx="143" cy="25" rx="3" ry="6" fill="${GOLD}" opacity="0.25" transform="rotate(45 143 25)"/>
    <ellipse cx="157" cy="25" rx="3" ry="6" fill="${GOLD}" opacity="0.25" transform="rotate(-45 157 25)"/>
    <circle cx="150" cy="18" r="2.5" fill="${PAGE_BG}" opacity="0.7"/>
  </svg>
</div>`;

// Gold rule line
const GOLD_RULE = `<div style="height:1px;background:linear-gradient(to right,transparent,${GOLD},transparent);margin:0.5rem 0;"></div>`;

export function buildEcardHtml(data: EcardData): string {
  const {
    deceasedName,
    years,
    photoUrl,
    recipientFirstName,
    recipientFullName,
    relation,
    events,
    message,
    familyName,
    signatureUrl,
    contributionNote,
  } = data;

  const personalizedMessage = message
    .replace(/\{name\}/g, recipientFirstName)
    .replace(/\{fullname\}/g, recipientFullName)
    .replace(/\{relation\}/g, relation || "friend")
    .replace(/\{events\}/g, events || "the service");

  const photoSection = photoUrl ? `
    <tr>
      <td align="center" style="padding:1.25rem 0 0.5rem;">
        <img src="${photoUrl}"
          alt="${deceasedName}"
          width="160" height="160"
          style="width:160px;height:160px;object-fit:cover;border:2px solid ${BORDER};display:block;" />
      </td>
    </tr>` : "";

  const contributionSection = contributionNote ? `
    <tr>
      <td style="padding:0 2rem 0.75rem;">
        <p style="font-family:Georgia,'Cormorant Garamond',serif;font-size:0.95rem;color:${FAINT_TEXT};font-style:italic;text-align:center;margin:0;line-height:1.7;">
          ${contributionNote}
        </p>
      </td>
    </tr>` : "";

  const signatureSection = signatureUrl
    ? `<img src="${signatureUrl}" alt="Family signature" style="max-width:200px;max-height:72px;display:block;margin-top:1rem;" />`
    : `<div style="font-family:Georgia,'Cormorant Garamond',serif;font-size:1.1rem;color:${GOLD};font-style:italic;margin-top:0.75rem;">The ${familyName} Family</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>In Loving Memory of ${deceasedName}</title>
</head>
<body style="margin:0;padding:0;background:#e8dcc8;font-family:Georgia,'Cormorant Garamond',serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:#e8dcc8;">
    <tr>
      <td align="center" style="padding:24px 16px;">

        <!-- Card outer border -->
        <table width="580" cellpadding="0" cellspacing="0" border="0" role="presentation"
          style="max-width:580px;width:100%;background:${PAGE_BG};border:2px solid ${BORDER};">

          <!-- Kente top -->
          <tr><td>${KENTE_STRIPE}</td></tr>

          <!-- Inner gold border line -->
          <tr>
            <td style="padding:6px 6px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr><td style="border:1px solid ${GOLD};opacity:0.35;height:1px;font-size:0;"></td></tr>
              </table>
            </td>
          </tr>

          <!-- Header: In Loving Memory -->
          <tr>
            <td align="center" style="padding:1.5rem 2rem 0;">
              <div style="font-family:Georgia,serif;font-size:0.7rem;color:${FAINT_TEXT};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:0.15rem;">
                In Loving Memory
              </div>
              ${FLORAL_DIVIDER}
              <div style="font-family:Georgia,'Cormorant Garamond',serif;font-size:2rem;color:${DARK_TEXT};letter-spacing:0.04em;line-height:1.2;margin:0.25rem 0 0.1rem;">
                ${deceasedName}
              </div>
              <div style="font-family:Georgia,serif;font-size:1rem;color:${GOLD};letter-spacing:0.14em;margin-bottom:0.5rem;">
                ${years}
              </div>
              ${GOLD_RULE}
            </td>
          </tr>

          <!-- Photo -->
          ${photoSection}

          <!-- Floral divider -->
          <tr><td align="center">${FLORAL_DIVIDER}</td></tr>

          <!-- Contribution note -->
          ${contributionSection}

          <!-- Message body -->
          <tr>
            <td style="padding:0 2rem 0.5rem;">
              ${personalizedMessage.split("\n\n").map(para => para.trim()).filter(Boolean).map(para =>
                `<p style="font-family:Georgia,'Cormorant Garamond',serif;font-size:1.05rem;color:${DARK_TEXT};line-height:1.9;margin:0 0 0.9rem;">${para.replace(/\n/g, "<br/>")}</p>`
              ).join("")}
              ${signatureSection}
            </td>
          </tr>

          <!-- Floral divider -->
          <tr><td align="center">${FLORAL_DIVIDER}</td></tr>

          <!-- Inner gold border line bottom -->
          <tr>
            <td style="padding:0 6px 6px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr><td style="border:1px solid ${GOLD};opacity:0.35;height:1px;font-size:0;"></td></tr>
              </table>
            </td>
          </tr>

          <!-- Kente bottom -->
          <tr><td>${KENTE_STRIPE}</td></tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:0.6rem 2rem;">
              <div style="font-size:0.72rem;color:#b0a090;font-style:italic;">
                keepingthem.net — honoring lives in the tradition of their people
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}
