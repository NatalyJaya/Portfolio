/**
 * JetFlow at a glance: the IntelliJ plugin pushes to GitHub Actions and
 * deploys to Render. Violet dots mark the parts Nataly built.
 */

const Mine = ({ x, y }: { x: number; y: number }) => <circle className="fig-mine" cx={x} cy={y} r={2.5} />;

function Wire({ d, signal, delay = 0 }: { d: string; signal: "cyan" | "violet"; delay?: number }) {
  return (
    <>
      <path className="fig-wire" d={d} />
      <path className={`fig-signal signal-path ${signal}`} d={d} pathLength={200} style={{ animationDelay: `${delay}s` }} />
    </>
  );
}

export default function JetFlowFigure() {
  return (
    <svg viewBox="0 0 300 136" className="fig h-full w-full" role="img" aria-labelledby="jf-t jf-d">
      <title id="jf-t">JetFlow architecture</title>
      <desc id="jf-d">
        The IntelliJ plugin pushes code and follows the GitHub Actions run, and triggers deploys on Render and reads
        their status. The tool window, the Rocky assistant and the Render integration are Nataly&apos;s work.
      </desc>

      <Wire d="M116 56 C 150 56, 150 32, 184 32" signal="cyan" />
      <Wire d="M116 80 C 150 80, 150 104, 184 104" signal="violet" delay={1.2} />

      <rect className="fig-box" x={6} y={36} width={110} height={64} rx={6} />
      <text x={18} y={57} className="fig-title">
        IntelliJ
      </text>
      <Mine x={21} y={72} />
      <text x={30} y={75.5}>tool window</text>
      <Mine x={21} y={88} />
      <text x={30} y={91.5}>Rocky</text>

      <rect className="fig-box" x={184} y={10} width={110} height={44} rx={6} />
      <text x={196} y={29} className="fig-title">
        GitHub Actions
      </text>
      <text x={196} y={45} className="fig-faint">
        push → CI run
      </text>

      <rect className="fig-box" x={184} y={82} width={110} height={44} rx={6} />
      <text x={196} y={101} className="fig-title">
        Render
      </text>
      <Mine x={284} y={97} />
      <text x={196} y={117} className="fig-faint">
        deploy · status
      </text>
    </svg>
  );
}
