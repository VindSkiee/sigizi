"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getOrderById, updateOrderStatus } from "@/lib/api";
import { PaymentDetailCard } from "@/components/features/admin/payments/PaymentDetailCard";
import {
  Invoice,
  SupplierBankAccount,
} from "@/components/features/admin/payments/types";

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PaymentConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.invoiceId as string;
  const { token } = useAuth();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [bankAccount, setBankAccount] = useState<SupplierBankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!token || !orderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await getOrderById(token, orderId);
        if (response.success && response.data) {
          const order = response.data as any;

          // Convert order to Invoice format
          const invoiceData: Invoice = {
            id: order.id,
            invoiceNumber: `PO-${order.id.slice(-4).toUpperCase()}`,
            supplierName: order.supplier?.name || "-",
            supplierId: order.supplierId || "",
            referencePO: `#PO-${order.id.slice(-4).toUpperCase()}`,
            dueDate: order.expectedDeliveryDate || order.createdAt,
            issuedDate: order.createdAt,
            totalAmount: order.total,
            status: "PENDING",
            orderItems: (order.items || []).map((item: any) => ({
              id: item.id,
              name: item.item?.name || "-",
              quantity: item.quantity,
              unit: item.item?.unit || "pcs",
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          };

          setInvoice(invoiceData);

          // Mock bank account data (would come from supplier in real app)
          setBankAccount({
            bankName: "Bank BRI",
            accountNumber: "1234567890123",
            accountName: order.supplier?.name || "-",
          });
        }
      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError(err.message || "Gagal memuat data pesanan");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [token, orderId]);

  const handleConfirmPayment = async () => {
    if (!token || !orderId) return;

    setSubmitting(true);
    try {
      const response = await updateOrderStatus(token, orderId, "DELIVERED");
      if (response.success) {
        setShowSuccess(true);
      }
    } catch (err: any) {
      console.error("Failed to confirm payment:", err);
      alert(err.message || "Gagal mengkonfirmasi pembayaran");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Memuat data pesanan...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice || !bankAccount) {
    return (
      <div className="w-full h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <p className="text-gray-500 mb-4">{error || "Pesanan tidak ditemukan"}</p>
          <Link
            href="/admin/suppliers"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Integrasi Supplier
          </Link>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="w-full h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Pembayaran Dikonfirmasi!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Pesanan <span className="font-semibold">{invoice.invoiceNumber}</span> telah
            ditandai sebagai sudah dikirim.
          </p>
          <Link
            href="/admin/suppliers"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Integrasi Supplier
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
          href="/admin/suppliers"
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
          <PaymentDetailCard invoice={invoice} bankAccount={bankAccount} />
        </div>

        {/* Right: Payment Confirmation Button */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Konfirmasi Pembayaran
          </h3>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Total Pembayaran</p>
            <p className="text-2xl font-bold text-blue-700">
              Rp {invoice.totalAmount.toLocaleString("id-ID")}
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Dengan mengkonfirmasi ini, Anda menyatakan bahwa pembayaran telah
            dilakukan sesuai jumlah tagihan dan pesanan akan ditandai sebagai
            sudah dikirim.
          </p>

          <div className="mt-auto">
            <button
              onClick={handleConfirmPayment}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Konfirmasi Pembayaran
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
