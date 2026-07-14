"use client";

import { Search } from "lucide-react";

interface BeneficiarySearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function BeneficiarySearchBar({
  search,
  onSearchChange,
}: BeneficiarySearchBarProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari nama lembaga atau alamat..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
        />
      </div>
    </div>
  );
}
