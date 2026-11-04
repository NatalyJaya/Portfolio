import SectionHeader from "@/components/ui/SectionHeader";
import { ArrowUpRight, GitHub } from "@/components/ui/Icons";
import { resources, type Resource } from "@/content/resources";

/** Ten preprocessing stages as a chain of nodes. */
function PipelineGlyph() {
  return (
    <svg viewBox="0 0 220 40" className="h-10 w-full max-w-[220px]" aria-hidden="true">
      <line x1="10" y1="20" x2="210" y2="20" style={{ stroke: "var(--line-strong)" }} />
      {Array.from({ length: 10 }, (_, i) => (
        <circle
          key={i}
          cx={10 + i * 22.2}
          cy={20}
          r={i === 9 ? 4 : 2.5}
          style={{ fill: i === 9 ? "var(--cyan)" : "var(--fg-muted)" }}
        />
      ))}
      <text x="10" y="36" style={{ fill: "var(--fg-faint)", fontSize: 8, fontFamily: "var(--font-mono)" }}>
        raw
      </text>
      <text x="210" y="36" textAnchor="end" style={{ fill: "var(--cyan)", fontSize: 8, fontFamily: "var(--font-mono)" }}>
        model-ready
      </text>
    </svg>
  );
}

/** Supervisor of supervisors. */
function TreeGlyph() {
  const leaf = (x: number, dashed = false) => (
    <circle cx={x} cy={44} r={2.5} style={dashed ? { fill: "none", stroke: "var(--fg-faint)" } : { fill: "var(--fg-muted)" }} />
  );
  return (
    <svg viewBox="0 0 220 52" className="h-12 w-full max-w-[220px]" aria-hidden="true">
      <g style={{ stroke: "var(--line-strong)", fill: "none" }}>
        <path d="M110 8 L60 26 M110 8 L160 26" />
        <path d="M60 26 L35 44 M60 26 L85 44 M160 26 L130 44 M160 26 L160 44 M160 26 L190 44" />
        <path d="M110 8 L110 44" strokeDasharray="2 3" />
      </g>
      <circle cx={110} cy={8} r={4} style={{ fill: "var(--violet)" }} />
      <circle cx={60} cy={26} r={3} style={{ fill: "var(--fg)" }} />
      <circle cx={160} cy={26} r={3} style={{ fill: "var(--fg)" }} />
      {leaf(35)}
      {leaf(85)}
      {leaf(130)}
      {leaf(160)}
      {leaf(190)}
      {leaf(110, true)}
    </svg>
  );
}

function Entry({ r, i }: { r: Resource; i: number }) {
  return (
    <li className="grid grid-cols-12 gap-x-6 gap-y-5 border-t border-line py-10" data-reveal>
      <div className="col-span-12 md:col-span-3">
        <p className="label">Notebook {String(i + 1).padStart(2, "0")}</p>
        <div className="mt-5">{r.glyph === "pipeline" ? <PipelineGlyph /> : <TreeGlyph />}</div>
      </div>
      <div className="col-span-12 md:col-span-6">
        <h3 className="font-serif text-[1.75rem] font-normal leading-tight tracking-[-0.015em]">{r.title}</h3>
        <p className="mt-1.5 text-[0.9375rem] text-cyan">{r.concept}</p>
        <p className="mt-4 max-w-xl text-pretty text-[0.9375rem] leading-relaxed text-muted">{r.purpose}</p>
        {r.status && (
          <p className="mt-4 inline-flex items-center gap-2 font-mono text-[0.6875rem] text-amber">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full border border-amber" />
            {r.status}
          </p>
        )}
      </div>
      <div className="col-span-12 flex flex-col justify-between gap-6 md:col-span-3">
        <ul className="flex flex-wrap gap-1.5 md:flex-col md:items-start" aria-label="Covers">
          {r.covers.map((c) => (
            <li key={c} className="chip">
              {c}
            </li>
          ))}
        </ul>
        <a
          href={r.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-sm text-fg"
        >
          <GitHub className="text-muted" />
          <span className="link-underline">Open the notebook</span>
          <ArrowUpRight className="text-muted transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </li>
  );
}

export default function Notebooks() {
  return (
    <section id="notebooks" aria-labelledby="notebooks-title" className="page py-24 md:py-32">
      <SectionHeader
        index="03"
        eyebrow="Learning resources"
        id="notebooks-title"
        title="Open notebooks"
        lede="Not portfolio pieces. These are samples and templates I wrote so other people (and future me) can pick up a concept by running it."
      />
      <ol className="mt-14 border-b border-line md:mt-20">
        {resources.map((r, i) => (
          <Entry key={r.id} r={r} i={i} />
        ))}
      </ol>
    </section>
  );
}
