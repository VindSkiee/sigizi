"use client";

import { InvoiceRow as InvoiceRowType } from "./types";
import { formatCurrency } from "@/lib/utils";

interface InvoiceRowProps {
  row: InvoiceRowType;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function InvoiceRow({ row }: InvoiceRowProps) {
  return (
    <tr
      className={`border-b border-gray-100 ${
        row.isManual ? "bg-orange-50/50" : "hover:bg-gray-50"
      } transition-colors`}
    >
      {/* TGL TRANSAKSI */}
      <td className="px-4 py-4">
        <p className="text-sm text-gray-700">{formatDate(row.date)}</p>
      </td>

      {/* REF. PO SUPPLIER */}
      <td className="px-4 py-4">
        <div>
          <span
            className={`text-sm font-semibold ${
              row.isManual ? "text-orange-600" : "text-blue-600"
            }`}
          >
            {row.ref}
          </span>
          {row.supplierName && (
            <span className="text-sm text-gray-500 ml-1">
              ({row.supplierName})
            </span>
          )}
        </div>
      </td>

      {/* KATEGORI / DESKRIPSI */}
      <td className="px-4 py-4">
        <p className="text-sm text-gray-700">{row.category}</p>
      </td>

      {/* NOMINAL */}
      <td className="px-4 py-4">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(row.nominal)}
        </p>
      </td>

      {/* STATUS BUKTI */}
      <td className="px-4 py-4">
        {row.isManual && row.fileUrl ? (
          <a
            href={row.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {row.statusBukti}
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {row.statusBukti}
          </span>
        )}
      </td>
    </tr>
  );
}
