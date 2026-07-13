"use client";

import { Search, Download, RefreshCw } from "lucide-react";

interface BeneficiarySearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onExport: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export function BeneficiarySearchBar({
  search,
  onSearchChange,
  onExport,
  onSync,
  isSyncing,
}: BeneficiarySearchBarProps) {
  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari Sekolah atau Kelas..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        />
      </div>

      {/* Export Log */}
      <button
        onClick={onExport}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Download className="w-4 h-4" />
        Export Log
      </button>

      {/* Sinkronkan Absensi */}
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
      >
        <RefreshCw
          className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
        />
        {isSyncing ? "Menyinkronkan..." : "Sinkronkan Absensi"}
      </button>
    </div>
  );
}
