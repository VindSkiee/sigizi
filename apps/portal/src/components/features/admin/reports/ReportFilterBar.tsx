"use client";

import { useState } from "react";
import {
  ReportFilter,
  DEFAULT_FILTER,
  ExpenseSource,
  SOURCE_LABELS,
  SOURCE_DESCRIPTIONS,
} from "./types";

interface ReportFilterBarProps {
  onFilter: (filter: ReportFilter) => void;
  isLoading: boolean;
}

export function ReportFilterBar({ onFilter, isLoading }: ReportFilterBarProps) {
  const [filter, setFilter] = useState<ReportFilter>(DEFAULT_FILTER);
  const today = new Date().toISOString().slice(0, 10);

  const handleApply = () => {
    onFilter(filter);
  };

  const handleSourceChange = (source: ExpenseSource) => {
    const newFilter = { ...filter, source };
    setFilter(newFilter);
    onFilter(newFilter);
  };

  const sources: ExpenseSource[] = ["ALL", "OPEX"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Jenis Pengeluaran
        </p>
        <div className="flex gap-2 flex-wrap">
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => handleSourceChange(source)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter.source === source
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div>{SOURCE_LABELS[source]}</div>
              <div
                className={`text-xs mt-0.5 ${
                  filter.source === source
                    ? "text-primary-100"
                    : "text-gray-500"
                }`}
              >
                {SOURCE_DESCRIPTIONS[source]}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Rentang Tanggal
        </p>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={filter.startDate}
              max={filter.endDate || today}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={filter.endDate}
              min={filter.startDate}
              max={today}
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={handleApply}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Memuat...
              </>
            ) : (
              "Terapkan Filter"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
