import type { RiskLevel } from "@/lib/bgn-mock-data";

const riskConfig: Record<
  RiskLevel,
  { bg: string; color: string; dot: string }
> = {
  Normal: { bg: "#F8FAFC", color: "#64748B", dot: "#94A3B8" },
  Warning: { bg: "#FFFBEB", color: "#B45309", dot: "#D97706" },
  Review: { bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626" },
};

export default function RiskBadge({ risk }: { risk: RiskLevel }) {
  const cfg = riskConfig[risk];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1"
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontFamily: "var(--font-body)",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: cfg.dot }}
      ></span>
      {risk}
    </span>
  );
}
