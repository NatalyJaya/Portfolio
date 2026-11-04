/**
 * Translator figure: an illustrative before/after of what the package does.
 * Labelled as illustrative in the caption — it is not captured output.
 */

type Tok = string | { t: string; tr: true };

const input: Tok[][] = [
  [{ t: "# lee el fichero de entrada", tr: true }],
  [{ t: "fichero", tr: true }, " = open(", '"datos.txt"', ")"],
  [{ t: "lineas", tr: true }, " = ", { t: "fichero", tr: true }, ".readlines()"],
  [""],
  [{ t: "# cuenta las líneas", tr: true }],
  ["total = len(", { t: "lineas", tr: true }, ")"],
];

const output: Tok[][] = [
  [{ t: "# read the input file", tr: true }],
  [{ t: "file", tr: true }, " = open(", '"datos.txt"', ")"],
  [{ t: "lines", tr: true }, " = ", { t: "file", tr: true }, ".readlines()"],
  [""],
  [{ t: "# count the lines", tr: true }],
  ["total = len(", { t: "lines", tr: true }, ")"],
];

function Code({ name, lines, accent }: { name: string; lines: Tok[][]; accent: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-elev">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-[0.6875rem] text-muted">{name}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} aria-hidden="true" />
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[0.8125rem] leading-6 text-muted">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="flex">
              <span className="mr-4 w-4 select-none text-right text-faint opacity-60">{i + 1}</span>
              <span>
                {line.map((tok, j) =>
                  typeof tok === "string" ? (
                    <span key={j} className={tok.startsWith('"') ? "text-amber" : undefined}>
                      {tok}
                    </span>
                  ) : (
                    <span key={j} style={{ color: accent }}>
                      {tok.t}
                    </span>
                  ),
                )}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export default function TranslatorFigure() {
  return (
    <div className="grid gap-3">
      <Code name="input.py" lines={input} accent="var(--violet)" />
      <div className="flex items-center gap-3 px-1">
        <span className="h-px flex-1 bg-line-strong" aria-hidden="true" />
        <code className="font-mono text-[0.6875rem] text-muted">
          translate_code(&quot;input.py&quot;, &quot;english&quot;, &quot;output.py&quot;)
        </code>
        <span className="h-px flex-1 bg-line-strong" aria-hidden="true" />
      </div>
      <Code name="output.py" lines={output} accent="var(--cyan)" />
    </div>
  );
}
