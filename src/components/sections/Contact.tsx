import type { CSSProperties } from "react";
import Image from "next/image";
import droid from "@/assets/photos/goofy-star-wars.jpg";
import { ArrowUp, ArrowUpRight, Download, SocialIcon } from "@/components/ui/Icons";
import { profile, socials } from "@/content/profile";
import { withBase } from "@/lib/utils";

export default function Contact() {
  const year = new Date().getFullYear();
  const profiles = socials.filter((s) => s.id !== "email");

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[70%]"
        style={{ background: "radial-gradient(50% 60% at 50% 100%, rgba(169,155,255,0.10), transparent 70%)" }}
      />
      <div className="page pb-10 pt-24 md:pt-32">
        <div className="rule grid grid-cols-12 gap-x-6 gap-y-10 pt-6 md:grid-rows-[auto_1fr] md:pt-8">
          <p className="label col-span-12 md:col-span-3" data-reveal>
            <span className="text-fg">§ 07</span>
            <span className="mx-2 text-line-strong">/</span>Contact
          </p>
          <div className="col-span-12 md:col-span-9 md:row-span-2">
            <h2
              id="contact-title"
              className="text-balance font-serif text-[clamp(2.5rem,7vw,6rem)] font-light leading-[0.98] tracking-[-0.03em]"
              data-reveal
            >
              Let&apos;s talk about <em className="italic">software, data</em> and the brain.
            </h2>
            <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted" data-reveal>
              I&apos;m open to internships and research-oriented opportunities in software engineering, machine
              learning and health technology. Email is the best way to reach me.
            </p>

            <a
              href={`mailto:${profile.email}`}
              className="group mt-10 inline-flex items-center gap-3 font-serif text-[clamp(1.375rem,3.4vw,2.5rem)] text-fg"
              data-reveal
            >
              <span className="link-underline break-all">{profile.email}</span>
              <ArrowUpRight
                width={28}
                height={28}
                className="shrink-0 text-cyan transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </a>

            <ul className="mt-14 grid border-t border-line sm:grid-cols-2" data-reveal>
              {profiles.map((s, i) => (
                <li key={s.id} className={i % 2 === 0 ? "border-b border-line sm:border-r sm:pr-6" : "border-b border-line sm:pl-6"}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 py-4"
                  >
                    <SocialIcon id={s.id} className="text-muted transition-colors group-hover:text-fg" />
                    <span className="text-fg">{s.label}</span>
                    <span className="ml-auto font-mono text-xs text-faint">{s.handle}</span>
                    <ArrowUpRight className="text-faint transition-all duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan" />
                  </a>
                </li>
              ))}
              <li className="border-b border-line sm:pl-6">
                <a
                  href={withBase(profile.cvPath)}
                  download="Nataly_Jaya_Salazar_CV.pdf"
                  className="group flex items-center gap-4 py-4"
                >
                  <Download className="text-muted transition-colors group-hover:text-fg" />
                  <span className="text-fg">Curriculum vitae</span>
                  <span className="ml-auto font-mono text-xs text-faint">PDF</span>
                </a>
              </li>
            </ul>
          </div>

          {/* A sign-off print: under the section label on desktop, after the links on mobile. */}
          <figure
            className="col-span-12 md:col-span-3 md:col-start-1 md:row-start-2 md:self-start"
            data-reveal
            style={{ ["--reveal-delay" as string]: 2 }}
          >
            <div
              className="snap relative w-[56%] max-w-[13rem] overflow-hidden rounded-sm bg-elev shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)] ring-[6px] ring-bg md:w-[78%]"
              style={
                {
                  aspectRatio: `${droid.width} / ${droid.height}`,
                  ["--tilt"]: "-2.5deg",
                } as CSSProperties
              }
            >
              <Image
                src={droid}
                alt="Nataly dabbing beside a life-size R2-D2 in a dark room."
                fill
                sizes="13rem"
                placeholder="blur"
                className="object-cover grayscale-[35%] transition duration-700 hover:grayscale-0"
              />
            </div>
            <figcaption className="mt-5">
              <span className="label text-fg">Fig. 7</span>
              <span className="mt-1.5 block max-w-[14rem] font-serif text-base italic leading-snug text-muted">
                I did the dab.
              </span>
            </figcaption>
          </figure>
        </div>


        <footer className="mt-24 flex flex-col gap-4 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {profile.name}
          </p>
          <p className="font-mono">As long as the Sun, the Moon, and the Earth exist, everything will be all right</p>
          <a href="#top" className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-fg">
            Back to top <ArrowUp width={14} height={14} />
          </a>
        </footer>
      </div>
    </section>
  );
}
