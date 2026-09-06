interface BarItem {
  label: string;
  value: number;
  sub?: string;
  color?: string;
}

interface MiniBarChartProps {
  items: BarItem[];
  maxValue?: number;
  unit?: string;
  formatValue?: (v: number) => string;
}

export default function MiniBarChart({
  items,
  maxValue,
  unit = "",
  formatValue,
}: MiniBarChartProps) {
  const max = maxValue || Math.max(...items.map((i) => i.value));
  const fmt =
    formatValue ||
    ((v: number) => `${v.toLocaleString("id-ID")}${unit ? " " + unit : ""}`);

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="w-36 text-xs font-medium truncate shrink-0"
            style={{ color: "var(--text-primary)" }}
          >
            {item.label}
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div
              className="flex-1 h-5 rounded-sm overflow-hidden"
              style={{ background: "var(--bg)" }}
            >
              <div
                className="h-full rounded-sm transition-all duration-500"
                style={{
                  width: `${Math.max(2, (item.value / max) * 100)}%`,
                  background: item.color || "var(--accent)",
                  opacity: 0.85,
                }}
              />
            </div>
            <div
              className="text-xs font-semibold w-24 text-right shrink-0"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {fmt(item.value)}
            </div>
            {item.sub && (
              <div
                className="text-xs w-16 text-right shrink-0"
                style={{
                  color: "var(--green)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {item.sub}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
