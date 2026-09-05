"use client";

import { Calendar } from "lucide-react";
import { STATUS_FILTER_OPTIONS, type TransactionFilter } from "./types";

interface TransactionFilterBarProps {
  filter: TransactionFilter;
  onFilterChange: (filter: Partial<TransactionFilter>) => void;
}

export function TransactionFilterBar({
  filter,
  onFilterChange,
}: TransactionFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={filter.startDate}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <span className="text-gray-400 text-sm">s/d</span>
          <input
            type="date"
            value={filter.endDate}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <select
          value={filter.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
