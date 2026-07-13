"use client";

import { BeneficiaryClass, DistributionStatus } from "./types";
import { Building2, FileText, CheckCircle } from "lucide-react";

const STATUS_CONFIG: Record<
  DistributionStatus,
  { label: string; className: string }
> = {
  belum_sync: {
    label: "Menunggu Absensi",
    className: "bg-gray-100 text-gray-600",
  },
  menunggu: {
    label: "Menunggu Pengiriman",
    className: "bg-yellow-100 text-yellow-700",
  },
  sedang_dikirim: {
    label: "Sedang Dikirim",
    className: "bg-yellow-100 text-yellow-700",
  },
  terkirim: {
    label: "Terkirim / Selesai",
    className: "bg-green-100 text-green-700",
  },
};

function StatusBadge({ status }: { status: DistributionStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function AttendanceBar({
  present,
  total,
}: {
  present: number;
  total: number;
}) {
  const pct = total > 0 ? (present / total) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
      <div
        className="bg-green-500 h-1.5 rounded-full transition-all"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

interface BeneficiaryRowProps {
  row: BeneficiaryClass;
  onAction: (row: BeneficiaryClass) => void;
}

export function BeneficiaryRow({ row, onAction }: BeneficiaryRowProps) {
  const isSynced = row.presentToday !== null;
  const hasError = row.sickCount > 0 || row.absentCount > 0;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Sekolah & Kelas */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              row.distributionStatus === "terkirim"
                ? "bg-yellow-100"
                : "bg-blue-100"
            }`}
          >
            <Building2
              className={`w-5 h-5 ${
                row.distributionStatus === "terkirim"
                  ? "text-yellow-600"
                  : "text-blue-600"
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {row.schoolName}
            </p>
            <p className="text-xs text-gray-500">
              {row.className} (Wali: {row.teacherName})
            </p>
          </div>
        </div>
      </td>

      {/* Total Terdaftar */}
      <td className="px-4 py-4">
        <p className="text-sm font-medium text-gray-900">
          {row.totalRegistered} <span className="text-gray-500">Siswa</span>
        </p>
      </td>

      {/* Status Kehadiran Hari Ini */}
      <td className="px-4 py-4">
        {isSynced ? (
          <div className="min-w-[140px]">
            <p className="text-sm font-medium text-gray-900">
              {row.presentToday} Hadir
              {hasError && (
                <span className="text-orange-500 ml-1">
                  ({row.sickCount > 0 ? `${row.sickCount} Sakit` : ""}
                  {row.sickCount > 0 && row.absentCount > 0 ? ", " : ""}
                  {row.absentCount > 0 ? `${row.absentCount} Alpha` : ""})
                </span>
              )}
            </p>
            <AttendanceBar present={row.presentToday} total={row.totalRegistered} />
          </div>
        ) : (
          <div className="min-w-[140px]">
            <p className="text-sm text-gray-400">Belum disinkronisasi</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
              <div className="bg-gray-300 h-1.5 rounded-full w-0" />
            </div>
          </div>
        )}
      </td>

      {/* Target Porsi Riil */}
      <td className="px-4 py-4">
        {row.targetPortions !== null ? (
          <p className="text-sm font-semibold text-gray-900">
            {row.targetPortions} <span className="text-gray-500 font-normal">Porsi</span>
          </p>
        ) : (
          <p className="text-sm text-gray-400">-</p>
        )}
      </td>

      {/* Status Distribusi */}
      <td className="px-4 py-4">
        <StatusBadge status={row.distributionStatus} />
      </td>

      {/* Aksi */}
      <td className="px-4 py-4">
        {row.distributionStatus === "terkirim" ? (
          <button
            onClick={() => onAction(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Lihat Log
          </button>
        ) : (
          <button
            onClick={() => onAction(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Log Terima
          </button>
        )}
      </td>
    </tr>
  );
}
