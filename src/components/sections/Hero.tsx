import NeuralField from "@/components/neural/NeuralField";
import { ArrowDown, Download, SocialIcon } from "@/components/ui/Icons";
import { profile, socialById } from "@/content/profile";
import { withBase } from "@/lib/utils";

const heroSocials = (["github", "linkedin", "substack", "medium"] as const).map(socialById);

export default function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      {/* Soft light behind the network — also the fallback if canvas is unavailable. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 72% 42%, rgba(122,167,255,0.10), transparent 70%), radial-gradient(40% 40% at 85% 70%, rgba(169,155,255,0.08), transparent 70%)",
        }}
      />
      <div className="absolute inset-0 -z-10">
        <NeuralField />
      </div>
      {/* Legibility scrim on the copy side */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_top,var(--bg)_0%,transparent_45%)] lg:bg-[linear-gradient(to_right,rgba(7,8,11,0.85)_0%,rgba(7,8,11,0.4)_45%,transparent_70%)]"
      />

      <div className="page relative pb-[clamp(3rem,9vh,6rem)] pt-[calc(var(--nav-h)+3rem)]">
        <p className="hero-reveal label mb-6" style={{ ["--d" as string]: 0 }}>
          {profile.role} <span className="mx-1.5 text-line-strong">·</span> {profile.institution}
        </p>

        <h1
          id="hero-title"
          className="hero-reveal font-serif text-[clamp(3.1rem,10.5vw,8.75rem)] font-light leading-[0.92] tracking-[-0.035em]"
          style={{ ["--d" as string]: 1 }}
        >
          Nataly Jaya
          <br />
          <em className="font-light italic text-[color:var(--fg)]">Salazar</em>
        </h1>

        <div className="mt-8 grid max-w-3xl gap-5 md:mt-10">
          <p
            className="hero-reveal text-balance text-xl leading-snug text-fg sm:text-2xl"
            style={{ ["--d" as string]: 2 }}
          >
            {profile.positioning}
          </p>
          <p
            className="hero-reveal max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-[1.0625rem]"
            style={{ ["--d" as string]: 3 }}
          >
            I build web platforms and developer tools in teams, and I&apos;m steering that foundation towards
            machine learning for healthcare and computational neuroscience.
          </p>
        </div>

        <div
          className="hero-reveal mt-9 flex flex-wrap items-center gap-x-6 gap-y-4"
          style={{ ["--d" as string]: 4 }}
        >
          <a
            href="#work"
            className="group inline-flex items-center gap-3 rounded-full bg-fg py-2.5 pl-5 pr-4 text-sm font-medium text-bg transition-colors hover:bg-white"
          >
            Selected work
            <ArrowDown className="transition-transform duration-500 ease-out group-hover:translate-y-0.5" />
          </a>
          <a
            href={withBase(profile.cvPath)}
            download="Nataly_Jaya_Salazar_CV.pdf"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <Download /> Download CV
          </a>
          <ul className="flex items-center gap-1" aria-label="Profiles">
            {heroSocials.map((s) => (
              <li key={s.id}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-elev2 hover:text-fg"
                >
                  <SocialIcon id={s.id} />
                  <span className="sr-only">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
