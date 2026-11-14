/**
 * Translator at a glance: an illustrative diff of what the package does to a
 * file (comments and names translated, strings left alone). Not real output.
 */

type Tok = string | { t: string; tr: true };

const rows: { sign: "-" | "+"; line: Tok[] }[] = [
  { sign: "-", line: [{ t: "# lee el fichero", tr: true }] },
  { sign: "+", line: [{ t: "# read the file", tr: true }] },
  { sign: "-", line: [{ t: "fichero", tr: true }, " = open(", '"datos.txt"', ")"] },
  { sign: "+", line: [{ t: "file", tr: true }, " = open(", '"datos.txt"', ")"] },
];

export default function TranslatorFigure() {
  return (
    <div
      role="img"
      aria-label="Illustrative example: Spanish comments and variable names in a Python file become English, while strings stay unchanged."
      className="flex h-full flex-col justify-center font-mono text-[length:3.667cqw] leading-[1.75]"
    >
      <div className="mb-1.5 flex justify-between text-faint">
        <span>input.py → output.py</span>
        <span>illustrative</span>
      </div>
      <div className="overflow-hidden rounded border border-line bg-elev py-1.5">
        {rows.map(({ sign, line }, i) => {
          const added = sign === "+";
          return (
            <div
              key={i}
              className="flex gap-2 whitespace-pre px-2.5"
              style={added ? { background: "color-mix(in srgb, var(--cyan) 7%, transparent)" } : undefined}
            >
              <span className="text-faint">{sign}</span>
              <span className={added ? "text-muted" : "text-faint"}>
                {line.map((tok, j) =>
                  typeof tok === "string" ? (
                    <span key={j} className={tok.startsWith('"') ? "text-amber" : undefined}>
                      {tok}
                    </span>
                  ) : (
                    <span key={j} className={added ? "text-cyan" : "text-muted"}>
                      {tok.t}
                    </span>
                  ),
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
