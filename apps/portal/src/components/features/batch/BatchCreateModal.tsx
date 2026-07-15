'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Search, Calendar, Clock, Hash, Loader2, Package, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getInventoryBalance } from '@/lib/api';
import type { BatchManagement, BatchFormItem, BeneficiaryOption, InventoryBalanceItem } from './types';

interface BatchCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (batch: Omit<BatchManagement, 'id' | 'batchNumber' | 'createdAt'>) => Promise<void>;
  beneficiaries: BeneficiaryOption[];
}

export function BatchCreateModal({
  isOpen,
  onClose,
  onSubmit,
  beneficiaries,
}: BatchCreateModalProps) {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<BeneficiaryOption[]>([]);
  const [totalPorsi, setTotalPorsi] = useState<number>(0);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryTimeStart, setDeliveryTimeStart] = useState('04:00');
  const [deliveryTimeEnd, setDeliveryTimeEnd] = useState('06:30');
  const [cycle, setCycle] = useState('SIKLUS B');
  const [menuName, setMenuName] = useState('');
  const [allergens, setAllergens] = useState<string[]>([]);
  const [customAllergen, setCustomAllergen] = useState('');
  const [batchItems, setBatchItems] = useState<BatchFormItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryBalanceItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch inventory stock when modal opens
  useEffect(() => {
    if (isOpen && token) {
      setInventoryLoading(true);
      getInventoryBalance(token)
        .then((res) => {
          if (res.success) {
            const items = (res.data as InventoryBalanceItem[]) || [];
            setInventoryItems(items.filter((i) => i.totalRemaining > 0));
          }
        })
        .catch(() => setInventoryItems([]))
        .finally(() => setInventoryLoading(false));
    }
  }, [isOpen, token]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedBeneficiaries([]);
      setTotalPorsi(0);
      setDeliveryDate(new Date().toISOString().split('T')[0]);
      setDeliveryTimeStart('04:00');
      setDeliveryTimeEnd('06:30');
      setCycle('SIKLUS B');
      setMenuName('');
      setAllergens([]);
      setCustomAllergen('');
      setBatchItems([]);
      setShowDropdown(false);
      setError(null);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const filteredBeneficiaries = beneficiaries.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleBeneficiary = (b: BeneficiaryOption) => {
    setSelectedBeneficiaries((prev) => {
      const exists = prev.find((item) => item.id === b.id);
      if (exists) {
        return prev.filter((item) => item.id !== b.id);
      }
      return [...prev, b];
    });
  };

  const handleRemoveBeneficiary = (id: string) => {
    setSelectedBeneficiaries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = (inv: InventoryBalanceItem) => {
    const exists = batchItems.find((i) => i.itemId === inv.item.id);
    if (exists) return;
    setBatchItems((prev) => [
      ...prev,
      {
        itemId: inv.item.id,
        name: inv.item.name,
        unit: inv.item.unit,
        quantity: 1,
      },
    ]);
  };

  const handleRemoveItem = (itemId: string) => {
    setBatchItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const handleItemQuantityChange = (itemId: string, qty: number) => {
    setBatchItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, quantity: Math.max(0.01, qty) } : i))
    );
  };

  const COMMON_ALLERGENS = ['Gluten', 'Kacang', 'Susu', 'Telur', 'Ikan', 'Kerang', 'Kedelai', 'Bijian', 'Seledri'];

  const handleToggleAllergen = (allergen: string) => {
    setAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const handleAddCustomAllergen = () => {
    const trimmed = customAllergen.trim();
    if (trimmed && !allergens.includes(trimmed)) {
      setAllergens((prev) => [...prev, trimmed]);
      setCustomAllergen('');
    }
  };

  const handleSubmit = async () => {
    if (selectedBeneficiaries.length === 0 || !deliveryDate || !deliveryTimeStart || !deliveryTimeEnd || totalPorsi <= 0) {
      return;
    }
    if (!menuName.trim()) {
      setError('Nama menu wajib diisi');
      return;
    }
    if (batchItems.length === 0) {
      setError('Minimal harus ada 1 item bahan baku');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        status: 'ACTIVE',
        reportKey: '',
        beneficiaryId: selectedBeneficiaries[0].id,
        beneficiaryName: selectedBeneficiaries[0].name,
        beneficiaryNames: selectedBeneficiaries.map((b) => b.name),
        beneficiaryPortions: totalPorsi,
        deliveryDate,
        deliveryTimeStart,
        deliveryTimeEnd,
        menu: menuName.trim(),
        cycle,
        allergens,
        batchItems,
        menus: [],
        costPerPortionStandard: 10000,
        totalBudget: 10000 * totalPorsi,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal membuat batch. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    selectedBeneficiaries.length > 0 && totalPorsi > 0 && deliveryDate && deliveryTimeStart && deliveryTimeEnd && menuName.trim() && batchItems.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
      `}</style>

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Buat Batch Masak Baru</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Target Distribusi */}
          <div ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Distribusi * <span className="text-gray-400 font-normal">(bisa pilih lebih dari 1)</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari sekolah..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white relative z-0"
              />
              {showDropdown && filteredBeneficiaries.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredBeneficiaries.map((b) => {
                    const isSelected = selectedBeneficiaries.some((item) => item.id === b.id);
                    return (
                      <button
                        key={b.id}
                        onClick={() => handleToggleBeneficiary(b)}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                          isSelected ? 'bg-green-50' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                          <span className="font-medium text-gray-700">{b.name}</span>
                        </span>
                        <span className="text-gray-500">{b.portions} Porsi</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Selected beneficiaries chips */}
            {selectedBeneficiaries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedBeneficiaries.map((b) => (
                  <span
                    key={b.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                  >
                    {b.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveBeneficiary(b.id)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Total Porsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Total Porsi *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
              <input
                type="number"
                min="1"
                placeholder="Masukkan total porsi"
                value={totalPorsi || ''}
                onChange={(e) => setTotalPorsi(parseInt(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white relative z-0"
              />
            </div>
            {selectedBeneficiaries.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Total dari {selectedBeneficiaries.length} penerima: {selectedBeneficiaries.reduce((sum, b) => sum + b.portions, 0)} porsi (sesuai data sekolah)
              </p>
            )}
          </div>

          {/* Tanggal & Waktu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tanggal Pengantaran *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white relative z-0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jam Mulai *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <input
                  type="time"
                  value={deliveryTimeStart}
                  onChange={(e) => setDeliveryTimeStart(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white relative z-0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Jam Selesai *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
                <input
                  type="time"
                  value={deliveryTimeEnd}
                  onChange={(e) => setDeliveryTimeEnd(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white relative z-0"
                />
              </div>
            </div>
          </div>

          {/* Siklus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Siklus Menu *
            </label>
            <select
              value={cycle}
              onChange={(e) => setCycle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="SIKLUS A">SIKLUS A</option>
              <option value="SIKLUS B">SIKLUS B</option>
              <option value="SIKLUS C">SIKLUS C</option>
            </select>
          </div>

          {/* Nama Menu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Menu *
            </label>
            <input
              type="text"
              placeholder="Contoh: Nasi Ayam Bakar + Sayur Bayam"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>

          {/* Allergen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Allergen
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_ALLERGENS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => handleToggleAllergen(a)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    allergens.includes(a)
                      ? 'bg-red-50 text-red-700 border-red-300'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {allergens.includes(a) && <AlertTriangle className="w-3.5 h-3.5" />}
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Allergen lainnya..."
                value={customAllergen}
                onChange={(e) => setCustomAllergen(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomAllergen();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomAllergen}
                disabled={!customAllergen.trim()}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {allergens.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {allergens.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => handleToggleAllergen(a)}
                      className="hover:text-red-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bahan Baku dari Inventory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bahan Baku (dari Stok Inventory) *
            </label>

            {/* Selected items */}
            {batchItems.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2.5">
                        Nama Item
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2 w-20">
                        Stok
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2 w-28">
                        Qty *
                      </th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {batchItems.map((item) => {
                      const inv = inventoryItems.find((i) => i.item.id === item.itemId);
                      return (
                        <tr key={item.itemId}>
                          <td className="px-4 py-2">
                            <p className="text-sm font-medium text-gray-700">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.unit}</p>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-xs text-gray-500">
                              {inv?.totalRemaining ?? '-'} {item.unit}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemQuantityChange(item.itemId, parseFloat(e.target.value) || 0.01)
                              }
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <button
                              onClick={() => handleRemoveItem(item.itemId)}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Available items picker */}
            {inventoryLoading ? (
              <div className="flex items-center justify-center py-6 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Memuat stok inventory...</span>
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada stok inventory tersedia</p>
                <p className="text-xs mt-1">Buat pesanan (PO) terlebih dahulu untuk mengisi stok</p>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">Klik untuk menambah item:</p>
                <div className="flex flex-wrap gap-2">
                  {inventoryItems
                    .filter((inv) => !batchItems.find((i) => i.itemId === inv.item.id))
                    .map((inv) => (
                      <button
                        key={inv.item.id}
                        onClick={() => handleAddItem(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {inv.item.name}
                        <span className="text-green-500 text-xs">({inv.totalRemaining} {inv.item.unit})</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Buat Batch'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
