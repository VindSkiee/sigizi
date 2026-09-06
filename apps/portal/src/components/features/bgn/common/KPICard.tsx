interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: string;
  trendUp?: boolean;
  highlight?: boolean;
  wide?: boolean;
}

export default function KPICard({
  label,
  value,
  sub,
  trend,
  trendUp,
  highlight,
  wide,
}: KPICardProps) {
  return (
    <div
      className={`rounded-lg p-5 flex flex-col gap-1 ${wide ? "col-span-2" : ""}`}
      style={{
        background: highlight ? "var(--accent)" : "var(--card)",
        border: highlight ? "none" : "1px solid var(--border)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wider"
        style={{
          color: highlight ? "rgba(255,255,255,0.7)" : "var(--text-secondary)",
        }}
      >
        {label}
      </div>
      <div
        className="text-2xl font-bold leading-tight"
        style={{
          color: highlight ? "#fff" : "var(--text-primary)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="text-xs"
          style={{
            color: highlight ? "rgba(255,255,255,0.6)" : "var(--text-muted)",
          }}
        >
          {sub}
        </div>
      )}
      {trend && (
        <div
          className="text-xs font-semibold mt-1"
          style={{
            color: highlight
              ? "rgba(255,255,255,0.85)"
              : trendUp
                ? "var(--green)"
                : "var(--red)",
          }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}
