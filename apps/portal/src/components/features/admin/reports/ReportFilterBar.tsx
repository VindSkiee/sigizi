"use client";

import { useState } from "react";
import { ReportFilter, PeriodType, DEFAULT_FILTER } from "./types";

interface ReportFilterBarProps {
  onFilter: (filter: ReportFilter) => void;
  isLoading: boolean;
}

function getWeekRange(dateStr: string): { start: string; end: string; label: string } {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const weekNum = Math.ceil(
    (monday.getDate() + new Date(monday.getFullYear(), 0, 1).getDay()) / 7
  );

  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
    label: `${fmt(monday)} - ${fmt(sunday)} (Minggu ${weekNum})`,
  };
}

export function ReportFilterBar({ onFilter, isLoading }: ReportFilterBarProps) {
  const [filter, setFilter] = useState<ReportFilter>(DEFAULT_FILTER);

  const weekRange = filter.periodType === "weekly" ? getWeekRange(filter.date) : null;

  const handleApply = () => {
    const reportFilter: ReportFilter = {
      ...filter,
      weekStart: weekRange?.start,
      weekLabel: weekRange?.label,
    };
    onFilter(reportFilter);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Periode Pelaporan BGN
      </p>
      <div className="flex items-end gap-4 flex-wrap">
        {/* Period Type */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Jenis Periode</label>
          <select
            value={filter.periodType}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, periodType: e.target.value as PeriodType }))
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs text-gray-500 mb-1.5">
            {filter.periodType === "daily" ? "Tanggal" : "Tanggal Akhir Minggu"}
          </label>
          <input
            type="date"
            value={filter.date}
            onChange={(e) => setFilter((prev) => ({ ...prev, date: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Week Preview */}
        {filter.periodType === "weekly" && weekRange && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
            <p className="text-sm font-medium text-primary-700">{weekRange.label}</p>
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memuat...
            </>
          ) : (
            "Terapkan Filter"
          )}
        </button>
      </div>
    </div>
  );
}
