/**
 * StreamSync schematic, drawn like a three-layer network:
 * roles → features → data model (from app/models.py and the views).
 * Violet marks the features Nataly built.
 */

const roles = ["User", "Platform manager", "Director", "Tech admin"];

const features: { id: string; label: string; mine: boolean }[] = [
  { id: "catalog", label: "Catalog & search", mine: true },
  { id: "onboarding", label: "Onboarding", mine: true },
  { id: "library", label: "Personal library", mine: true },
  { id: "notifications", label: "Notifications", mine: true },
  { id: "settings", label: "Profile & settings", mine: true },
  { id: "dashboards", label: "Dashboards", mine: false },
  { id: "admin", label: "User admin", mine: false },
];

const models = [
  "AudiovisualContent",
  "Movie · Series",
  "Platform",
  "Genre",
  "Catalog",
  "User",
  "Watchlist",
  "Favorite",
  "VisualizationProgress",
  "Notification",
  "Statistics",
];

const roleLinks: [number, string][] = [
  [0, "catalog"],
  [0, "onboarding"],
  [0, "library"],
  [0, "notifications"],
  [0, "settings"],
  [1, "dashboards"],
  [2, "dashboards"],
  [3, "admin"],
];

const modelLinks: [string, string][] = [
  ["catalog", "AudiovisualContent"],
  ["catalog", "Movie · Series"],
  ["catalog", "Platform"],
  ["catalog", "Catalog"],
  ["catalog", "Genre"],
  ["onboarding", "Genre"],
  ["onboarding", "User"],
  ["library", "Watchlist"],
  ["library", "Favorite"],
  ["library", "VisualizationProgress"],
  ["notifications", "Notification"],
  ["notifications", "Genre"],
  ["settings", "User"],
  ["dashboards", "Statistics"],
  ["dashboards", "Platform"],
  ["admin", "User"],
];

const W = 980;
const H = 380;
const X = { role: 170, feat: 490, model: 760 };
const yAt = (i: number, n: number) => 40 + (i * (H - 80)) / Math.max(1, n - 1);
const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
};

export default function StreamSyncFigure() {
  const fy = (id: string) => yAt(features.findIndex((f) => f.id === id), features.length);
  const my = (m: string) => yAt(models.indexOf(m), models.length);
  const mineFeature = (id: string) => features.find((f) => f.id === id)?.mine;

  return (
    <div className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] md:mx-0 md:overflow-visible md:px-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="fig h-auto w-full min-w-[720px]"
        role="img"
        aria-labelledby="ss-t ss-d"
      >
        <title id="ss-t">StreamSync system map</title>
        <desc id="ss-d">
          Four roles (user, platform manager, director, tech admin) reach seven features, which read and write eleven
          data models. Catalog and search, onboarding, the personal library, notifications and profile settings are
          the features Nataly built.
        </desc>

        {/* column headings */}
        {[
          ["Roles", X.role, "end"],
          ["Features", X.feat, "middle"],
          ["Data model", X.model, "start"],
        ].map(([t, x, a]) => (
          <text key={t as string} x={x as number} y={14} textAnchor={a as "end" | "middle" | "start"} className="fig-faint">
            {(t as string).toUpperCase()}
          </text>
        ))}

        {/* wires */}
        {roleLinks.map(([r, f]) => {
          const mine = mineFeature(f);
          const d = curve(X.role, yAt(r, roles.length), X.feat - 82, fy(f));
          return (
            <g key={`r${r}${f}`}>
              <path className="fig-wire" d={d} style={mine ? { stroke: "rgba(169,155,255,0.35)" } : undefined} />
            </g>
          );
        })}
        {modelLinks.map(([f, m], i) => {
          const mine = mineFeature(f);
          const d = curve(X.feat + 82, fy(f), X.model, my(m));
          return (
            <g key={`m${f}${m}`}>
              <path className="fig-wire" d={d} style={mine ? { stroke: "rgba(169,155,255,0.35)" } : undefined} />
              {mine && i % 3 === 0 && (
                <path className="fig-signal violet signal-path" d={d} pathLength={200} style={{ animationDelay: `${(i % 5) * 0.7}s` }} />
              )}
            </g>
          );
        })}

        {/* role nodes */}
        {roles.map((r, i) => (
          <g key={r}>
            <circle cx={X.role} cy={yAt(i, roles.length)} r={4} className="fig-node" />
            <text x={X.role - 14} y={yAt(i, roles.length) + 4} textAnchor="end">
              {r}
            </text>
          </g>
        ))}

        {/* feature nodes */}
        {features.map((f, i) => {
          const y = yAt(i, features.length);
          return (
            <g key={f.id}>
              <rect
                className="fig-box"
                x={X.feat - 82}
                y={y - 14}
                width={164}
                height={28}
                rx={14}
                style={f.mine ? { stroke: "rgba(169,155,255,0.55)" } : undefined}
              />
              {f.mine && <circle className="fig-mine" cx={X.feat - 66} cy={y} r={3} />}
              <text x={X.feat + (f.mine ? 6 : 0)} y={y + 4} textAnchor="middle" style={{ fill: "var(--fg)" }}>
                {f.label}
              </text>
            </g>
          );
        })}

        {/* model nodes */}
        {models.map((m) => (
          <g key={m}>
            <rect x={X.model - 3} y={my(m) - 3} width={6} height={6} className="fig-node" />
            <text x={X.model + 14} y={my(m) + 4}>
              {m}
            </text>
          </g>
        ))}

        <circle className="fig-mine" cx={X.role - 150} cy={H - 10} r={3} />
        <text x={X.role - 140} y={H - 6} className="fig-mine-text">
          built by me
        </text>
      </svg>
    </div>
  );
}
