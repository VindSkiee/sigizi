"use client";

import { useState } from "react";
import {
  InvoiceRow as InvoiceRowType,
  FINANCIAL_SOURCE_CONFIG,
  OrderItemDetail,
} from "./types";
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

function OrderItemsTable({ items }: { items: OrderItemDetail[] }) {
  return (
    <div className="bg-gray-50 border-t border-gray-100">
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Detail Bahan yang Dibeli
        </p>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="pb-2 text-left text-xs font-medium text-gray-500">
                Bahan
              </th>
              <th className="pb-2 text-center text-xs font-medium text-gray-500">
                Qty
              </th>
              <th className="pb-2 text-right text-xs font-medium text-gray-500">
                Harga Satuan
              </th>
              <th className="pb-2 text-right text-xs font-medium text-gray-500">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 last:border-0">
                <td className="py-2 text-sm text-gray-700">{item.itemName}</td>
                <td className="py-2 text-sm text-gray-700 text-center">
                  {item.quantity} {item.unit}
                </td>
                <td className="py-2 text-sm text-gray-700 text-right">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-2 text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-200">
              <td
                colSpan={3}
                className="pt-2 text-xs font-semibold text-gray-500 uppercase"
              >
                Total
              </td>
              <td className="pt-2 text-sm font-bold text-gray-900 text-right">
                {formatCurrency(items.reduce((sum, i) => sum + i.subtotal, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function InvoiceRow({ row }: InvoiceRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sourceConfig = FINANCIAL_SOURCE_CONFIG[row.source];
  const hasOrderItems =
    row.source === "PROCUREMENT" &&
    row.meta?.orderItems &&
    row.meta.orderItems.length > 0;

  const formatBatchDescription = () => {
    if (row.source === "COGS" && row.meta?.quantity && row.meta?.unit) {
      return `${row.meta.quantity} ${row.meta.unit} ${row.category}`;
    }
    return row.category;
  };

  return (
    <>
      <tr
        className={`border-b border-gray-100 ${
          row.isManual ? "bg-orange-50/50" : "hover:bg-gray-50"
        } transition-colors ${hasOrderItems ? "cursor-pointer" : ""}`}
        onClick={hasOrderItems ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            {hasOrderItems && (
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            <p className="text-sm text-gray-700">{formatDate(row.date)}</p>
          </div>
        </td>

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
              <div className="text-xs text-gray-500 mt-0.5">
                {row.supplierName}
              </div>
            )}
          </div>
        </td>

        <td className="px-4 py-4">
          <p className="text-sm text-gray-700">{formatBatchDescription()}</p>
        </td>

        <td className="px-4 py-4">
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(row.nominal)}
          </p>
        </td>

        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sourceConfig.bgColor} ${sourceConfig.color}`}
            >
              {sourceConfig.label}
            </span>
            {row.isManual && row.fileUrl ? (
              <a
                href={row.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                {row.statusBukti}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {row.statusBukti}
              </span>
            )}
          </div>
        </td>
      </tr>

      {isExpanded && hasOrderItems && (
        <tr>
          <td colSpan={5} className="p-0">
            <OrderItemsTable items={row.meta!.orderItems!} />
          </td>
        </tr>
      )}
    </>
  );
}
