'use client';

import { Eye } from 'lucide-react';
import type { ComplaintAdmin } from './types';
import { COMPLAINT_STATUS_CONFIG } from './types';

interface ComplaintTableProps {
  complaints: ComplaintAdmin[];
  onViewDetail: (complaint: ComplaintAdmin) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ComplaintTable({ complaints, onViewDetail }: ComplaintTableProps) {
  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <svg
          className="w-12 h-12 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-500 text-sm">Tidak ada komplain ditemukan</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Kode Laporan
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Batch
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              SPPG
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Deskripsi
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Tanggal
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => {
            const statusConfig = COMPLAINT_STATUS_CONFIG[complaint.status];
            return (
              <tr
                key={complaint.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* Kode Laporan */}
                <td className="px-4 py-4">
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    {complaint.reportKey}
                  </span>
                </td>

                {/* Batch */}
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-700">
                    {complaint.batch?.batchNumber || '-'}
                  </span>
                </td>

                {/* SPPG */}
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-700">
                    {complaint.batch?.sppg?.name || '-'}
                  </span>
                </td>

                {/* Deskripsi */}
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-700 max-w-[200px] truncate">
                    {complaint.description}
                  </p>
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </td>

                {/* Tanggal */}
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm text-gray-700">{formatDate(complaint.createdAt)}</p>
                    <p className="text-xs text-gray-400">{formatTime(complaint.createdAt)}</p>
                  </div>
                </td>

                {/* Aksi */}
                <td className="px-4 py-4">
                  <button
                    onClick={() => onViewDetail(complaint)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Detail
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
