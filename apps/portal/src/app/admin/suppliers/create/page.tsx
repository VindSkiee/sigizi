"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMarketPrices, createOrder } from "@/lib/api";
import { DraftItem, SupplierSearchResult } from "@/components/features/admin/create-order/types";
import { SearchBar } from "@/components/features/admin/create-order/SearchBar";
import { SupplierResults } from "@/components/features/admin/create-order/SupplierResults";
import { DraftOrder } from "@/components/features/admin/create-order/DraftOrder";

export default function CreateOrderPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SupplierSearchResult[]>([]);
  const [searchedItem, setSearchedItem] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !token) return;

    setIsSearching(true);
    try {
      const response = await getMarketPrices(token, {
        item: searchQuery.trim(),
        regency: user?.sppg?.regency || "Kab. Purwakarta",
      });
      if (response.success && response.data) {
        const data = response.data as any;
        setSearchResults(data.suppliers || []);
        setSearchedItem(data.item || searchQuery);
      } else {
        setSearchResults([]);
        setSearchedItem(searchQuery);
      }
    } catch {
      setSearchResults([]);
      setSearchedItem(searchQuery);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToDraft = (supplier: SupplierSearchResult) => {
    const newItem: DraftItem = {
      draftId: crypto.randomUUID(),
      addedAt: Date.now(),
      supplierId: supplier.id,
      supplierName: supplier.name,
      itemId: supplier.id,
      itemName: searchedItem || searchQuery,
      unit: supplier.unit,
      unitPrice: supplier.price,
      quantity: 1,
    };
    setDraftItems((prev) => [...prev, newItem]);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setDraftItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  };

  const handleRemove = (index: number) => {
    setDraftItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!token || !user || draftItems.length === 0) return;

    setIsSubmitting(true);
    try {
      // Group items by supplier
      const groupedBySupplier = draftItems.reduce<Record<string, DraftItem[]>>(
        (acc, item) => {
          if (!acc[item.supplierId]) {
            acc[item.supplierId] = [];
          }
          acc[item.supplierId].push(item);
          return acc;
        },
        {}
      );

      // Create one order per supplier
      for (const [supplierId, items] of Object.entries(groupedBySupplier)) {
        const orderData = {
          supplierId,
          items: items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        };

        const sppgId = user.sppgId || "";
        const userId = user.id;

        await createOrder(token, orderData, sppgId, userId);
      }

      // Success - redirect
      router.push("/admin/suppliers");
    } catch {
      alert("Gagal membuat pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const draftSupplierIds = draftItems.map((item) => item.supplierId);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pilih Bahan Baku</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cari bahan yang dibutuhkan, bandingkan harga antar supplier, dan tambahkan ke daftar pesanan.
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        isLoading={isSearching}
      />

      {/* Search Results */}
      {searchedItem && (
        <SupplierResults
          suppliers={searchResults}
          itemName={searchedItem}
          draftSupplierIds={draftSupplierIds}
          onAddToDraft={handleAddToDraft}
        />
      )}

      {/* Draft Order */}
      <DraftOrder
        items={draftItems}
        deliveryTime={deliveryTime}
        onDeliveryTimeChange={setDeliveryTime}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
