'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getInventoryStocks,
  getInventoryValuation,
  getInventoryAlerts,
  getInventoryBalance,
  createManualStock,
  adjustStock,
} from '@/lib/api';
import { InventoryStatsCards } from '@/components/features/admin/inventory/InventoryStatsCards';
import { InventoryTable } from '@/components/features/admin/inventory/InventoryTable';
import { ManualStockModal } from '@/components/features/admin/inventory/ManualStockModal';
import { AdjustStockModal } from '@/components/features/admin/inventory/AdjustStockModal';
import { HistoryModal } from '@/components/features/admin/inventory/HistoryModal';
import type {
  InventoryStock,
  InventoryValuation,
  InventoryAlertItem,
  InventoryBalanceItem,
  StockHistoryData,
} from '@/components/features/admin/inventory/types';
import { Plus, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const { token } = useAuth();
  const [stocks, setStocks] = useState<InventoryStock[]>([]);
  const [valuation, setValuation] = useState<InventoryValuation | null>(null);
  const [balance, setBalance] = useState<InventoryBalanceItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManualModal, setShowManualModal] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<InventoryStock | null>(null);
  const [historyTarget, setHistoryTarget] = useState<StockHistoryData | null>(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    try {
      const [stocksRes, valuationRes, alertsRes, balanceRes] = await Promise.all([
        getInventoryStocks(token),
        getInventoryValuation(token),
        getInventoryAlerts(token),
        getInventoryBalance(token),
      ]);

      if (stocksRes.success) {
        const data = stocksRes.data as any;
        const items = data?.items || data || [];
        setStocks(Array.isArray(items) ? items.filter((s: any) => s.remainingQty > 0) : []);
      }

      if (valuationRes.success) {
        setValuation(valuationRes.data as InventoryValuation);
      }

      if (alertsRes.success) {
        const data = alertsRes.data as any;
        setAlerts(Array.isArray(data) ? data : []);
      }

      if (balanceRes.success) {
        const data = balanceRes.data as any;
        setBalance(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleManualStock = async (data: {
    itemName: string;
    unit?: string;
    purchasePrice: number;
    quantity: number;
    notes?: string;
  }) => {
    if (!token) return;
    try {
      await createManualStock(token, data);
      await fetchAll();
    } catch (err) {
      console.error('Failed to create manual stock:', err);
      alert('Gagal menambah stok');
    }
  };

  const handleAdjustStock = async (
    stockId: string,
    data: { adjustmentQty: number; reason: string; description?: string }
  ) => {
    if (!token) return;
    try {
      await adjustStock(token, stockId, data);
      await fetchAll();
    } catch (err) {
      console.error('Failed to adjust stock:', err);
      alert('Gagal adjust stok');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaris Bahan Baku</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau stok bahan baku, nilai inventaris, dan item yang perlu restock.
          </p>
        </div>
        <button
          onClick={() => setShowManualModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Stok Manual
        </button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-semibold text-orange-800">Peringatan Stok Rendah</h3>
          </div>
          <div className="space-y-1">
            {alerts.slice(0, 5).map((alert) => (
              <p key={alert.item.id} className="text-xs text-orange-700">
                • {alert.item.name}: {alert.totalRemaining} {alert.item.unit} tersisa (threshold: {alert.threshold} {alert.item.unit})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <InventoryStatsCards valuation={valuation} lowStockCount={alerts.length} />

      {/* Table */}
      <InventoryTable
        stocks={stocks}
        onAdjust={setAdjustTarget}
        onViewHistory={setHistoryTarget}
      />

      {/* Modals */}
      <ManualStockModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onConfirm={handleManualStock}
      />

      <AdjustStockModal
        isOpen={!!adjustTarget}
        stock={adjustTarget}
        onClose={() => setAdjustTarget(null)}
        onConfirm={handleAdjustStock}
      />

      <HistoryModal
        isOpen={!!historyTarget}
        data={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />
    </div>
  );
}
