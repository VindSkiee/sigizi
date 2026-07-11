'use client';

import { Search, Plus } from 'lucide-react';

interface BatchSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
}

export function BatchSearchBar({
  searchQuery,
  onSearchChange,
  onCreateClick,
}: BatchSearchBarProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari ID Batch / Sekolah"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Create Button */}
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
      >
        <Plus className="w-5 h-5" />
        Buat Batch Masak Baru
      </button>
    </div>
  );
}
