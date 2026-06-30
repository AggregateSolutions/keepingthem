import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { getAdminClient } from "@/lib/supabaseAdmin";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function isAuthorized(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  return !!process.env.ADMIN_PASSWORD && token === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, message, deceasedName } = await req.json();

  if (!slug || !message) {
    return NextResponse.json({ error: "slug and message are required" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Fetch all RSVPs for this memorial that have an email
  const { data: rsvps, error } = await supabase
    .schema("public")
    .from("keepingthem_rsvps")
    .select("name, email, attend_funeral, attend_reception, attend_thanksgiving")
    .eq("memorial_slug", slug)
    .not("email", "is", null)
    .neq("email", "");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rsvps || rsvps.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  let sent = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const rsvp of rsvps) {
    const firstName = rsvp.name.split(" ")[0];

    const events = [
      rsvp.attend_funeral && "the funeral service",
      rsvp.attend_reception && "the reception",
      rsvp.attend_thanksgiving && "the thanksgiving celebration",
    ].filter(Boolean).join(", ");

    const personalizedMessage = message
      .replace(/\{name\}/g, firstName)
      .replace(/\{fullname\}/g, rsvp.name)
      .replace(/\{events\}/g, events || "the service");

    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a1208;background:#fdf6ec;padding:2rem;border:1px solid #d4a84a;">
        <div style="text-align:center;margin-bottom:1.5rem;">
          <div style="font-size:0.75rem;color:#9a7a52;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:0.5rem;">
            keepingthem.net
          </div>
          <div style="height:1px;background:linear-gradient(to right,transparent,#c8962e,transparent);margin-bottom:1rem;"></div>
          <div style="font-size:1rem;color:#c8962e;letter-spacing:0.1em;">
            In Loving Memory of ${deceasedName}
          </div>
        </div>

        <p style="font-size:1.05rem;line-height:1.85;white-space:pre-wrap;">${personalizedMessage}</p>

        <div style="height:1px;background:linear-gradient(to right,transparent,#c8962e,transparent);margin:1.5rem 0;"></div>
        <div style="text-align:center;font-size:0.8rem;color:#9a7a52;font-style:italic;">
          keepingthem.net — honoring lives in the tradition of their people
        </div>
      </div>
    `;

    const { error: sendError } = await getResend().emails.send({
      from: "keepingthem.net <noreply@droptools.net>",
      to: rsvp.email,
      subject: `A message from the family of ${deceasedName}`,
      html,
    });

    if (sendError) {
      failed++;
      failures.push(rsvp.email);
    } else {
      sent++;
    }
  }

  return NextResponse.json({ sent, failed, failures });
}

// GET — just fetch RSVPs for preview
export async function GET(req: NextRequest) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .schema("public")
    .from("keepingthem_rsvps")
    .select("id, name, email, phone, guests, relation, attend_funeral, attend_reception, attend_thanksgiving, message, created_at")
    .eq("memorial_slug", slug)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ rsvps: data ?? [] });
}
