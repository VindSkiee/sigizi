"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Lock,
  Building2,
  CreditCard,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getOrderById, confirmOrderPayment } from "@/lib/api";
import { Invoice } from "@/components/features/admin/payments/types";

export default function PaymentGatewaySimulationPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.invoiceId as string;
  const { token } = useAuth();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Payment gateway specific states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

          const invoiceData: Invoice = {
            id: order.id,
            invoiceNumber: `PO-${order.id.slice(-4).toUpperCase()}`,
            supplierName: order.supplier?.name || "Merchant Partner",
            supplierId: order.supplierId || "",
            referencePO: `#PO-${order.id.slice(-4).toUpperCase()}`,
            dueDate: order.expectedDeliveryDate || order.createdAt,
            issuedDate: order.createdAt,
            totalAmount: order.total,
            status: "PENDING",
            orderItems: [], // We won't heavily display items in a minimal gateway
          };

          setInvoice(invoiceData);
        }
      } catch (err: any) {
        console.error("Failed to fetch order:", err);
        setError(err.message || "Gagal memuat data tagihan");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [token, orderId]);

  const handleProcessPayment = async () => {
    if (!token || !orderId) return;

    setIsProcessing(true);
    
    try {
      // Simulate gateway processing delay (optional, for UX feel)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await confirmOrderPayment(token, orderId);
      if (response.success) {
        setIsSuccess(true);
      }
    } catch (err: any) {
      console.error("Failed to process payment:", err);
      alert(err.message || "Transaksi ditolak oleh sistem.");
      setIsProcessing(false);
    }
  };

  // ---------------------------------------------------------
  // RENDER: LOADING STATE
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // ---------------------------------------------------------
  // RENDER: ERROR STATE
  // ---------------------------------------------------------
  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Sesi Tidak Valid</h2>
          <p className="text-gray-500 mb-8">{error || "Tagihan tidak ditemukan atau sudah kadaluarsa."}</p>
          <Link
            href="/admin/suppliers"
            className="inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // RENDER: SUCCESS STATE (GATEWAY RECEIPT)
  // ---------------------------------------------------------
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">Pembayaran Berhasil</h2>
          <p className="text-gray-500 text-sm mb-8">Dana telah diteruskan ke {invoice.supplierName}</p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-500 mb-1">Total Dibayar</p>
            <p className="text-xl font-semibold text-gray-900">
              Rp {invoice.totalAmount.toLocaleString("id-ID")}
            </p>
          </div>

          <Link
            href="/admin/suppliers"
            className="inline-flex w-full items-center justify-center px-5 py-3.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all"
          >
            Selesai
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // RENDER: MAIN GATEWAY VIEW
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
      
      {/* Top Navigation (Absolute or outside card for clean look) */}
      <div className="absolute top-6 left-6">
        <Link
          href="/admin/suppliers"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Batal
        </Link>
      </div>

      {/* Main Checkout Card */}
      <div className="w-full max-w-sm bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        
        {/* Gateway Header */}
        <div className="pt-8 pb-6 px-8 text-center border-b border-gray-50">
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider mb-6">
            <Lock className="w-3.5 h-3.5" />
            Secure Checkout
          </div>
          
          <p className="text-sm text-gray-500 mb-1">Membayar kepada</p>
          <h1 className="text-lg font-medium text-gray-900 flex items-center justify-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            {invoice.supplierName}
          </h1>
        </div>

        {/* Amount Section */}
        <div className="py-8 px-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Total Tagihan</p>
          <h2 className="text-4xl font-light text-blue-600 tracking-tight">
            <span className="text-2xl align-top mr-1 font-normal">Rp</span>
            {invoice.totalAmount.toLocaleString("id-ID")}
          </h2>
          <p className="text-xs text-gray-400 mt-2">Order ID: {invoice.invoiceNumber}</p>
        </div>

        {/* Simulated Payment Method (Static for Gateway Illusion) */}
        <div className="px-8 pb-6">
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl mb-6">
            <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
              <CreditCard className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Saldo Akun B2B</p>
              <p className="text-xs text-gray-500">Pemotongan langsung</p>
            </div>
            <div className="ml-auto">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleProcessPayment}
            disabled={isProcessing}
            className="w-full relative inline-flex items-center justify-center px-5 py-4 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-80 disabled:cursor-wait overflow-hidden"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Bayar Sekarang
              </span>
            )}
          </button>
          
          <p className="text-[11px] text-center text-gray-400 mt-4 px-4 leading-relaxed">
            Dengan menekan tombol di atas, Anda menyetujui pemotongan saldo untuk transaksi ini.
          </p>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="mt-8 text-xs text-gray-400">
        Powered by <span className="font-bold text-blue-500">SIGIZI</span>
      </div>
    </div>
  );
}
