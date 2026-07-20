import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  loading,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : (
            <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          )}
          {trend && !loading && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600",
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-gray-400 ml-1">vs bulan lalu</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-green-600">{icon}</div>
      </div>
    </div>
  );
}
