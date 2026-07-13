"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, FileText, CreditCard } from "lucide-react";

// ============================================================================
// CATATAN ENDPOINT (untuk integrasi backend nanti)
// ============================================================================
// GET  /api/invoices?status=PENDING&sppgId=xxx       → List invoice (filter)
// GET  /api/invoices/:id                               → Detail invoice
// GET  /api/invoices/stats                             → Statistik (hutang, jatuh tempo, lunas)
// PUT  /api/invoices/:id/pay                           → Tandai invoice sudah dibayar
// PUT  /api/invoices/:id/verify                        → Verifikasi pembayaran
//
// Status flow: PENDING → OVERDUE → VERIFYING → PAID
// ============================================================================

// ============================================================================
// INTERFACES
// ============================================================================

interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  referencePO: string;
  dueDate: string;
  issuedDate: string;
  totalAmount: number;
  status: "PENDING" | "OVERDUE" | "VERIFYING" | "PAID";
}

interface InvoiceStats {
  totalUnpaid: number;
  unpaidCount: number;
  nearestDueDate: string;
  nearestDueSupplier: string;
  totalPaidThisMonth: number;
  paidCount: number;
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const statusConfig = {
  PENDING: {
    label: "Belum Lunas",
    badgeClass: "bg-yellow-100 text-yellow-700",
  },
  OVERDUE: {
    label: "Jatuh Tempo",
    badgeClass: "bg-red-100 text-red-700",
  },
  VERIFYING: {
    label: "Menunggu Verifikasi",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  PAID: {
    label: "Lunas",
    badgeClass: "bg-green-100 text-green-700",
  },
};

type FilterType = "PENDING" | "VERIFYING" | "PAID";

const filterLabels: Record<FilterType, string> = {
  PENDING: "Belum Dibayar",
  VERIFYING: "Menunggu Verifikasi",
  PAID: "Riwayat Lunas",
};

// ============================================================================
// MOCK DATA (sesuai design)
// ============================================================================

const MOCK_STATS: InvoiceStats = {
  totalUnpaid: 8450000,
  unpaidCount: 2,
  nearestDueDate: "2026-05-22",
  nearestDueSupplier: "Toko Sayur Mayur Arief",
  totalPaidThisMonth: 12500000,
  paidCount: 4,
};

const MOCK_INVOICES: Invoice[] = [
  {
    id: "INV-202605-01",
    invoiceNumber: "INV-202605-01",
    supplierName: "Toko Sayur Mayur Arief",
    referencePO: "#PO-0981",
    dueDate: "2026-05-22",
    issuedDate: "2026-05-15",
    totalAmount: 2450000,
    status: "PENDING",
  },
  {
    id: "INV-202605-02",
    invoiceNumber: "INV-202605-02",
    supplierName: "Agen Ayam Potong Subur",
    referencePO: "#PO-0982",
    dueDate: "2026-05-25",
    issuedDate: "2026-05-20",
    totalAmount: 6000000,
    status: "PENDING",
  },
  {
    id: "INV-202605-03",
    invoiceNumber: "INV-202605-03",
    supplierName: "UD. Sumber Rejeki",
    referencePO: "#PO-0980",
    dueDate: "2026-05-18",
    issuedDate: "2026-05-10",
    totalAmount: 3200000,
    status: "PAID",
  },
  {
    id: "INV-202605-04",
    invoiceNumber: "INV-202605-04",
    supplierName: "Toko Sayur Mayur Arief",
    referencePO: "#PO-0979",
    dueDate: "2026-05-15",
    issuedDate: "2026-05-08",
    totalAmount: 1800000,
    status: "PAID",
  },
  {
    id: "INV-202605-05",
    invoiceNumber: "INV-202605-05",
    supplierName: "Pasar Ikan Segar Jaya",
    referencePO: "#PO-0978",
    dueDate: "2026-05-12",
    issuedDate: "2026-05-05",
    totalAmount: 4500000,
    status: "PAID",
  },
  {
    id: "INV-202605-06",
    invoiceNumber: "INV-202605-06",
    supplierName: "Agen Ayam Potong Subur",
    referencePO: "#PO-0977",
    dueDate: "2026-05-10",
    issuedDate: "2026-05-03",
    totalAmount: 3000000,
    status: "PAID",
  },
];

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PaymentsPage() {
  const router = useRouter();
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [filter, setFilter] = useState<FilterType>("PENDING");
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Filter & search
  const filteredInvoices = invoices
    .filter((inv) => {
      if (filter === "PENDING") return inv.status === "PENDING" || inv.status === "OVERDUE";
      if (filter === "VERIFYING") return inv.status === "VERIFYING";
      return inv.status === "PAID";
    })
    .filter((inv) => {
      if (!search) return true;
      const query = search.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.supplierName.toLowerCase().includes(query)
      );
    });

  // Count per status for tabs
  const pendingCount = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE").length;
  const verifyingCount = invoices.filter((i) => i.status === "VERIFYING").length;
  const paidCount = invoices.filter((i) => i.status === "PAID").length;

  const tabCounts: Record<FilterType, number> = {
    PENDING: pendingCount,
    VERIFYING: verifyingCount,
    PAID: paidCount,
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDueDateDisplay = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Terlambat ${Math.abs(diffDays)} hari`, isOverdue: true };
    if (diffDays === 0) return { text: "Hari ini", isOverdue: false };
    if (diffDays <= 3) return { text: `${diffDays} hari lagi`, isOverdue: false };
    return { text: formatDate(dueDate), isOverdue: false };
  };

function handlePayNow(invoice: Invoice) {
  router.push(`/admin/payments/${invoice.id}`);
}

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tagihan & Pembayaran</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola invoice dari supplier dan pantau status pembayaran bahan baku dapur.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Hutang */}
        <div className="bg-red-500 rounded-xl p-5 text-white">
          <p className="text-sm font-medium text-red-100 uppercase tracking-wide">
            Total Hutang Belum Dibayar
          </p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(MOCK_STATS.totalUnpaid)}</p>
          <p className="text-sm text-red-200 mt-1">{MOCK_STATS.unpaidCount} Tagihan Aktif</p>
        </div>

        {/* Jatuh Tempo */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Jatuh Tempo Terdekat
          </p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {formatDate(MOCK_STATS.nearestDueDate)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{MOCK_STATS.nearestDueSupplier}</p>
        </div>

        {/* Total Lunas */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total Lunas Bulan Ini
          </p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(MOCK_STATS.totalPaidThisMonth)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{MOCK_STATS.paidCount} Tagihan Selesai</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {(Object.keys(filterLabels) as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              filter === f
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {filterLabels[f]} ({tabCounts[f]})
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari ID Invoice / Supplier"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Filter size={16} />
          Filter
        </button>
      </div>

      {/* Table */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada tagihan</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="w-[15%]">ID Invoice</div>
            <div className="w-[30%]">Supplier & Referensi PO</div>
            <div className="w-[20%]">Jatuh Tempo</div>
            <div className="w-[15%]">Nominal</div>
            <div className="w-[10%] text-center">Status</div>
            <div className="w-[10%] text-center">Aksi</div>
          </div>

          {/* Table Body */}
          {filteredInvoices.map((invoice) => {
            const dueDateDisplay = getDueDateDisplay(invoice.dueDate);
            return (
              <div
                key={invoice.id}
                className="flex items-center px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                {/* ID Invoice */}
                <div className="w-[15%]">
                  <p className="font-semibold text-gray-800 whitespace-nowrap">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
                    Diterbitkan: {formatDate(invoice.issuedDate)}
                  </p>
                </div>

                {/* Supplier & Ref PO */}
                <div className="w-[30%]">
                  <p className="font-medium text-gray-700 truncate">{invoice.supplierName}</p>
                  <p className="text-sm text-blue-600 whitespace-nowrap">Ref: {invoice.referencePO}</p>
                </div>

                {/* Jatuh Tempo */}
                <div className="w-[20%]">
                  <p
                    className={`font-medium whitespace-nowrap ${
                      dueDateDisplay.isOverdue ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    {dueDateDisplay.text}
                  </p>
                  {!dueDateDisplay.isOverdue && (
                    <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(invoice.dueDate)}</p>
                  )}
                </div>

                {/* Nominal */}
                <div className="w-[15%]">
                  <p className="font-semibold text-gray-800 whitespace-nowrap">
                    {formatCurrency(invoice.totalAmount)}
                  </p>
                </div>

                {/* Status */}
                <div className="w-[10%] text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${statusConfig[invoice.status].badgeClass}`}
                  >
                    {statusConfig[invoice.status].label}
                  </span>
                </div>

                {/* Aksi */}
                <div className="w-[10%] flex justify-center">
                  {invoice.status === "PENDING" || invoice.status === "OVERDUE" ? (
                    <button
                      onClick={() => handlePayNow(invoice)}
                      className="px-3 py-1.5 bg-blue-700 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      Bayar
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      Lihat Detail
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Invoice */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">
                Detail Invoice {selectedInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusConfig[selectedInvoice.status].badgeClass}`}
                >
                  {statusConfig[selectedInvoice.status].label}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-medium">{selectedInvoice.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Referensi PO</p>
                <p className="font-medium text-blue-600">{selectedInvoice.referencePO}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tanggal Diterbitkan</p>
                  <p className="font-medium">{formatDate(selectedInvoice.issuedDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jatuh Tempo</p>
                  <p className="font-medium">{formatDate(selectedInvoice.dueDate)}</p>
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
