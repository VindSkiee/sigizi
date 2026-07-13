"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PaymentDetailCard } from "@/components/features/admin/payments/PaymentDetailCard";
import { PaymentConfirmationCard } from "@/components/features/admin/payments/PaymentConfirmationCard";
import {
  Invoice,
  SupplierBankAccount,
} from "@/components/features/admin/payments/types";

// ============================================================================
// CATATAN ENDPOINT (untuk integrasi backend nanti)
// ============================================================================
// GET  /api/invoices/:id                               → Detail invoice
// GET  /api/suppliers/:id                              → Data supplier (termasuk rekening)
// POST /api/invoices/:id/payment-proof                 → Upload bukti bayar
//
// Status flow: PENDING → OVERDUE → VERIFYING → PAID
// ============================================================================

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_INVOICE: Invoice = {
  id: "INV-202605-01",
  invoiceNumber: "INV-202605-01",
  supplierName: "Toko Sayur Mayur Arief",
  supplierId: "SUP-001",
  referencePO: "#PO-0981",
  dueDate: "2026-05-22",
  issuedDate: "2026-05-15",
  totalAmount: 2450000,
  status: "PENDING",
  orderItems: [
    {
      id: "item-001",
      name: "Bayam Segar",
      quantity: 50,
      unit: "kg",
      unitPrice: 12000,
      subtotal: 600000,
    },
    {
      id: "item-002",
      name: "Wortel",
      quantity: 30,
      unit: "kg",
      unitPrice: 15000,
      subtotal: 450000,
    },
    {
      id: "item-003",
      name: "Tomat",
      quantity: 40,
      unit: "kg",
      unitPrice: 18000,
      subtotal: 720000,
    },
    {
      id: "item-004",
      name: "Bawang Merah",
      quantity: 20,
      unit: "kg",
      unitPrice: 34000,
      subtotal: 680000,
    },
  ],
};

const MOCK_BANK_ACCOUNT: SupplierBankAccount = {
  bankName: "Bank BRI",
  accountNumber: "1234567890123",
  accountName: "Toko Sayur Mayur Arief",
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PaymentConfirmationPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmitPaymentProof = async (file: File, notes: string) => {
    // Simulate API call
    console.log("Submitting payment proof:", {
      invoiceId: MOCK_INVOICE.id,
      file: file.name,
      notes,
    });

    // Show success state
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="w-full h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Bukti Pembayaran Terkirim!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Bukti pembayaran untuk invoice{" "}
            <span className="font-semibold">{MOCK_INVOICE.invoiceNumber}</span>{" "}
            berhasil dikirim.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-xs text-gray-500">Status Saat Ini</p>
            <p className="font-semibold text-blue-600">Menunggu Verifikasi</p>
          </div>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Tagihan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-3 flex-shrink-0">
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          Konfirmasi Pembayaran
        </h1>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left: Payment Detail */}
        <div className="min-h-0 overflow-auto">
          <PaymentDetailCard
            invoice={MOCK_INVOICE}
            bankAccount={MOCK_BANK_ACCOUNT}
          />
        </div>

        {/* Right: Payment Confirmation Form */}
        <div className="min-h-0 overflow-auto">
          <PaymentConfirmationCard
            invoice={MOCK_INVOICE}
            onSubmit={handleSubmitPaymentProof}
          />
        </div>
      </div>
    </div>
  );
}
