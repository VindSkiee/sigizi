'use client';

import { useState } from 'react';
import { X, Clock, School, DollarSign, Package, AlertTriangle, CheckCircle, XCircle, QrCode, Hash } from 'lucide-react';
import { BatchStatusBadge } from './BatchStatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { BatchManagement } from './types';

interface BatchDetailModalProps {
  batch: BatchManagement | null;
  onClose: () => void;
  onComplete: (batchId: string) => void;
  onCancel: (batchId: string) => void;
  onFail?: (batchId: string) => void;
  onPrintQR: (batch: BatchManagement) => void;
}

function formatTimeRange(start: string, end: string): string {
  return `${start} - ${end} WIB`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return 'Hari ini';
  }

  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function BatchDetailModal({
  batch,
  onClose,
  onComplete,
  onCancel,
  onFail,
  onPrintQR,
}: BatchDetailModalProps) {
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">{batch.batchNumber}</h2>
              <BatchStatusBadge status={batch.status} />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Report Key */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Hash className="w-4 h-4" />
            <span>Report Key: <span className="font-mono font-semibold text-gray-700">{batch.reportKey}</span></span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              {formatDate(batch.deliveryDate)},{' '}
              {formatTimeRange(batch.deliveryTimeStart, batch.deliveryTimeEnd)}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Target Distribusi */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Target Distribusi
            </p>
            <div className="flex items-start gap-2">
              <School className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                {batch.beneficiaryNames && batch.beneficiaryNames.length > 0 ? (
                  <div className="space-y-0.5">
                    {batch.beneficiaryNames.map((name, idx) => (
                      <p key={idx} className="text-sm font-semibold text-gray-800">{name}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-gray-800">-</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">{batch.beneficiaryPortions || batch.beneficiaryCount || 0} Porsi</p>
              </div>
            </div>
          </div>

          {/* Nama Menu */}
          {batch.menu && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Nama Menu
              </p>
              <p className="text-sm font-semibold text-gray-800">{batch.menu}</p>
            </div>
          )}

          {/* Allergen */}
          {batch.allergens && batch.allergens.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Allergen
              </p>
              <div className="flex flex-wrap gap-1.5">
                {batch.allergens.map((a, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full border border-red-200"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bahan Baku */}
          {batch.batchItems && batch.batchItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Bahan Baku
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-1.5">
                  {batch.batchItems.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>{item.name}</span>
                      </span>
                      <span className="text-gray-500">
                        {item.quantity} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Anggaran */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Anggaran
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Standar/Porsi</p>
                <p className="font-medium text-gray-800">{formatCurrency(batch.costPerPortionStandard)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Budget</p>
                <p className="font-medium text-gray-800">{formatCurrency(batch.totalBudget)}</p>
              </div>
              {batch.totalCost !== undefined && batch.totalCost > 0 && (
                <>
                  <div>
                    <p className="text-gray-500">Total Biaya</p>
                    <p className="font-medium text-gray-800">{formatCurrency(batch.totalCost)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Variance</p>
                    <p className={`font-medium ${(batch.budgetVariance || 0) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(batch.budgetVariance || 0))}
                      {(batch.budgetVariance || 0) <= 0 ? ' (Under)' : ' (Over)'}
                    </p>
                  </div>
                </>
              )}
              {batch.costPerPortion !== undefined && batch.costPerPortion > 0 && (
                <div className="col-span-2">
                  <p className="text-gray-500">Biaya/Porsi (Aktual)</p>
                  <p className="font-medium text-gray-800">{formatCurrency(batch.costPerPortion)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Failed Info */}
          {batch.status === 'FAILED' && batch.failedReason && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">
                Alasan Kegagalan
              </p>
              <p className="text-sm text-red-600">{batch.failedReason}</p>
              {batch.failedEvidence && (
                batch.failedEvidence.startsWith('data:image/') ? (
                  <button
                    onClick={() => setShowEvidence(true)}
                    className="mt-2 inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Lihat Bukti
                  </button>
                ) : (
                  <a
                    href={batch.failedEvidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Lihat Bukti
                  </a>
                )
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-6 pt-0 border-t border-gray-100">
          <div className="flex items-center gap-2 mt-4">
            {batch.status === 'ACTIVE' && (
              <>
                <button
                  onClick={() => setConfirmComplete(true)}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Selesai
                </button>
                <button
                  onClick={() => onCancel(batch.id)}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Batal
                </button>
                {onFail && (
                  <button
                    onClick={() => onFail(batch.id)}
                    className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Gagal
                  </button>
                )}
              </>
            )}
            {batch.status === 'COMPLETED' && (
              <button
                onClick={() => onPrintQR(batch)}
                className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                Cetak QR Porsi
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmComplete}
        title="Tandai Selesai"
        message={`Apakah Anda yakin ingin menandai batch ${batch.batchNumber} sebagai selesai? Tindakan ini tidak dapat dibatalkan.`}
        variant="success"
        confirmLabel="Ya, Tandai Selesai"
        onConfirm={() => {
          setConfirmComplete(false);
          onComplete(batch.id);
        }}
        onClose={() => setConfirmComplete(false)}
      />

      {showEvidence && batch.failedEvidence && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowEvidence(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">Bukti Kegagalan</p>
              <button
                onClick={() => setShowEvidence(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <img
                src={batch.failedEvidence}
                alt="Bukti kegagalan"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
