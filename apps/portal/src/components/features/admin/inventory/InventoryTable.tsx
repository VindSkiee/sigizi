'use client';

import { Package, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { InventoryStock, StockHistoryData } from './types';

interface InventoryTableProps {
  stocks: InventoryStock[];
  onAdjust: (stock: InventoryStock) => void;
  onViewHistory: (data: StockHistoryData) => void;
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function getStockStatus(remainingQty: number, initialQty: number) {
  const ratio = initialQty > 0 ? remainingQty / initialQty : 0;
  if (ratio <= 0.2) return { label: 'Kritis', className: 'bg-red-100 text-red-700' };
  if (ratio <= 0.5) return { label: 'Menipis', className: 'bg-orange-100 text-orange-700' };
  return { label: 'Aman', className: 'bg-green-100 text-green-700' };
}

function getSourceLabel(source: string): { label: string; className: string } {
  switch (source) {
    case 'SYSTEM_ORDER':
      return { label: 'Order', className: 'bg-blue-100 text-blue-700' };
    case 'MANUAL_ADJUSTMENT':
      return { label: 'Manual', className: 'bg-purple-100 text-purple-700' };
    case 'BATCH_RETURN':
      return { label: 'Retur', className: 'bg-yellow-100 text-yellow-700' };
    default:
      return { label: source, className: 'bg-gray-100 text-gray-700' };
  }
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
                Sumber
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
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Tidak ada data inventaris</p>
                </td>
              </tr>
            ) : (
              stocks.map((stock) => {
                const stockStatus = getStockStatus(stock.remainingQty, stock.initialQty);
                const sourceInfo = getSourceLabel(stock.source);
                const nilai = stock.remainingQty * stock.purchasePrice;
                return (
                  <tr key={stock.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{stock.item.name}</p>
                        <p className="text-xs text-gray-500">oleh {stock.createdBy.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sourceInfo.className}`}>
                        {sourceInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {stock.remainingQty} / {stock.initialQty} {stock.item.unit}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              stock.remainingQty / stock.initialQty <= 0.2
                                ? 'bg-red-500'
                                : stock.remainingQty / stock.initialQty <= 0.5
                                ? 'bg-orange-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min((stock.remainingQty / stock.initialQty) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {formatCurrency(stock.purchasePrice)}/{stock.item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(nilai)}
                      </span>
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
                          Edit
                        </button>
                        <button
                          onClick={() => onViewHistory({ stock, adjustments: stock.adjustments })}
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
