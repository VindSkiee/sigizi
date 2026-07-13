"use client";

import { BeneficiaryStats } from "./types";
import { RefreshCw, Leaf } from "lucide-react";

interface BeneficiaryStatsCardsProps {
  stats: BeneficiaryStats;
}

export function BeneficiaryStatsCards({ stats }: BeneficiaryStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Siswa Terdaftar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Total Siswa Terdaftar
        </p>
        <p className="text-3xl font-bold text-gray-900">
          {stats.totalRegistered.toLocaleString("id-ID")}
          <span className="text-sm font-normal text-gray-500 ml-1">Siswa</span>
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Dari {stats.totalSchools} Sekolah Target
        </p>
      </div>

      {/* Siswa Hadir Hari Ini */}
      <div className="bg-blue-900 rounded-xl p-5 text-white">
        <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-1">
          Siswa Hadir Hari Ini
        </p>
        <p className="text-3xl font-bold">
          {stats.presentToday.toLocaleString("id-ID")}
          <span className="text-sm font-normal text-blue-200 ml-1">
            Porsi Masak
          </span>
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <RefreshCw className="w-3 h-3 text-blue-300" />
          <p className="text-xs text-blue-200">
            Data tersinkron otomatis pukul 07:00 WIB
          </p>
        </div>
      </div>

      {/* Absen / Sakit / Izin */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Absen / Sakit / Izin
        </p>
        <p className="text-3xl font-bold text-orange-500">
          {stats.absentToday.toLocaleString("id-ID")}
          <span className="text-sm font-normal text-gray-500 ml-1">
            Siswa
          </span>
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <Leaf className="w-3 h-3 text-green-500" />
          <p className="text-xs text-green-600">
            Menghemat {stats.absentToday} porsi masakan hari ini
          </p>
        </div>
      </div>
    </div>
  );
}
