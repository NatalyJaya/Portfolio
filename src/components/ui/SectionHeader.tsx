import type { ReactNode } from "react";

type Props = {
  index: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
};

/**
 * Editorial section opener: a numbered margin label on the left, the title
 * and an optional lede on the right, over a hairline rule.
 */
export default function SectionHeader({ index, eyebrow, title, lede, id }: Props) {
  return (
    <header className="rule grid grid-cols-12 gap-x-6 gap-y-5 pt-6 md:pt-8">
      <p className="label col-span-12 md:col-span-3" data-reveal>
        <span className="text-fg">§ {index}</span>
        <span className="mx-2 text-line-strong">/</span>
        {eyebrow}
      </p>
      <div className="col-span-12 md:col-span-9">
        <h2
          id={id}
          className="text-balance font-serif text-[clamp(2.25rem,5.2vw,4.25rem)] font-normal leading-[1.02] tracking-[-0.02em]"
          data-reveal
          style={{ ["--reveal-delay" as string]: 1 }}
        >
          {title}
        </h2>
        {lede && (
          <p
            className="mt-5 max-w-2xl text-pretty text-[1.0625rem] leading-relaxed text-muted"
            data-reveal
            style={{ ["--reveal-delay" as string]: 2 }}
          >
            {lede}
          </p>
        )}
      </div>
    </header>
  );
}
