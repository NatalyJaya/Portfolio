import type { CSSProperties, ReactNode } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import JetFlowFigure from "@/components/figures/JetFlowFigure";
import StreamSyncFigure from "@/components/figures/StreamSyncFigure";
import TranslatorFigure from "@/components/figures/TranslatorFigure";
import { ArrowUpRight } from "@/components/ui/Icons";
import { projects, type Project } from "@/content/projects";

const figures: Record<Project["id"], () => ReactNode> = {
  jetflow: () => <JetFlowFigure />,
  streamsync: () => <StreamSyncFigure />,
  translator: () => <TranslatorFigure />,
};

function Card({ p, i }: { p: Project; i: number }) {
  return (
    <article
      aria-labelledby={`case-${p.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-line bg-[rgba(13,15,20,0.45)] md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:flex"
      data-reveal
      style={{ ["--reveal-delay" as string]: i } as CSSProperties}
    >
      <div className="flex items-center border-b border-line bg-[rgba(13,15,20,0.6)] p-4 md:border-b-0 md:border-r lg:border-b lg:border-r-0">
        <div className="aspect-[300/136] w-full [container-type:inline-size]">{figures[p.id]()}</div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <p className="label">
          <span className="text-fg">{p.index}</span>
          <span className="mx-2 text-line-strong">/</span>
          {p.kicker}
        </p>

        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h3 id={`case-${p.id}`} className="font-serif text-[2rem] font-normal leading-none tracking-[-0.02em]">
              {p.name}
            </h3>
            {p.distinction && (
              <span className="label inline-flex items-center gap-1.5 rounded-full border border-[rgba(240,184,110,0.35)] px-2.5 py-1 text-amber">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber" />
                {p.distinction}
              </span>
            )}
          </div>
          <p className="mt-2 font-serif italic text-muted">{p.tagline}</p>
        </div>

        <p className="text-pretty text-sm leading-relaxed text-muted">{p.summary}</p>

        <div>
          <h4 className="label mb-2">
            <span className="whitespace-nowrap text-violet">
              <span aria-hidden="true" className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-violet align-middle" />
              My part
            </span>
            <span className="whitespace-nowrap normal-case tracking-normal"> · team of {p.team}</span>
            {p.contributionNote && (
              <span className="whitespace-nowrap normal-case tracking-normal"> · {p.contributionNote}</span>
            )}
          </h4>
          <ul className="space-y-1.5">
            {p.contribution.map((t) => (
              <li key={t} className="flex gap-2.5 text-sm leading-snug text-fg">
                <span aria-hidden="true" className="mt-[0.6em] h-px w-2.5 shrink-0 bg-violet" />
                <span className="text-pretty">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-2">
          <ul className="flex flex-wrap gap-1.5" aria-label={`${p.name} technologies`}>
            {p.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-line pt-4">
            {p.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 text-sm text-fg"
                >
                  <span className="link-underline">{l.label}</span>
                  <ArrowUpRight className="text-muted transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan" />
                  {l.note && <span className="font-mono text-[0.6875rem] text-faint">{l.note}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  return (
    <section id="work" aria-labelledby="work-title" className="page py-24 md:py-32">
      <SectionHeader
        index="02"
        eyebrow="Selected work"
        id="work-title"
        title="Three projects, in brief"
        lede={
          <>
            What each one does and the part I built myself. <span className="text-violet">Violet</span> marks my work.
          </>
        }
      />
      <div className="mt-12 grid gap-5 md:mt-16 lg:grid-cols-3">
        {projects.map((p, i) => (
          <Card key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
