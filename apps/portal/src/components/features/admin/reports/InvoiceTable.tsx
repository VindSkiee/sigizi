"use client";

import {
  InvoiceRow as InvoiceRowType,
  ExpenseSource,
  SOURCE_LABELS,
} from "./types";
import { InvoiceRow } from "./InvoiceRow";

interface InvoiceTableProps {
  rows: InvoiceRowType[];
  onInputManual: () => void;
  activeSource: ExpenseSource;
}

const TABLE_HEADERS: Record<
  ExpenseSource,
  { title: string; subtitle: string }
> = {
  CASH: {
    title: "Pengeluaran Kas",
    subtitle: "Pembayaran pesanan + biaya operasional",
  },
  PRODUCTION: {
    title: "Biaya Produksi Batch",
    subtitle: "Nilai bahan yang dikonsumsi dalam produksi batch",
  },
  ALL: {
    title: "Semua Transaksi",
    subtitle: "Seluruh transaksi keuangan (pesanan, batch, operasional)",
  },
};

export function InvoiceTable({
  rows,
  onInputManual,
  activeSource,
}: InvoiceTableProps) {
  const header = TABLE_HEADERS[activeSource];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-blue-800">{header.title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{header.subtitle}</p>
        </div>
        <button
          onClick={onInputManual}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Input Pengeluaran Tambahan
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="p-12 text-center">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-sm">
            Tidak ada data transaksi untuk periode ini
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Coba ubah rentang tanggal atau jenis pengeluaran
          </p>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Tgl Transaksi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Referensi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Deskripsi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Nominal
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Sumber & Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <InvoiceRow key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
