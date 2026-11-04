import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import portrait from "@/assets/photos/4yfn-2026.jpg";
import { certificates, community, education, spokenLanguages, type LedgerItem } from "@/content/profile";

function Ledger({ title, items }: { title: string; items: LedgerItem[] }) {
  return (
    <div data-reveal>
      <h3 className="label mb-4">{title}</h3>
      <ul className="divide-y divide-[color:var(--line)] border-y border-line">
        {items.map((item) => (
          <li key={item.title + item.org} className="grid gap-1 py-3.5 sm:grid-cols-[1fr_auto] sm:gap-6">
            <div>
              <p className="text-[0.9375rem] leading-snug text-fg">{item.title}</p>
              <p className="mt-0.5 text-sm text-muted">
                {item.org}
                {item.note && <span className="text-faint"> — {item.note}</span>}
              </p>
            </div>
            <p className="font-mono text-xs text-faint sm:pt-1 sm:text-right">{item.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="page py-24 md:py-32">
      <SectionHeader index="01" eyebrow="About" id="about-title" title="The person behind the commits" />

      <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-12 md:mt-20">
        <figure className="col-span-12 sm:col-span-6 md:col-span-4" data-reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-elev">
            <Image
              src={portrait}
              alt="Portrait of Nataly at the 4YFN event in Barcelona, in front of curved neon light strips."
              fill
              sizes="(min-width: 768px) 30vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-[50%_30%] grayscale-[35%] transition duration-700 hover:grayscale-0"
              placeholder="blur"
            />
          </div>
          <figcaption className="label mt-3">Fig. 1 — 4YFN, Barcelona, 2026</figcaption>
        </figure>

        <div className="col-span-12 md:col-span-8 md:pl-6 lg:pl-12">
          <p
            className="text-pretty font-serif text-[clamp(1.5rem,2.6vw,2.125rem)] font-light leading-[1.3] tracking-[-0.01em] text-fg"
            data-reveal
          >
            I&apos;m Nataly, a Computer Engineering student at the Universitat de Lleida. Most of what I know about
            software I learned by building it with other people: a streaming platform over a semester, an IntelliJ
            plugin over a hackathon weekend, and a Python package at my very first hackathon.
          </p>
          <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-muted" data-reveal>
            Now I&apos;m pointing that engineering at a different kind of problem. I&apos;m studying machine learning
            for healthcare and moving towards computational neuroscience: how computation can help us understand the
            brain and, eventually, neurological disorders. I&apos;m early on that path, so this site shows what
            I&apos;ve built and what I&apos;m still learning, without inflating either.
          </p>

          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <Ledger title="Education" items={education} />
            <Ledger title="Certificates" items={certificates} />
            <Ledger title="Community" items={community} />
            <div data-reveal>
              <h3 className="label mb-4">Languages</h3>
              <ul className="grid grid-cols-2 border-y border-line">
                {spokenLanguages.map((l, i) => (
                  <li
                    key={l.name}
                    className={`flex items-baseline justify-between py-3.5 pr-4 ${i < 2 ? "border-b border-line" : ""} ${i % 2 === 1 ? "pl-4" : ""}`}
                  >
                    <span className="text-[0.9375rem] text-fg">{l.name}</span>
                    <span className="font-mono text-xs text-faint">{l.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
