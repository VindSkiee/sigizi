interface DataPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

export default function AreaChart({
  data,
  color = "#1B4FBE",
  height = 140,
  formatValue,
}: AreaChartProps) {
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(...data.map((d) => d.value));
  const range = max - min || 1;

  const w = 400;
  const h = height;
  const pad = { top: 16, bottom: 28, left: 48, right: 16 };
  const chartH = h - pad.top - pad.bottom;
  const chartW = w - pad.left - pad.right;
  const step = chartW / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: pad.left + i * step,
    y: pad.top + chartH - ((d.value - min) / range) * chartH,
    value: d.value,
    label: d.label,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${h - pad.bottom} L ${pts[0].x} ${h - pad.bottom} Z`;

  const fmt = formatValue || ((v: number) => v.toLocaleString("id-ID"));

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ width: "100%", height }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient
            id={`ag-${color.replace("#", "")}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines + Y-axis labels */}
        {gridLines.map((frac) => {
          const y = pad.top + chartH * (1 - frac);
          const val = min + range * frac;
          return (
            <g key={frac}>
              <line
                x1={pad.left}
                y1={y}
                x2={w - pad.right}
                y2={y}
                stroke="#E2E8F0"
                strokeWidth="0.5"
              />
              <text
                x={pad.left - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="9"
                fill="#94A3B8"
              >
                {fmt(val)}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill={`url(#ag-${color.replace("#", "")})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} />
        ))}

        {/* X-axis labels */}
        {pts.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={h - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#94A3B8"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
