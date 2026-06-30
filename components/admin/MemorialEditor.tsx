"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MemorialConfig } from "@/types/memorial";

const GOLD = "#c8962e";
const BORDER = "#4a3820";
const BG = "#1a1208";
const CARD = "#241a0a";
const TEXT = "#f5ead8";
const MUTED = "#9a7a52";
const DIM = "#7a6a52";

/* ── Shared input styles ── */
const input: React.CSSProperties = {
  width: "100%", padding: "0.55rem 0.75rem", background: BG,
  border: `1px solid ${BORDER}`, borderRadius: "4px", color: TEXT,
  fontSize: "0.9rem", boxSizing: "border-box", fontFamily: "sans-serif",
};
const textarea: React.CSSProperties = {
  ...input, minHeight: "120px", resize: "vertical", lineHeight: 1.6,
};
const label: React.CSSProperties = {
  fontSize: "0.72rem", color: MUTED, textTransform: "uppercase",
  letterSpacing: "0.08em", display: "block", marginBottom: "0.3rem",
};
const fieldset: React.CSSProperties = {
  display: "flex", flexDirection: "column", gap: "0.3rem",
};
const grid2: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
};
const sectionTitle: React.CSSProperties = {
  fontFamily: "Garamond, Georgia, serif", fontSize: "1rem", color: GOLD,
  marginBottom: "0.75rem", marginTop: "1.5rem", paddingBottom: "0.3rem",
  borderBottom: `1px solid ${BORDER}`,
};

function Field({ label: lbl, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={fieldset}>
      <label style={label}>{lbl}</label>
      {children}
    </div>
  );
}

const TABS = ["Profile", "Events", "Program", "Content", "Stream & Florists"] as const;
type Tab = typeof TABS[number];

