"use client";

interface ReportHeaderProps {
  onOpenBgnModal: () => void;
}

export function ReportHeader({ onOpenBgnModal }: ReportHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Generasi Laporan SPJ & Ekspor Data
        </h1>
        <p className="text-sm text-gray-500 mt-1 max-w-xl">
          Data pengeluaran dari supplier otomatis terekam di sini. Ekspor data
          ke PDF untuk diserahkan ke Akuntan BGN mingguan/dwimingguan.
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 ml-6">
        <button
          onClick={onOpenBgnModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors"
        >
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Generate Dokumen BGN
        </button>
      </div>
    </div>
  );
}
