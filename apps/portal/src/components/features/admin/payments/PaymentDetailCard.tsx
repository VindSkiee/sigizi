"use client";

import { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  Calendar,
  Building2,
  CreditCard,
  ChevronRight,
  X,
} from "lucide-react";
import { Invoice, SupplierBankAccount, INVOICE_STATUS_CONFIG } from "./types";

interface PaymentDetailCardProps {
  invoice: Invoice;
  bankAccount: SupplierBankAccount;
}

export function PaymentDetailCard({
  invoice,
  bankAccount,
}: PaymentDetailCardProps) {
  const [copied, setCopied] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState(false);
  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status];

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCopyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(bankAccount.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = bankAccount.accountNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Compact item summary
  const itemSummary =
    invoice.orderItems.length <= 3
      ? invoice.orderItems.map((i) => i.name).join(", ")
      : `${invoice.orderItems
          .slice(0, 2)
          .map((i) => i.name)
          .join(", ")}, +${invoice.orderItems.length - 2} lainnya`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-900">
            {invoice.invoiceNumber}
          </span>
        </div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.badgeClass}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col space-y-3 overflow-auto">
        {/* Invoice Info - Compact Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Referensi PO</p>
            <p className="font-semibold text-blue-600">{invoice.referencePO}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Supplier</p>
            <p className="font-semibold text-gray-900 truncate">
              {invoice.supplierName}
            </p>
          </div>
        </div>

        {/* Dates - Compact */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 flex-1">
            <Calendar className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 leading-tight">
                Diterbitkan
              </p>
              <p className="text-xs font-medium text-gray-900 truncate">
                {formatDate(invoice.issuedDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2 flex-1">
            <Calendar className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-gray-500 leading-tight">
                Jatuh Tempo
              </p>
              <p className="text-xs font-medium text-red-600 truncate">
                {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Items Summary - Clickable */}
        <button
          onClick={() => setShowItemDetail(true)}
          className="bg-gray-50 rounded-lg p-3 text-left hover:bg-gray-100 transition-colors w-full group"
        >
          <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
            Item Pesanan
          </p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-800">{itemSummary}</p>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
          </div>
        </button>

        {/* Total */}
        <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Total yang harus dibayar
          </span>
          <span className="text-lg font-bold text-blue-700">
            {formatCurrency(invoice.totalAmount)}
          </span>
        </div>

        {/* Bank Account - Compact */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mt-auto">
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 className="w-3.5 h-3.5 text-green-700" />
            <span className="text-xs font-semibold text-green-800">
              Rekening Tujuan
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-100">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-4 h-4 text-green-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">{bankAccount.bankName}</p>
                  <p className="text-sm font-bold text-gray-900 tracking-wide truncate">
                    {bankAccount.accountNumber}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    a.n. {bankAccount.accountName}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyAccountNumber}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                  copied
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Salin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {showItemDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Detail Item Pesanan
                </h3>
                <p className="text-xs text-gray-500">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <button
                onClick={() => setShowItemDetail(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Item
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Harga
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.orderItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rp {item.unitPrice.toLocaleString("id-ID")}/{item.unit}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-700">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-2.5 text-right text-gray-700">
                          Rp {item.unitPrice.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-gray-900">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="flex justify-end mt-4">
                <div className="bg-blue-50 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">
                      Total
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {formatCurrency(invoice.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowItemDetail(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