export default function MemorialEditor({ initial, isNew }: { initial: MemorialConfig; isNew: boolean }) {
  const router = useRouter();
  const [config, setConfig] = useState<MemorialConfig>(initial);
  const [tab, setTab] = useState<Tab>("Profile");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  function set<K extends keyof MemorialConfig>(key: K, value: MemorialConfig[K]) {
    setConfig(c => ({ ...c, [key]: value }));
    setSaveOk(false);
  }

  function setNested<K extends keyof MemorialConfig>(key: K, field: string, value: unknown) {
    setConfig(c => ({ ...c, [key]: { ...(c[key] as object), [field]: value } }));
    setSaveOk(false);
  }

  async function handleSave() {
    if (!config.slug || !config.name) {
      setSaveError("Slug and name are required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    setSaveOk(false);

    const res = await fetch("/api/admin/memorial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setSaveError(d.error ?? "Failed to save.");
      return;
    }

    setSaveOk(true);
    if (isNew) router.push(`/admin/memorial/${config.slug}`);
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", borderBottom: `1px solid ${BORDER}`, marginBottom: "1.5rem" }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? CARD : "none",
              border: `1px solid ${tab === t ? BORDER : "transparent"}`,
              borderBottom: tab === t ? `1px solid ${CARD}` : "none",
              borderRadius: "4px 4px 0 0",
              color: tab === t ? GOLD : DIM,
              padding: "0.5rem 1rem", fontSize: "0.82rem", cursor: "pointer",
              marginBottom: tab === t ? "-1px" : "0",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: "6px", padding: "1.5rem" }}>
        {tab === "Profile" && <ProfileTab config={config} set={set} setNested={setNested} />}
        {tab === "Events" && <EventsTab config={config} setNested={setNested} set={set} />}
        {tab === "Program" && <ProgramTab config={config} set={set} />}
        {tab === "Content" && <ContentTab config={config} set={set} />}
        {tab === "Stream & Florists" && <StreamFloristsTab config={config} set={set} setNested={setNested} />}
      </div>

      {/* Save bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.25rem" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? DIM : GOLD, color: "#0e0b07", border: "none",
            borderRadius: "4px", padding: "0.65rem 2rem", fontSize: "0.9rem",
            fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
            letterSpacing: "0.04em",
          }}
        >
          {saving ? "Saving…" : isNew ? "Create memorial" : "Save changes"}
        </button>
        {saveOk && <span style={{ fontSize: "0.85rem", color: "#6aaa6a" }}>Saved ✓</span>}
        {saveError && <span style={{ fontSize: "0.85rem", color: "#d68f8f" }}>{saveError}</span>}
      </div>
    </div>
  );
}

/* ── Profile tab ── */
function ProfileTab({ config, set, setNested }: {
  config: MemorialConfig;
  set: <K extends keyof MemorialConfig>(k: K, v: MemorialConfig[K]) => void;
  setNested: (k: keyof MemorialConfig, f: string, v: unknown) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={grid2}>
        <Field label="Full name">
          <input style={input} value={config.name} onChange={e => set("name", e.target.value)} placeholder="Benjamin Kwadwo Kwayisi" />
        </Field>
        <Field label="URL slug">
          <input style={input} value={config.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="benjamin-kwadwo-kwayisi" />
        </Field>
      </div>

      <div style={grid2}>
        <Field label="Years (display text)">
          <input style={input} value={config.years} onChange={e => set("years", e.target.value)} placeholder="January 16th, 1936 – June 9th, 2026" />
        </Field>
        <Field label="Title / role">
          <input style={input} value={config.title} onChange={e => set("title", e.target.value)} placeholder="Elder, Father, Okyeame" />
        </Field>
      </div>

      <Field label="Tribute (short memorial quote)">
        <textarea style={textarea} value={config.tribute} onChange={e => set("tribute", e.target.value)} placeholder="A few sentences honoring the life of the deceased…" />
      </Field>

      <div style={sectionTitle}>Culture & identity</div>
      <div style={grid2}>
        <Field label="Culture">
          <select style={input} value={config.culture} onChange={e => set("culture", e.target.value)}>
            <option value="akan">Akan</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Dress code">
          <select style={input} value={config.dressCode} onChange={e => set("dressCode", e.target.value as MemorialConfig["dressCode"])}>
            <option value="black-and-white">Black & White</option>
            <option value="red-and-black">Red & Black</option>
          </select>
        </Field>
      </div>

      <div style={grid2}>
        <Field label="Adinkra symbol">
          <input style={input} value={config.adinkra.symbol} onChange={e => setNested("adinkra", "symbol", e.target.value)} placeholder="Gye Nyame" />
        </Field>
        <Field label="Adinkra meaning">
          <input style={input} value={config.adinkra.meaning} onChange={e => setNested("adinkra", "meaning", e.target.value)} placeholder="Except for God…" />
        </Field>
      </div>

      <div style={sectionTitle}>Cover photo</div>
      <Field label="Primary photo filename (in /public)">
        <input style={input} value={config.photos[0]?.src ?? ""} onChange={e => {
          const photos = [...config.photos];
          photos[0] = { ...photos[0], src: e.target.value };
          set("photos", photos);
        }} placeholder="/Papa_62.png" />
      </Field>
      <Field label="Second photo filename (tribute page)">
        <input style={input} value={config.photos[1]?.src ?? ""} onChange={e => {
          const photos = [...config.photos];
          if (!photos[1]) photos[1] = { src: "", alt: "" };
          photos[1] = { ...photos[1], src: e.target.value };
          set("photos", photos);
        }} placeholder="/Dad_Headshot_1.png" />
      </Field>
    </div>
  );
}

/* ── Events tab ── */
function EventsTab({ config, setNested, set }: {
  config: MemorialConfig;
  setNested: (k: keyof MemorialConfig, f: string, v: unknown) => void;
  set: <K extends keyof MemorialConfig>(k: K, v: MemorialConfig[K]) => void;
}) {
  const [hasViewing, setHasViewing] = useState(!!config.viewing);
  const [hasReception, setHasReception] = useState(!!config.reception);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Viewing */}
      <div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginBottom: "0.75rem" }}>
          <input type="checkbox" checked={hasViewing} onChange={e => {
            setHasViewing(e.target.checked);
            if (!e.target.checked) set("viewing", undefined);
            else set("viewing", { date: "", startTime: "", endTime: "" });
          }} />
          <span style={{ ...label, margin: 0 }}>Include viewing</span>
        </label>
        {hasViewing && config.viewing && (
          <div style={grid2}>
            <Field label="Date">
              <input style={input} value={config.viewing.date} onChange={e => setNested("viewing", "date", e.target.value)} placeholder="Saturday, June 27th, 2026" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <Field label="Start time">
                <input style={input} value={config.viewing.startTime} onChange={e => setNested("viewing", "startTime", e.target.value)} placeholder="11:00 AM" />
              </Field>
              <Field label="End time">
                <input style={input} value={config.viewing.endTime} onChange={e => setNested("viewing", "endTime", e.target.value)} placeholder="1:00 PM" />
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Funeral service */}
      <div>
        <div style={sectionTitle}>Funeral service</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={grid2}>
            <Field label="Venue name">
              <input style={input} value={config.funeralService.name} onChange={e => setNested("funeralService", "name", e.target.value)} placeholder="Hamilton Mill Memorial Chapel" />
            </Field>
            <Field label="Phone">
              <input style={input} value={config.funeralService.phone} onChange={e => setNested("funeralService", "phone", e.target.value)} placeholder="(770) 945-6924" />
            </Field>
          </div>
          <Field label="Address">
            <input style={input} value={config.funeralService.address} onChange={e => setNested("funeralService", "address", e.target.value)} placeholder="3481 Hamilton Mill Rd, Buford, GA 30519" />
          </Field>
          <div style={grid2}>
            <Field label="Date">
              <input style={input} value={config.funeralService.date} onChange={e => setNested("funeralService", "date", e.target.value)} placeholder="Saturday, June 27, 2026" />
            </Field>
            <Field label="Time">
              <input style={input} value={config.funeralService.time} onChange={e => setNested("funeralService", "time", e.target.value)} placeholder="1:00 PM - 3:00 PM" />
            </Field>
          </div>
        </div>
      </div>

      {/* Reception */}
      <div>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginBottom: "0.75rem" }}>
          <input type="checkbox" checked={hasReception} onChange={e => {
            setHasReception(e.target.checked);
            if (!e.target.checked) set("reception", undefined);
            else set("reception", { name: "", address: "", date: "", time: "" });
          }} />
          <span style={{ ...label, margin: 0 }}>Include reception</span>
        </label>
        {hasReception && config.reception && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={grid2}>
              <Field label="Venue name">
                <input style={input} value={config.reception.name} onChange={e => setNested("reception", "name", e.target.value)} placeholder="Stonehedge Venue" />
              </Field>
              <Field label="Address">
                <input style={input} value={config.reception.address} onChange={e => setNested("reception", "address", e.target.value)} placeholder="406 E. Shadburn Ave, Buford, GA" />
              </Field>
            </div>
            <div style={grid2}>
              <Field label="Date">
                <input style={input} value={config.reception.date} onChange={e => setNested("reception", "date", e.target.value)} placeholder="Saturday, June 27, 2026" />
              </Field>
              <Field label="Time">
                <input style={input} value={config.reception.time} onChange={e => setNested("reception", "time", e.target.value)} placeholder="3:00 PM" />
              </Field>
            </div>
            <Field label="Notes (optional)">
              <input style={input} value={config.reception.notes ?? ""} onChange={e => setNested("reception", "notes", e.target.value)} placeholder="Please RSVP so the family can prepare." />
            </Field>
          </div>
        )}
      </div>

      {/* Thanksgiving */}
      <div>
        <div style={sectionTitle}>Thanksgiving celebration</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={grid2}>
            <Field label="Date">
              <input style={input} value={config.thanksgiving.date} onChange={e => setNested("thanksgiving", "date", e.target.value)} placeholder="Sunday, June 28, 2026" />
            </Field>
            <Field label="Time">
              <input style={input} value={config.thanksgiving.time} onChange={e => setNested("thanksgiving", "time", e.target.value)} placeholder="1:00 PM" />
            </Field>
          </div>
          <Field label="Location (public display text)">
            <input style={input} value={config.thanksgiving.location} onChange={e => setNested("thanksgiving", "location", e.target.value)} placeholder="Private residence · Dacula, GA" />
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", color: MUTED }}>
            <input type="checkbox" checked={!!config.thanksgiving.privateLocation} onChange={e => setNested("thanksgiving", "privateLocation", e.target.checked ? true : undefined)} />
            Private address (requires passphrase to reveal — set THANKSGIVING_LOCATION env var)
          </label>
        </div>
      </div>
    </div>
  );
}

