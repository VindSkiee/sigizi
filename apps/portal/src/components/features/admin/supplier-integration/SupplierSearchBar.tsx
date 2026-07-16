"use client";

interface SupplierSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreateNew: () => void;
}

export function SupplierSearchBar({
  search,
  onSearchChange,
  onCreateNew,
}: SupplierSearchBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Cari ID Pesanan / Nama Supplier"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
        />
      </div>
      <button
        onClick={onCreateNew}
        className="ml-auto flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
      >
        Buat Pesanan Baru
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </button>
    </div>
  );
}
