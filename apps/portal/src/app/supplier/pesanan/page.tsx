"use client";

import { useState, useMemo, useEffect } from "react";
import { ClipboardList, Search } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import {
  OrderViewModel,
  FilterType,
  Order,
} from "@/components/features/supplier/orders/types";
import { OrderTabs } from "@/components/features/supplier/orders/OrderTabs";
import { OrderCard } from "@/components/features/supplier/orders/OrderCard";
import { OrderDetailModal } from "@/components/features/supplier/orders/OrderDetailModal";
import { PaymentProofModal } from "@/components/features/supplier/orders/PaymentProofModal";

// ============================================================================
// CONSTANTS
// ============================================================================

const ITEMS_PER_PAGE = 5;

// ============================================================================
// MOCK DATA (sesuai struktur response backend)
// Akan diganti dengan real API setelah backend team selesai
// ============================================================================

const MOCK_ORDERS: Order[] = [
  {
    id: "ord001pending123",
    status: "PENDING",
    total: 1160000,
    notes: undefined,
    sppgId: "sppg001",
    supplierId: "supplier001",
    createdAt: "2026-07-12T08:00:00Z",
    updatedAt: "2026-07-12T08:00:00Z",
    sppg: { id: "sppg001", name: "SPPG Purwakarta" },
    supplier: { id: "supplier001", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "item001",
        quantity: 50,
        unitPrice: 12000,
        subtotal: 600000,
        item: { id: "si001", name: "Beras", unit: "kg", basePrice: 12000 },
      },
      {
        id: "item002",
        quantity: 20,
        unitPrice: 28000,
        subtotal: 560000,
        item: { id: "si002", name: "Telur", unit: "kg", basePrice: 28000 },
      },
    ],
  },
  {
    id: "ord002pending456",
    status: "PENDING",
    total: 4500000,
    notes: "Urgent - butuh besok",
    sppgId: "sppg002",
    supplierId: "supplier001",
    createdAt: "2026-07-11T14:30:00Z",
    updatedAt: "2026-07-11T14:30:00Z",
    sppg: { id: "sppg002", name: "SPPG Bandung Barat" },
    supplier: { id: "supplier001", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "item003",
        quantity: 30,
        unitPrice: 120000,
        subtotal: 3600000,
        item: { id: "si003", name: "Daging Sapi", unit: "kg", basePrice: 120000 },
      },
      {
        id: "item004",
        quantity: 15,
        unitPrice: 60000,
        subtotal: 900000,
        item: { id: "si004", name: "Ayam Potong", unit: "kg", basePrice: 60000 },
      },
    ],
  },
  {
    id: "ord003confirm789",
    status: "CONFIRMED",
    total: 2040000,
    notes: undefined,
    sppgId: "sppg003",
    supplierId: "supplier001",
    createdAt: "2026-07-10T09:30:00Z",
    updatedAt: "2026-07-10T10:00:00Z",
    sppg: { id: "sppg003", name: "SPPG Cimahi Central" },
    supplier: { id: "supplier001", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "item005",
        quantity: 15,
        unitPrice: 120000,
        subtotal: 1800000,
        item: { id: "si003", name: "Daging Sapi", unit: "kg", basePrice: 120000 },
      },
      {
        id: "item006",
        quantity: 30,
        unitPrice: 8000,
        subtotal: 240000,
        item: { id: "si005", name: "Wortel", unit: "kg", basePrice: 8000 },
      },
    ],
  },
  {
    id: "ord004deliv012",
    status: "DELIVERED",
    total: 1160000,
    notes: undefined,
    sppgId: "sppg001",
    supplierId: "supplier001",
    createdAt: "2026-07-08T08:00:00Z",
    updatedAt: "2026-07-09T14:00:00Z",
    sppg: { id: "sppg001", name: "SPPG Purwakarta" },
    supplier: { id: "supplier001", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "item007",
        quantity: 50,
        unitPrice: 12000,
        subtotal: 600000,
        item: { id: "si001", name: "Beras", unit: "kg", basePrice: 12000 },
      },
      {
        id: "item008",
        quantity: 20,
        unitPrice: 28000,
        subtotal: 560000,
        item: { id: "si002", name: "Telur", unit: "kg", basePrice: 28000 },
      },
    ],
  },
  {
    id: "ord005complete345",
    status: "COMPLETED",
    total: 3200000,
    notes: undefined,
    sppgId: "sppg004",
    supplierId: "supplier001",
    createdAt: "2026-07-05T10:00:00Z",
    updatedAt: "2026-07-08T16:00:00Z",
    sppg: { id: "sppg004", name: "SPPG Jakarta Selatan" },
    supplier: { id: "supplier001", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "item009",
        quantity: 25,
        unitPrice: 80000,
        subtotal: 2000000,
        item: { id: "si006", name: "Ikan Salmon", unit: "kg", basePrice: 80000 },
      },
      {
        id: "item010",
        quantity: 20,
        unitPrice: 60000,
        subtotal: 1200000,
        item: { id: "si004", name: "Ayam Potong", unit: "kg", basePrice: 60000 },
      },
    ],
  },
  {
    id: "ord006cancel678",
    status: "CANCELLED",
    total: 2800000,
    notes: "Stok tidak mencukupi",
    sppgId: "sppg005",
    supplierId: "supplier001",
    createdAt: "2026-07-03T14:00:00Z",
    updatedAt: "2026-07-03T15:00:00Z",
    sppg: { id: "sppg005", name: "SPPG Padalarang" },
    supplier: { id: "supplier001", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "item011",
        quantity: 100,
        unitPrice: 28000,
        subtotal: 2800000,
        item: { id: "si002", name: "Telur", unit: "kg", basePrice: 28000 },
      },
    ],
  },
  {
    id: "ord007deliv901",
    status: "DELIVERED",
    total: 890000,
    notes: undefined,
    sppgId: "sppg002",
    supplierId: "supplier001",
    createdAt: "2026-07-01T11:00:00Z",
    updatedAt: "2026-07-02T09:00:00Z",
    sppg: { id: "sppg002", name: "SPPG Bandung Barat" },
    supplier: { id: "supplier001", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "item012",
        quantity: 50,
        unitPrice: 8000,
        subtotal: 400000,
        item: { id: "si005", name: "Wortel", unit: "kg", basePrice: 8000 },
      },
      {
        id: "item013",
        quantity: 30,
        unitPrice: 10000,
        subtotal: 300000,
        item: { id: "si007", name: "Bayam", unit: "ikat", basePrice: 10000 },
      },
      {
        id: "item014",
        quantity: 19,
        unitPrice: 10000,
        subtotal: 190000,
        item: { id: "si008", name: "Kangkung", unit: "ikat", basePrice: 10000 },
      },
    ],
  },
  {
    id: "ord008confirm234",
    status: "CONFIRMED",
    total: 1800000,
    notes: undefined,
    sppgId: "sppg003",
    supplierId: "supplier001",
    createdAt: "2026-07-11T16:00:00Z",
    updatedAt: "2026-07-11T16:30:00Z",
    sppg: { id: "sppg003", name: "SPPG Cimahi Central" },
    supplier: { id: "supplier001", name: "UD. Sumber Makmur" },
    items: [
      {
        id: "item015",
        quantity: 60,
        unitPrice: 30000,
        subtotal: 1800000,
        item: { id: "si009", name: "Tahu", unit: "pcs", basePrice: 3000 },
      },
    ],
  },
];