/* ── Program tab ── */
function ProgramTab({ config, set }: {
  config: MemorialConfig;
  set: <K extends keyof MemorialConfig>(k: K, v: MemorialConfig[K]) => void;
}) {
  function updateItem(i: number, field: "title" | "sub", value: string) {
    const items = [...config.program.items];
    items[i] = { ...items[i], [field]: value };
    set("program", { ...config.program, items });
  }
  function addItem() {
    set("program", { ...config.program, items: [...config.program.items, { title: "", sub: "" }] });
  }
  function removeItem(i: number) {
    const items = config.program.items.filter((_, idx) => idx !== i);
    set("program", { ...config.program, items });
  }
  function moveItem(i: number, dir: -1 | 1) {
    const items = [...config.program.items];
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    set("program", { ...config.program, items });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={grid2}>
        <Field label="Officiant">
          <input style={input} value={config.program.officiant} onChange={e => set("program", { ...config.program, officiant: e.target.value })} placeholder="Pastor Danny Newbern" />
        </Field>
        <Field label="MC (optional)">
          <input style={input} value={config.program.mc ?? ""} onChange={e => set("program", { ...config.program, mc: e.target.value })} placeholder="Rueben Darko" />
        </Field>
      </div>

      <div style={sectionTitle}>Order of service items</div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {config.program.items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", paddingTop: "0.25rem" }}>
              <button onClick={() => moveItem(i, -1)} style={iconBtn}>↑</button>
              <button onClick={() => moveItem(i, 1)} style={iconBtn}>↓</button>
            </div>
            <span style={{ color: DIM, fontSize: "0.78rem", paddingTop: "0.6rem", minWidth: "1.2rem" }}>{i + 1}.</span>
            <div style={{ flex: 1 }}>
              <input style={{ ...input, marginBottom: "0.3rem" }} value={item.title} onChange={e => updateItem(i, "title", e.target.value)} placeholder="Item title (e.g. Invocation)" />
              <input style={{ ...input, fontSize: "0.82rem" }} value={item.sub} onChange={e => updateItem(i, "sub", e.target.value)} placeholder="Sub-text / participant (optional)" />
            </div>
            <button onClick={() => removeItem(i)} style={{ ...iconBtn, color: "#d68f8f", paddingTop: "0.4rem" }}>✕</button>
          </div>
        ))}
      </div>

      <button onClick={addItem} style={{
        background: "none", border: `1px dashed ${BORDER}`, color: MUTED,
        borderRadius: "4px", padding: "0.5rem", fontSize: "0.82rem",
        cursor: "pointer", width: "100%",
      }}>
        + Add item
      </button>
    </div>
  );
}

