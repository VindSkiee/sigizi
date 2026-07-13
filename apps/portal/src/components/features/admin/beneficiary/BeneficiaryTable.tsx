"use client";

import { BeneficiaryClass } from "./types";
import { BeneficiaryRow } from "./BeneficiaryRow";

interface BeneficiaryTableProps {
  rows: BeneficiaryClass[];
  onAction: (row: BeneficiaryClass) => void;
}

export function BeneficiaryTable({ rows, onAction }: BeneficiaryTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Sekolah &amp; Kelas Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Terdaftar
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status Kehadiran Hari Ini
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Target Porsi Riil
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status Distribusi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="text-gray-400 text-sm">
                    Tidak ada data ditemukan untuk pencarian ini
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <BeneficiaryRow key={row.id} row={row} onAction={onAction} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
