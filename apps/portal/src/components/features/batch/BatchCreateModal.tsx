'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Search, Calendar, Clock, Hash } from 'lucide-react';
import type { BatchManagement, BatchMenuItem, BeneficiaryOption } from './types';

interface BatchCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (batch: Omit<BatchManagement, 'id' | 'batchNumber' | 'createdAt'>) => void;
  beneficiaries: BeneficiaryOption[];
}

export function BatchCreateModal({
  isOpen,
  onClose,
  onSubmit,
  beneficiaries,
}: BatchCreateModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryOption | null>(null);
  const [totalPorsi, setTotalPorsi] = useState<number>(0);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryTimeStart, setDeliveryTimeStart] = useState('04:00');
  const [deliveryTimeEnd, setDeliveryTimeEnd] = useState('06:30');
  const [cycle, setCycle] = useState('SIKLUS B');
  const [menus, setMenus] = useState<BatchMenuItem[]>([
    { name: 'Nasi Putih', weight: '150g' },
  ]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedBeneficiary(null);
      setTotalPorsi(0);
      setDeliveryDate(new Date().toISOString().split('T')[0]);
      setDeliveryTimeStart('04:00');
      setDeliveryTimeEnd('06:30');
      setCycle('SIKLUS B');
      setMenus([{ name: 'Nasi Putih', weight: '150g' }]);
      setShowDropdown(false);
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

  const handleSelectBeneficiary = (b: BeneficiaryOption) => {
    setSelectedBeneficiary(b);
    setSearchQuery(b.name);
    setTotalPorsi(b.portions);
    setShowDropdown(false);
  };

  const handleAddMenu = () => {
    setMenus((prev) => [...prev, { name: '', weight: '' }]);
  };

  const handleRemoveMenu = (index: number) => {
    setMenus((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMenuChange = (index: number, field: keyof BatchMenuItem, value: string) => {
    setMenus((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = () => {
    if (!selectedBeneficiary || !deliveryDate || !deliveryTimeStart || !deliveryTimeEnd || totalPorsi <= 0) {
      return;
    }

    onSubmit({
      status: 'ACTIVE',
      beneficiaryId: selectedBeneficiary.id,
      beneficiaryName: selectedBeneficiary.name,
      beneficiaryPortions: totalPorsi,
      deliveryDate,
      deliveryTimeStart,
      deliveryTimeEnd,
      cycle,
      menus: menus.filter((m) => m.name.trim() !== ''),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Hide browser default picker icons */}
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
          {/* Target Distribusi */}
          <div ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Distribusi *
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
                  if (selectedBeneficiary) {
                    setSelectedBeneficiary(null);
                    setTotalPorsi(0);
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white relative z-0"
              />
              {showDropdown && filteredBeneficiaries.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredBeneficiaries.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBeneficiary(b)}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-700">{b.name}</span>
                      <span className="text-gray-500">{b.portions} Porsi</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
            {selectedBeneficiary && (
              <p className="text-xs text-gray-500 mt-1">
                Default: {selectedBeneficiary.portions} porsi (sesuai data sekolah)
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

          {/* Menu Makanan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Makanan *
            </label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2.5">
                      Nama Menu
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2.5 w-32">
                      Berat/Satuan
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {menus.map((menu, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={menu.name}
                          onChange={(e) => handleMenuChange(index, 'name', e.target.value)}
                          placeholder="Contoh: Nasi Putih, Ayam Teriyaki"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={menu.weight}
                          onChange={(e) => handleMenuChange(index, 'weight', e.target.value)}
                          placeholder="150g, 200ml, 1 pcs"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        {menus.length > 1 && (
                          <button
                            onClick={() => handleRemoveMenu(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleAddMenu}
              className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Menu
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedBeneficiary || totalPorsi <= 0}
            className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buat Batch
          </button>
        </div>
      </div>
    </div>
  );
}
