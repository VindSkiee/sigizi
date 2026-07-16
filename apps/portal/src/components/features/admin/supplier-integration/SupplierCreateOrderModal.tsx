"use client";

import { useState } from "react";

interface Supplier {
  id: string;
  name: string;
  nib: string;
}

interface SupplierItem {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
}

interface OrderItemForm {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

interface SupplierCreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newOrder?: any) => void;
}

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "clx00000000000000000000s1",
    name: "UD. Sumber Rejeki",
    nib: "1234567890123",
  },
  {
    id: "clx00000000000000000000s2",
    name: "UD. Murah Jaya",
    nib: "2345678901234",
  },
  {
    id: "clx00000000000000000000s3",
    name: "Tani Segar Farm",
    nib: "3456789012345",
  },
];

const MOCK_ITEMS_BY_SUPPLIER: Record<string, SupplierItem[]> = {
  clx00000000000000000000s1: [
    { id: "mock-i1", name: "Beras Premium", unit: "kg", basePrice: 11500 },
    { id: "mock-i2", name: "Ayam Potong", unit: "kg", basePrice: 34000 },
    { id: "mock-i3", name: "Sayur Bayam", unit: "kg", basePrice: 7500 },
  ],
  clx00000000000000000000s2: [
    { id: "mock-i4", name: "Beras Premium", unit: "kg", basePrice: 11500 },
    { id: "mock-i5", name: "Ayam Potong", unit: "kg", basePrice: 33000 },
    { id: "mock-i6", name: "Telur Ayam", unit: "kg", basePrice: 28000 },
  ],
  clx00000000000000000000s3: [
    { id: "mock-i7", name: "Beras Premium", unit: "kg", basePrice: 15000 },
    { id: "mock-i8", name: "Sayur Kangkung", unit: "kg", basePrice: 6000 },
    { id: "mock-i9", name: "Wortel", unit: "kg", basePrice: 10000 },
  ],
};

export function SupplierCreateOrderModal({
  isOpen,
  onClose,
  onCreated,
}: SupplierCreateOrderModalProps) {
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [items, setItems] = useState<OrderItemForm[]>([]);
  const [notes, setNotes] = useState("");

  const supplierItems = MOCK_ITEMS_BY_SUPPLIER[selectedSupplierId] || [];

  const handleAddItem = () => {
    if (supplierItems.length > 0) {
      setItems([
        ...items,
        {
          itemId: supplierItems[0].id,
          quantity: 1,
          unitPrice: supplierItems[0].basePrice,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItemForm,
    value: string | number,
  ) => {
    const updated = [...items];
    if (field === "itemId") {
      const item = supplierItems.find((i) => i.id === value);
      updated[index] = {
        ...updated[index],
        itemId: value as string,
        unitPrice: item?.basePrice || 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setItems(updated);
  };

  const handleSubmit = () => {
    if (!selectedSupplierId || items.length === 0) return;

    const selectedSupplier = MOCK_SUPPLIERS.find(
      (s) => s.id === selectedSupplierId,
    );

    const newOrder = {
      id: `mock-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "PENDING",
      total: items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      ),
      supplier: selectedSupplier
        ? {
            id: selectedSupplier.id,
            name: selectedSupplier.name,
            nib: selectedSupplier.nib,
          }
        : { id: selectedSupplierId, name: "Unknown Supplier", nib: "" },
      items: items.map((item, idx) => {
        const si = supplierItems.find((s) => s.id === item.itemId);
        return {
          id: `mock-item-${Date.now()}-${idx}`,
          name: si?.name || "Unknown Item",
          quantity: item.quantity,
          unit: si?.unit || "pcs",
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        };
      }),
      sppg: { id: "clx0000000000000000000001", name: "SPPG Purwakarta" },
      mou: null,
    };

    onCreated(newOrder);
    handleClose();
  };

  const handleClose = () => {
    setSelectedSupplierId("");
    setItems([]);
    setNotes("");
    onClose();
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Buat Pesanan Baru
            </h2>
            <p className="text-sm text-gray-500">
              Pilih supplier dan item yang ingin dipesan
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Supplier Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier *
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Pilih Supplier</option>
              {MOCK_SUPPLIERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Item Pesanan *
              </label>
              <button
                onClick={handleAddItem}
                disabled={!selectedSupplierId}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                + Tambah Item
              </button>
            </div>

            {items.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-300 rounded-lg">
                {selectedSupplierId
                  ? 'Klik "Tambah Item" untuk menambahkan item pesanan'
                  : "Pilih supplier terlebih dahulu"}
              </p>
            )}

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <select
                    value={item.itemId}
                    onChange={(e) =>
                      handleItemChange(index, "itemId", e.target.value)
                    }
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {supplierItems.map((si) => (
                      <option key={si.id} value={si.id}>
                        {si.name} - Rp {si.basePrice.toLocaleString("id-ID")}/
                        {si.unit}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Qty"
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Tambahkan catatan pesanan..."
            />
          </div>

          {/* Total */}
          {items.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Pesanan</span>
                <span className="text-lg font-bold text-blue-700">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedSupplierId || items.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Buat Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
