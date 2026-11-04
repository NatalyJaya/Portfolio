/**
 * JetFlow schematic — derived from the plugin's packages:
 * ci/ (GitHubActionsPoller, BuildStatusPanel), cd/ (RenderApiClient,
 * RenderCredentialsStore), ui/ (Rocky), toolWindow/.
 * Violet dots mark parts Nataly built.
 */

type Box = { x: number; y: number; w: number; h: number; title: string; lines: { t: string; mine?: boolean }[] };

const Mine = ({ x, y }: { x: number; y: number }) => <circle className="fig-mine" cx={x} cy={y} r={3} />;

function Panel({ b, header }: { b: Box; header?: string }) {
  return (
    <g>
      <rect className="fig-box" x={b.x} y={b.y} width={b.w} height={b.h} rx={6} />
      {header && (
        <>
          <line x1={b.x} x2={b.x + b.w} y1={b.y + 26} y2={b.y + 26} style={{ stroke: "var(--line)" }} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={b.x + 14 + i * 10} cy={b.y + 13} r={2.5} style={{ fill: "var(--line-strong)" }} />
          ))}
          <text x={b.x + 50} y={b.y + 17} className="fig-faint">
            {header}
          </text>
        </>
      )}
      <text x={b.x + 16} y={b.y + (header ? 52 : 28)} className="fig-title">
        {b.title}
      </text>
      {b.lines.map((l, i) => (
        <g key={l.t}>
          <text x={b.x + (l.mine ? 28 : 16)} y={b.y + (header ? 76 : 50) + i * 20}>
            {l.t}
          </text>
          {l.mine && <Mine x={b.x + 18} y={b.y + (header ? 72 : 46) + i * 20} />}
        </g>
      ))}
    </g>
  );
}

function Wire({ d, label, lx, ly, signal = "cyan", delay = 0 }: { d: string; label: string; lx: number; ly: number; signal?: "cyan" | "violet"; delay?: number }) {
  return (
    <g>
      <path className="fig-wire" d={d} />
      <path className={`fig-signal signal-path ${signal}`} d={d} pathLength={200} style={{ animationDelay: `${delay}s` }} />
      <text x={lx} y={ly} className="fig-faint" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

const ide: Box["lines"] = [
  { t: "JetFlow tool window", mine: true },
  { t: "Rocky assistant", mine: true },
  { t: "Code bundler → .md" },
];
const gha: Box["lines"] = [{ t: "workflow YAML" }, { t: "run status · failed steps" }];
const render: Box["lines"] = [
  { t: "services · deploys", mine: true },
  { t: "status · rollback", mine: true },
];

export default function JetFlowFigure() {
  return (
    <>
      {/* wide */}
      <svg viewBox="0 0 600 372" className="fig hidden h-auto w-full sm:block" role="img" aria-labelledby="jf-t jf-d">
        <title id="jf-t">JetFlow architecture</title>
        <desc id="jf-d">
          The IntelliJ plugin pushes code to GitHub, polls the GitHub Actions run, triggers deploys through the Render
          API and reads deploy status back into the IDE.
        </desc>
        <Panel b={{ x: 20, y: 92, w: 230, h: 160, title: "IntelliJ IDE", lines: ide }} header="plugin · Kotlin" />
        <Panel b={{ x: 384, y: 24, w: 196, h: 104, title: "GitHub Actions", lines: gha }} />
        <Panel b={{ x: 384, y: 220, w: 196, h: 104, title: "Render", lines: render }} />

        <Wire d="M250 132 C 318 132, 318 64, 384 64" label="git push" lx={317} ly={84} />
        <Wire d="M384 100 C 326 100, 326 164, 250 164" label="poll run" lx={300} ly={150} delay={1.2} />
        <Wire d="M250 200 C 318 200, 318 260, 384 260" label="trigger deploy" lx={300} ly={222} signal="violet" delay={0.6} />
        <Wire d="M384 296 C 318 296, 318 232, 250 232" label="deploy status" lx={318} ly={288} signal="violet" delay={1.8} />

        <text x={580} y={348} className="fig-faint" textAnchor="end">API key kept in the OS keychain</text>
        <Mine x={26} y={344} />
        <text x={36} y={348} className="fig-mine-text">built by me</text>
      </svg>

      {/* narrow */}
      <svg viewBox="0 0 340 520" className="fig h-auto w-full sm:hidden" role="img" aria-labelledby="jf-t2">
        <title id="jf-t2">JetFlow architecture: IDE plugin connected to GitHub Actions and Render</title>
        <Panel b={{ x: 10, y: 10, w: 320, h: 160, title: "IntelliJ IDE", lines: ide }} header="plugin · Kotlin" />
        <Panel b={{ x: 10, y: 330, w: 154, h: 132, title: "GitHub Actions", lines: [{ t: "workflow" }, { t: "run status" }] }} />
        <Panel b={{ x: 176, y: 330, w: 154, h: 132, title: "Render", lines: [{ t: "deploys", mine: true }, { t: "rollback", mine: true }] }} />

        <Wire d="M60 170 C 60 250, 60 250, 60 330" label="push" lx={36} ly={254} />
        <Wire d="M120 330 C 120 250, 120 250, 120 170" label="poll" lx={144} ly={254} delay={1.2} />
        <Wire d="M220 170 C 220 250, 220 250, 220 330" label="deploy" lx={194} ly={254} signal="violet" delay={0.6} />
        <Wire d="M280 330 C 280 250, 280 250, 280 170" label="status" lx={306} ly={254} signal="violet" delay={1.8} />

        <Mine x={16} y={492} />
        <text x={26} y={496} className="fig-mine-text">built by me</text>
        <text x={330} y={496} className="fig-faint" textAnchor="end">key → OS keychain</text>
      </svg>
    </>
  );
}
