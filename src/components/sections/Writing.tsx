import SectionHeader from "@/components/ui/SectionHeader";
import { ArrowUpRight, Medium, Substack } from "@/components/ui/Icons";
import { articles, interests, type Article } from "@/content/writing";
import { socialById } from "@/content/profile";
import { cx } from "@/lib/utils";

const roman = ["I", "II", "III", "IV", "V", "VI"];

const statusLabel: Record<Article["status"], string> = {
  published: "Published",
  "in-progress": "In progress",
  planned: "Planned",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function ArticleCard({ a }: { a: Article }) {
  const published = a.status === "published";
  const body = (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="label flex items-center gap-2">
          {a.platform === "Substack" ? <Substack width={12} height={12} /> : <Medium width={12} height={12} />}
          {a.platform}
        </p>
        <span
          className={cx(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em]",
            published
              ? "border-[rgba(111,221,230,0.4)] text-cyan"
              : a.status === "in-progress"
                ? "border-[rgba(240,184,110,0.4)] text-amber"
                : "border-line-strong text-faint",
          )}
        >
          {!published && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />}
          {statusLabel[a.status]}
        </span>
      </div>

      <h3
        className={cx(
          "mt-6 text-balance font-serif text-[1.625rem] leading-[1.15] tracking-[-0.015em]",
          published ? "text-fg" : "italic text-muted",
        )}
      >
        {published ? a.title : a.label}
      </h3>
      <p className="mt-3 text-pretty text-[0.9375rem] leading-relaxed text-muted">{a.abstract}</p>

      <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-4">
        <div>
          <dt className="label">Date</dt>
          <dd className="mt-1 font-mono text-xs text-fg">{published ? formatDate(a.date) : "—"}</dd>
        </div>
        <div>
          <dt className="label">Reading</dt>
          <dd className="mt-1 font-mono text-xs text-fg">{published && a.readingTime ? a.readingTime : "—"}</dd>
        </div>
        <div className="text-right">
          <dt className="label">Link</dt>
          <dd className="mt-1 font-mono text-xs text-fg">{published ? "Read ↗" : "Soon"}</dd>
        </div>
      </dl>
    </>
  );

  const cls = cx(
    "flex h-full flex-col rounded-md border p-6 transition-colors duration-300",
    published ? "border-line-strong bg-elev hover:border-fg" : "border-dashed border-line-strong",
  );

  return published ? (
    <a href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <article className={cls} aria-label={`${statusLabel[a.status]} — not yet published`}>
      {body}
    </article>
  );
}

export default function Writing() {
  const substack = socialById("substack");
  const medium = socialById("medium");

  return (
    <section id="writing" aria-labelledby="writing-title" className="page py-24 md:py-32">
      <SectionHeader
        index="05"
        eyebrow="Research interests & writing"
        id="writing-title"
        title="Questions I'm moving towards"
        lede="I haven't published research. These are the fields I'm reading into, and the place where I'll start writing about them."
      />

      <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-14 md:mt-20">
        <ol className="col-span-12 lg:col-span-5">
          {interests.map((it, i) => (
            <li key={it.field} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line py-5 last:border-b" data-reveal>
              <span className="pt-1 font-serif text-lg italic text-faint">{roman[i]}</span>
              <div>
                <p className="font-serif text-[1.375rem] leading-tight">{it.field}</p>
                <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted">{it.note}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="col-span-12 lg:col-span-7 lg:pl-8">
          <p className="label mb-5" data-reveal>
            Writing — first pieces in progress
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {articles.map((a, i) => (
              <li key={i} data-reveal style={{ ["--reveal-delay" as string]: i }}>
                <ArticleCard a={a} />
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3" data-reveal>
            {[substack, medium].map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm text-fg"
              >
                {s.id === "substack" ? <Substack width={14} height={14} className="text-muted" /> : <Medium width={14} height={14} className="text-muted" />}
                <span className="link-underline">Follow on {s.label}</span>
                <span className="font-mono text-xs text-faint">{s.handle}</span>
                <ArrowUpRight className="text-muted transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
