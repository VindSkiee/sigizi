'use client';

import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import type { ComplaintAdmin } from './types';

interface ComplaintResolveModalProps {
  complaint: ComplaintAdmin | null;
  onClose: () => void;
  onResolve: (id: string, notes: string) => Promise<void>;
}

export function ComplaintResolveModal({
  complaint,
  onClose,
  onResolve,
}: ComplaintResolveModalProps) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (complaint) {
      setNotes('');
      setError('');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [complaint]);

  const handleResolve = async () => {
    if (!notes.trim()) {
      setError('Catatan wajib diisi.');
      return;
    }
    if (!complaint) return;

    setLoading(true);
    try {
      await onResolve(complaint.id, notes.trim());
      onClose();
    } catch (err) {
      setError('Gagal menyelesaikan komplain. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Selesaikan Laporan
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Complaint Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">
              Kode Laporan: <span className="font-mono font-semibold text-gray-700">{complaint.reportKey}</span>
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Catatan Penyelesaian <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError('');
              }}
              rows={4}
              placeholder="Tuliskan catatan penyelesaian komplain..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleResolve}
            disabled={loading || !notes.trim()}
            className="px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menyimpan...' : 'Selesaikan'}
          </button>
        </div>
      </div>
    </div>
  );
}