/* ── Content tab ── */
function ContentTab({ config, set }: {
  config: MemorialConfig;
  set: <K extends keyof MemorialConfig>(k: K, v: MemorialConfig[K]) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <Field label="Biography (use **bold** for section headings, blank line between paragraphs)">
        <textarea style={{ ...textarea, minHeight: "280px" }} value={config.biography ?? ""} onChange={e => set("biography", e.target.value)} placeholder="**Early Life:**&#10;&#10;Born in…" />
      </Field>

      <div style={sectionTitle}>Survived by</div>
      <SurvivorList
        items={config.survivors ?? []}
        onChange={items => set("survivors", items)}
        label="Survivor"
      />

      <div style={sectionTitle}>Preceded in death by</div>
      <SurvivorList
        items={config.preceded ?? []}
        onChange={items => set("preceded", items)}
        label="Person"
      />

      <div style={sectionTitle}>Hymns</div>
      <HymnList hymns={config.hymns ?? []} onChange={hymns => set("hymns", hymns)} />

      <div style={sectionTitle}>Acknowledgements</div>
      <AckEditor ack={config.acknowledgements} onChange={ack => set("acknowledgements", ack)} />
    </div>
  );
}

function SurvivorList({ items, onChange, label: lbl }: {
  items: { relation: string; name: string }[];
  onChange: (items: { relation: string; name: string }[]) => void;
  label: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
          <input style={{ ...input, flex: "0 0 8rem" }} value={item.relation} onChange={e => {
            const next = [...items]; next[i] = { ...next[i], relation: e.target.value }; onChange(next);
          }} placeholder="Relation" />
          <input style={{ ...input, flex: 1 }} value={item.name} onChange={e => {
            const next = [...items]; next[i] = { ...next[i], name: e.target.value }; onChange(next);
          }} placeholder="Full name" />
          <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} style={{ ...iconBtn, color: "#d68f8f" }}>✕</button>
        </div>
      ))}
      <button onClick={() => onChange([...items, { relation: "", name: "" }])} style={{
        background: "none", border: `1px dashed ${BORDER}`, color: MUTED,
        borderRadius: "4px", padding: "0.4rem", fontSize: "0.8rem", cursor: "pointer",
      }}>+ Add {lbl}</button>
    </div>
  );
}

