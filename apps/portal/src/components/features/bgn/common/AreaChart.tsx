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
  const w = 100;
  const h = height;
  const pad = { top: 10, bottom: 28, left: 4, right: 4 };
  const chartH = h - pad.top - pad.bottom;
  const chartW = w;
  const step = chartW / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: i * step,
    y: pad.top + chartH - ((d.value - min) / range) * chartH,
    value: d.value,
    label: d.label,
  }));

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${h - pad.bottom} L ${pts[0].x} ${h - pad.bottom} Z`;

  const fmt = formatValue || ((v: number) => v.toLocaleString("id-ID"));

  return (
    <div style={{ width: "100%", height }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
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
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.5, 1].map((frac) => (
          <line
            key={frac}
            x1="0"
            y1={pad.top + chartH * (1 - frac)}
            x2={w}
            y2={pad.top + chartH * (1 - frac)}
            stroke="#E2E8F0"
            strokeWidth="0.5"
          />
        ))}
        {/* Area */}
        <path d={areaPath} fill={`url(#ag-${color.replace("#", "")})`} />
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} />
        ))}
        {/* X labels */}
        {pts.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={h - 6}
            textAnchor="middle"
            fontSize="5"
            fill="#94A3B8"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
