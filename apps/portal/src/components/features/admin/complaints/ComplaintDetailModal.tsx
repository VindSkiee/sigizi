'use client';

import { useState } from 'react';
import { X, Calendar, FileText, Image, StickyNote } from 'lucide-react';
import type { ComplaintAdmin } from './types';
import { COMPLAINT_STATUS_CONFIG } from './types';

interface ComplaintDetailModalProps {
  complaint: ComplaintAdmin | null;
  onClose: () => void;
  onMarkReviewed: (id: string) => void;
  onOpenResolve: (complaint: ComplaintAdmin) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ComplaintDetailModal({
  complaint,
  onClose,
  onMarkReviewed,
  onOpenResolve,
}: ComplaintDetailModalProps) {
  const [showImageModal, setShowImageModal] = useState(false);

  if (!complaint) return null;

  const statusConfig = COMPLAINT_STATUS_CONFIG[complaint.status];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-800 font-mono">
                  {complaint.reportKey}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Info Batch */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Info Batch
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Nomor Batch</p>
                  <p className="font-medium text-gray-800">
                    {complaint.batch?.batchNumber || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">SPPG</p>
                  <p className="font-medium text-gray-800">
                    {complaint.batch?.sppg?.name || '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Menu</p>
                  <p className="font-medium text-gray-800">
                    {complaint.batch?.menu || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {/* Bukti Foto */}
            {complaint.evidence && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-4 h-4 text-gray-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Bukti Foto
                  </p>
                </div>
                <button
                  onClick={() => setShowImageModal(true)}
                  className="block rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors"
                >
                  <img
                    src={complaint.evidence}
                    alt="Bukti komplain"
                    className="w-full max-h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </button>
              </div>
            )}

            {/* Notes */}
            {complaint.notes && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote className="w-4 h-4 text-gray-500" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Catatan Penyelesaian
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-800">{complaint.notes}</p>
                </div>
              </div>
            )}

            {/* Tanggal */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Dibuat: {formatDate(complaint.createdAt)}</span>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="p-6 pt-0 border-t border-gray-100">
            <div className="flex items-center gap-2 mt-4">
              {complaint.status === 'PENDING' && (
                <button
                  onClick={() => onMarkReviewed(complaint.id)}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Tinjau
                </button>
              )}
              {complaint.status === 'REVIEWED' && (
                <button
                  onClick={() => onOpenResolve(complaint)}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Selesaikan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal (Full Size) */}
      {showImageModal && complaint.evidence && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowImageModal(false)} />
          <div className="relative max-w-3xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={complaint.evidence}
              alt="Bukti komplain (full size)"
              className="max-w-full max-h-[85vh] rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