function HymnList({ hymns, onChange }: {
  hymns: { title: string; lyrics: string }[];
  onChange: (hymns: { title: string; lyrics: string }[]) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {hymns.map((hymn, i) => (
        <div key={i} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <input style={{ ...input, fontWeight: 600 }} value={hymn.title} onChange={e => {
              const next = [...hymns]; next[i] = { ...next[i], title: e.target.value }; onChange(next);
            }} placeholder="Hymn title" />
            <button onClick={() => onChange(hymns.filter((_, idx) => idx !== i))} style={{ ...iconBtn, color: "#d68f8f", marginLeft: "0.5rem" }}>✕</button>
          </div>
          <textarea style={{ ...textarea, minHeight: "160px" }} value={hymn.lyrics} onChange={e => {
            const next = [...hymns]; next[i] = { ...next[i], lyrics: e.target.value }; onChange(next);
          }} placeholder="Hymn lyrics…" />
        </div>
      ))}
      <button onClick={() => onChange([...hymns, { title: "", lyrics: "" }])} style={{
        background: "none", border: `1px dashed ${BORDER}`, color: MUTED,
        borderRadius: "4px", padding: "0.4rem", fontSize: "0.8rem", cursor: "pointer",
      }}>+ Add hymn</button>
    </div>
  );
}

function AckEditor({ ack, onChange }: {
  ack: MemorialConfig["acknowledgements"];
  onChange: (ack: MemorialConfig["acknowledgements"]) => void;
}) {
  const sections = ack?.sections ?? [];
  const closing = ack?.closing ?? "";

  function updateSection(i: number, field: "title" | "names", value: string) {
    const next = [...sections];
    next[i] = { ...next[i], [field]: value };
    onChange({ sections: next, closing });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {sections.map((s, i) => (
        <div key={i} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input style={input} value={s.title} onChange={e => updateSection(i, "title", e.target.value)} placeholder="Section title (e.g. Chief Mourners)" />
            <button onClick={() => onChange({ sections: sections.filter((_, idx) => idx !== i), closing })} style={{ ...iconBtn, color: "#d68f8f" }}>✕</button>
          </div>
          <textarea style={{ ...textarea, minHeight: "80px" }} value={s.names} onChange={e => updateSection(i, "names", e.target.value)} placeholder="Names, separated by commas or semicolons…" />
        </div>
      ))}
      <button onClick={() => onChange({ sections: [...sections, { title: "", names: "" }], closing })} style={{
        background: "none", border: `1px dashed ${BORDER}`, color: MUTED,
        borderRadius: "4px", padding: "0.4rem", fontSize: "0.8rem", cursor: "pointer",
      }}>+ Add section</button>
      <Field label="Closing paragraph">
        <textarea style={textarea} value={closing} onChange={e => onChange({ sections, closing: e.target.value })} placeholder="The family of… wishes to express their heartfelt gratitude…" />
      </Field>
    </div>
  );
}

/* ── Stream & Florists tab ── */
function StreamFloristsTab({ config, set, setNested }: {
  config: MemorialConfig;
  set: <K extends keyof MemorialConfig>(k: K, v: MemorialConfig[K]) => void;
  setNested: (k: keyof MemorialConfig, f: string, v: unknown) => void;
}) {
  function updateFlorist(i: number, field: string, value: string) {
    const next = [...config.florists];
    next[i] = { ...next[i], [field]: value };
    set("florists", next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={sectionTitle}>Livestream</div>
      <div style={grid2}>
        <Field label="Stream URL (leave blank if none)">
          <input style={input} value={config.stream.url} onChange={e => setNested("stream", "url", e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="Button label">
          <input style={input} value={config.stream.label} onChange={e => setNested("stream", "label", e.target.value)} placeholder="Watch the service live" />
        </Field>
      </div>

      <div style={sectionTitle}>Florists</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {config.florists.map((f, i) => (
          <div key={i} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: "4px", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input style={{ ...input, flex: 1 }} value={f.name} onChange={e => updateFlorist(i, "name", e.target.value)} placeholder="Florist name" />
              <button onClick={() => set("florists", config.florists.filter((_, idx) => idx !== i))} style={{ ...iconBtn, color: "#d68f8f" }}>✕</button>
            </div>
            <div style={grid2}>
              <input style={input} value={f.phone} onChange={e => updateFlorist(i, "phone", e.target.value)} placeholder="Phone" />
              <input style={input} value={f.url} onChange={e => updateFlorist(i, "url", e.target.value)} placeholder="Website URL" />
            </div>
            <input style={input} value={f.address ?? ""} onChange={e => updateFlorist(i, "address", e.target.value)} placeholder="Address" />
          </div>
        ))}
        <button onClick={() => set("florists", [...config.florists, { name: "", phone: "", url: "", address: "" }])} style={{
          background: "none", border: `1px dashed ${BORDER}`, color: MUTED,
          borderRadius: "4px", padding: "0.4rem", fontSize: "0.8rem", cursor: "pointer",
        }}>+ Add florist</button>
      </div>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: "none", border: "none", color: DIM, cursor: "pointer",
  fontSize: "0.85rem", padding: "0.2rem 0.4rem", lineHeight: 1,
};
