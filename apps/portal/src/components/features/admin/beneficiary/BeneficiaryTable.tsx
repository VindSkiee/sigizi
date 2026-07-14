"use client";

import { Building2, Mail, Phone } from "lucide-react";
import type { Beneficiary, InstitutionType } from "./types";

const INSTITUTION_TYPE_CONFIG: Record<
  InstitutionType,
  { label: string; className: string }
> = {
  SEKOLAH: { label: "Sekolah", className: "bg-blue-100 text-blue-700" },
  PONDOK: { label: "Pondok Pesantren", className: "bg-purple-100 text-purple-700" },
  PANTI: { label: "Panti Asuhan", className: "bg-orange-100 text-orange-700" },
  Pesantren: { label: "Pesantren", className: "bg-indigo-100 text-indigo-700" },
  "Lembaga Kesejahteraan Sosial": {
    label: "LKS",
    className: "bg-teal-100 text-teal-700",
  },
};

function InstitutionTypeBadge({ type }: { type: InstitutionType }) {
  const config = INSTITUTION_TYPE_CONFIG[type] || {
    label: type,
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

interface BeneficiaryTableProps {
  beneficiaries: Beneficiary[];
}

export function BeneficiaryTable({ beneficiaries }: BeneficiaryTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Lembaga
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Tipe
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Penerima
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Kontak
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Alamat
              </th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Building2 className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-gray-400 text-sm">
                      Tidak ada data ditemukan
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              beneficiaries.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Lembaga */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {b.name}
                        </p>
                        <p className="text-xs text-gray-500">{b.institution}</p>
                      </div>
                    </div>
                  </td>

                  {/* Tipe */}
                  <td className="px-4 py-4">
                    <InstitutionTypeBadge type={b.institutionType} />
                  </td>

                  {/* Total Penerima */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {b.totalBeneficiary.toLocaleString("id-ID")}{" "}
                      <span className="text-gray-500 font-normal">Orang</span>
                    </p>
                  </td>

                  {/* Kontak */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {b.contactPhone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {b.contactPhone}
                        </div>
                      )}
                      {b.contactEmail && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {b.contactEmail}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Alamat */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-gray-600 max-w-[200px] truncate">
                      {b.address || "-"}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
