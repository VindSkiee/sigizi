import { cn } from "@/lib/utils";

type StatsColor =
  "green" | "blue" | "yellow" | "orange" | "red" | "gray" | "primary";

const colorMap: Record<
  StatsColor,
  { bg: string; text: string; accent: string; accentBorder: string }
> = {
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    accent: "bg-green-600",
    accentBorder: "border-green-500",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    accent: "bg-blue-600",
    accentBorder: "border-blue-500",
  },
  yellow: {
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    accent: "bg-yellow-600",
    accentBorder: "border-yellow-500",
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    accent: "bg-orange-600",
    accentBorder: "border-orange-500",
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-600",
    accent: "bg-red-600",
    accentBorder: "border-red-500",
  },
  gray: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    accent: "bg-gray-600",
    accentBorder: "border-gray-500",
  },
  primary: {
    bg: "bg-primary-100",
    text: "text-primary-600",
    accent: "bg-primary-600",
    accentBorder: "border-primary-500",
  },
};

export interface AdminStatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
  unit?: string;
  color?: StatsColor;
  accent?: boolean;
  loading?: boolean;
  className?: string;
}

export function AdminStatsCard({
  title,
  value,
  icon,
  subtitle,
  unit,
  color = "gray",
  accent = false,
  loading = false,
  className,
}: AdminStatsCardProps) {
  const palette = colorMap[color];

  if (accent) {
    return (
      <div
        className={cn("rounded-xl p-5 text-white", palette.accent, className)}
      >
        <div className="flex items-center gap-3 mb-3">
          {icon && (
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white">
              {icon}
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
            {title}
          </p>
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 bg-white/20 rounded w-32" />
            <div className="h-3 bg-white/20 rounded w-24" />
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold">
              {value}
              {unit && (
                <span className="text-sm font-normal text-white/70 ml-1">
                  {unit}
                </span>
              )}
            </p>
            {subtitle && (
              <p className="text-xs text-white/60 mt-2">{subtitle}</p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 p-5",
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              palette.bg,
              palette.text,
            )}
          >
            {icon}
          </div>
        )}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {title}
        </p>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          {subtitle && (
            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
          )}
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {unit && (
              <span className="text-sm font-normal text-gray-500 ml-1">
                {unit}
              </span>
            )}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </>
      )}
    </div>
  );
}

export interface AdminStatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const gridMap = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function AdminStatsGrid({
  children,
  columns = 4,
  className,
}: AdminStatsGridProps) {
  return (
    <div className={cn("grid gap-4 mb-6", gridMap[columns], className)}>
      {children}
    </div>
  );
}
