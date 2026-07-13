'use client';

import { Package, AlertTriangle, Clock } from 'lucide-react';
import type { InventoryStock } from './types';

interface InventoryTableProps {
  stocks: InventoryStock[];
  onAdjust: (stock: InventoryStock) => void;
  onViewHistory: (stock: InventoryStock) => void;
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStockStatus(currentQty: number, initialQty: number) {
  const ratio = initialQty > 0 ? currentQty / initialQty : 0;
  if (ratio <= 0.2) return { label: 'Kritis', className: 'bg-red-100 text-red-700' };
  if (ratio <= 0.5) return { label: 'Menipis', className: 'bg-orange-100 text-orange-700' };
  return { label: 'Aman', className: 'bg-green-100 text-green-700' };
}

function isExpiringSoon(dateStr?: string): boolean {
  if (!dateStr) return false;
  const expDate = new Date(dateStr);
  const now = new Date();
  const diffDays = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7 && diffDays > 0;
}

function isExpired(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function InventoryTable({ stocks, onAdjust, onViewHistory }: InventoryTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Item
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Batch
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Stok
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Harga Beli
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Nilai
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Kedaluarsa
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Tidak ada data inventaris</p>
                </td>
              </tr>
            ) : (
              stocks.map((stock) => {
                const stockStatus = getStockStatus(stock.currentQty, stock.initialQty);
                const expiring = isExpiringSoon(stock.expiredAt);
                const expired = isExpired(stock.expiredAt);
                return (
                  <tr key={stock.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{stock.itemName}</p>
                        <p className="text-xs text-gray-500">{stock.supplierName || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-600">
                        {stock.batchNumber || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {stock.currentQty} / {stock.initialQty} {stock.itemUnit}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              stock.currentQty / stock.initialQty <= 0.2
                                ? 'bg-red-500'
                                : stock.currentQty / stock.initialQty <= 0.5
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min((stock.currentQty / stock.initialQty) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {formatCurrency(stock.purchasePrice)}/{stock.itemUnit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(stock.currentQty * stock.purchasePrice)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {expired ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          Kadaluarsa
                        </span>
                      ) : expiring ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600">
                          <Clock className="w-3 h-3" />
                          {formatDate(stock.expiredAt)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {formatDate(stock.expiredAt)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.className}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAdjust(stock)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => onViewHistory(stock)}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Histori
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