// ============================================================================
// MAPPING FUNCTION (backend → frontend)
// ============================================================================

function mapOrderFromBackend(raw: Order): OrderViewModel {
  return {
    id: raw.id,
    orderNumber: `ORD-${raw.id.slice(-3).toUpperCase()}`,
    sppgName: raw.sppg?.name || "SPPG",
    supplierName: raw.supplier?.name || "Supplier",
    items: raw.items.map((i) => ({
      id: i.id,
      name: i.item?.name || "Item",
      quantity: i.quantity,
      unit: i.item?.unit || "",
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
    total: raw.total,
    status: raw.status,
    createdAt: raw.createdAt,
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function PesananPage() {
  // State
  const [orders] = useState<OrderViewModel[]>(MOCK_ORDERS.map(mapOrderFromBackend));
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderViewModel | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<OrderViewModel | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by status
    if (filter !== "all") {
      result = result.filter((o) => o.status === filter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.sppgName.toLowerCase().includes(query) ||
          o.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }

    return result;
  }, [orders, filter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  // Handle filter change (page reset handled by useEffect)
  function handleFilterChange(newFilter: FilterType) {
    setFilter(newFilter);
  }

  // Mock handlers
  function handleAccept(orderId: string) {
    alert(`✅ Konfirmasi pesanan ${orderId}\n\n(Demo: Status akan berubah dari PENDING ke CONFIRMED)`);
  }

  function handleReject(orderId: string) {
    const confirmed = window.confirm(
      `⚠️ Tolak pesanan ${orderId}?\n\n(Demo: Status akan berubah dari PENDING ke CANCELLED)`
    );
    if (confirmed) {
      alert("Pesanan ditolak (demo)");
    }
  }

  function handleMarkDelivered(orderId: string) {
    const confirmed = window.confirm(
      `📦 Tandai pesanan ${orderId} sebagai dikirim?\n\n(Demo: Status akan berubah dari CONFIRMED ke DELIVERED)`
    );
    if (confirmed) {
      alert("Pesanan ditandai sudah dikirim (demo)");
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pesanan Masuk</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau dan kelola permintaan logistik dari unit SPPG.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari ID Pesanan / Nama SPPG / Item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <OrderTabs activeFilter={filter} orders={orders} onFilterChange={handleFilterChange} />

      {/* Orders List */}
      {paginatedOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Tidak ada pesanan</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchQuery
              ? "Tidak ada pesanan yang sesuai dengan pencarian"
              : "Belum ada pesanan masuk saat ini"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order, idx) => (
              <OrderCard
                key={`${order.id}-${idx}`}
                order={order}
                onAccept={handleAccept}
                onReject={handleReject}
                onMarkDelivered={handleMarkDelivered}
                onViewDetail={setSelectedOrder}
                onViewPayment={setShowPaymentModal}
              />
            ))}
          </div>

          {/* Pagination Info + Controls */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500">
              Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} dari {filteredOrders.length} pesanan
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {/* Modal Detail Pesanan */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}

      {/* Modal Bukti Pembayaran */}
      {showPaymentModal && (
        <PaymentProofModal order={showPaymentModal} onClose={() => setShowPaymentModal(null)} />
      )}
    </div>
  );
}
