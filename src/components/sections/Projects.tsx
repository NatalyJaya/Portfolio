import type { ReactNode } from "react";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import JetFlowFigure from "@/components/figures/JetFlowFigure";
import StreamSyncFigure from "@/components/figures/StreamSyncFigure";
import TranslatorFigure from "@/components/figures/TranslatorFigure";
import { ArrowUpRight } from "@/components/ui/Icons";
import { projects, type Project } from "@/content/projects";
import { cx } from "@/lib/utils";

const figures: Record<Project["id"], () => ReactNode> = {
  jetflow: () => <JetFlowFigure />,
  streamsync: () => <StreamSyncFigure />,
  translator: () => <TranslatorFigure />,
};

function Figure({ p, n }: { p: Project; n: number }) {
  return (
    <figure data-reveal>
      <div className={cx("rounded-md border border-line bg-[rgba(13,15,20,0.6)]", p.id === "translator" ? "p-3 sm:p-4" : "p-4 sm:p-6")}>
        {figures[p.id]()}
      </div>
      <figcaption className="mt-3 flex gap-3 text-sm text-muted">
        <span className="label shrink-0 pt-0.5 text-fg">Fig. 2.{n}</span>
        <span className="text-pretty">{p.figureCaption}</span>
      </figcaption>
      {p.media && p.media.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {p.media.map((m) => (
            <Image key={m.alt} src={m.src} alt={m.alt} className="rounded-md border border-line" sizes="(min-width: 768px) 30vw, 100vw" />
          ))}
        </div>
      )}
    </figure>
  );
}

function CaseHeader({ p }: { p: Project }) {
  return (
    <div data-reveal>
      <p className="label flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-fg">Case {p.index}</span>
        <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
        {p.kicker}
      </p>
      <h3 id={`case-${p.id}`} className="mt-4 font-serif text-[clamp(2.25rem,4.6vw,3.75rem)] font-normal leading-none tracking-[-0.025em]">
        {p.name}
      </h3>
      <p className="mt-3 font-serif text-xl italic text-muted">{p.tagline}</p>
      {p.distinction && (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[rgba(240,184,110,0.35)] px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-amber">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber" />
          {p.distinction}
        </p>
      )}
    </div>
  );
}

function Meta({ p, cols = 2 }: { p: Project; cols?: 2 | 4 }) {
  return (
    <dl
      className={cx(
        "grid gap-px overflow-hidden rounded-md border border-line bg-[color:var(--line)]",
        cols === 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2",
      )}
      data-reveal
    >
      {p.meta.map((m) => (
        <div key={m.label} className="bg-bg px-4 py-3">
          <dt className="label">{m.label}</dt>
          <dd className="mt-1 text-sm leading-snug text-fg">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Block({ title, children, accent }: { title: string; children: ReactNode; accent?: boolean }) {
  return (
    <div data-reveal>
      <h4 className={cx("label mb-3 flex items-center gap-2", accent && "text-violet")}>
        {accent && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-violet" />}
        {title}
      </h4>
      {children}
    </div>
  );
}

function List({ items, marker }: { items: string[]; marker: "dash" | "violet" }) {
  return (
    <ul className="space-y-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted">
          <span
            aria-hidden="true"
            className={cx("mt-[0.7em] h-px w-3 shrink-0", marker === "violet" ? "bg-violet" : "bg-line-strong")}
          />
          <span className="text-pretty">{t}</span>
        </li>
      ))}
    </ul>
  );
}

function Footer({ p }: { p: Project }) {
  return (
    <div className="flex flex-col gap-6" data-reveal>
      <ul className="flex flex-wrap gap-2" aria-label={`${p.name} technologies`}>
        {p.stack.map((s) => (
          <li key={s} className="chip">
            {s}
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-x-6 gap-y-3">
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
              {l.note && <span className="ml-1 font-mono text-[0.6875rem] text-faint">({l.note})</span>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Case({ p, n }: { p: Project; n: number }) {
  if (p.layout === "figure-wide") {
    return (
      <article aria-labelledby={`case-${p.id}`} className="grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="col-span-12 lg:col-span-5">
          <CaseHeader p={p} />
        </div>
        <div className="col-span-12 flex flex-col justify-end gap-6 lg:col-span-7">
          <p className="text-pretty text-[1.0625rem] leading-relaxed text-fg" data-reveal>
            {p.problem}
          </p>
          <Meta p={p} cols={4} />
        </div>
        <div className="col-span-12">
          <Figure p={p} n={n} />
        </div>
        <div className="col-span-12 md:col-span-6">
          <Block title="What it does">
            <List items={p.whatItDoes} marker="dash" />
          </Block>
        </div>
        <div className="col-span-12 md:col-span-6">
          <Block title="My contribution" accent>
            <List items={p.contribution} marker="violet" />
          </Block>
        </div>
        <div className="col-span-12">
          <Footer p={p} />
        </div>
      </article>
    );
  }

  const figureFirst = p.layout === "figure-left";
  return (
    <article aria-labelledby={`case-${p.id}`} className="grid grid-cols-12 gap-x-6 gap-y-10 lg:gap-x-12">
      <div
        className={cx(
          "col-span-12 lg:col-span-7",
          figureFirst ? "lg:order-1" : "lg:order-2",
          "order-2 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start",
        )}
      >
        <Figure p={p} n={n} />
      </div>
      <div className={cx("order-1 col-span-12 flex flex-col gap-9 lg:col-span-5", figureFirst ? "lg:order-2" : "lg:order-1")}>
        <CaseHeader p={p} />
        <p className="text-pretty text-[1.0625rem] leading-relaxed text-fg" data-reveal>
          {p.problem}
        </p>
        <Meta p={p} />
        <Block title="What it does">
          <List items={p.whatItDoes} marker="dash" />
        </Block>
        <Block title="My contribution" accent>
          <List items={p.contribution} marker="violet" />
        </Block>
        <Footer p={p} />
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
        title="Three projects, read closely"
        lede="Each one with its context, what it does and the part I built myself, checked against the commit history. The schematics are drawn from each codebase."
      />
      <div className="mt-16 flex flex-col gap-28 md:mt-24 md:gap-40">
        {projects.map((p, i) => (
          <Case key={p.id} p={p} n={i + 1} />
        ))}
      </div>
    </section>
  );
}
