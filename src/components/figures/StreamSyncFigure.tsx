/**
 * StreamSync at a glance: many platforms feed one catalog, which serves
 * personal libraries and staff dashboards. Violet dots mark Nataly's parts.
 */

const icons = [28, 68, 108];

const Mine = ({ x, y }: { x: number; y: number }) => <circle className="fig-mine" cx={x} cy={y} r={2.5} />;

function Box({ x, y, w, title, sub, mine }: { x: number; y: number; w: number; title: string; sub: string; mine?: boolean }) {
  return (
    <g>
      <rect className="fig-box" x={x} y={y} width={w} height={40} rx={6} />
      <text x={x + 12} y={y + 17} className="fig-title">
        {title}
      </text>
      {mine && <Mine x={x + w - 10} y={y + 13} />}
      <text x={x + 12} y={y + 32} className="fig-faint">
        {sub}
      </text>
    </g>
  );
}

export default function StreamSyncFigure() {
  const toLibrary = "M172 60 C 188 60, 188 34, 204 34";
  const fromPlatform = "M20 68 L 56 68";

  return (
    <svg viewBox="0 0 300 136" className="fig h-full w-full" role="img" aria-labelledby="ss-t ss-d">
      <title id="ss-t">StreamSync overview</title>
      <desc id="ss-d">
        Streaming platforms feed one catalog, which serves each user&apos;s personal library and the staff dashboards.
        The catalog and the personal library are Nataly&apos;s work.
      </desc>

      {/* platforms → catalog */}
      {icons.map((cy) => (
        <path key={cy} className="fig-wire" d={`M20 ${cy} C 38 ${cy}, 38 68, 56 68`} />
      ))}
      <path className="fig-signal signal-path cyan" d={fromPlatform} pathLength={200} />

      {/* catalog → library / dashboards */}
      <path className="fig-wire" d={toLibrary} />
      <path className="fig-signal signal-path violet" d={toLibrary} pathLength={200} style={{ animationDelay: "1.2s" }} />
      <path className="fig-wire" d="M172 76 C 188 76, 188 102, 204 102" />

      {icons.map((cy) => (
        <g key={cy}>
          <rect className="fig-box" x={4} y={cy - 8} width={16} height={16} rx={4} />
          <path className="fig-node" d={`M10 ${cy - 4} L15.5 ${cy} L10 ${cy + 4} Z`} />
        </g>
      ))}
      <text x={4} y={132} className="fig-faint">
        platforms
      </text>

      <Box x={56} y={48} w={116} title="Catalog" sub="search · filters" mine />
      <Box x={204} y={14} w={90} title="Library" sub="your lists" mine />
      <Box x={204} y={82} w={90} title="Dashboards" sub="for staff" />
    </svg>
  );
}
