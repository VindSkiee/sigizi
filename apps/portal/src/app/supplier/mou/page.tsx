"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMoUs } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import "@aejkatappaja/phantom-ui";

import "@aejkatappaja/phantom-ui";

interface MoU {
  id: string;
  mouNumber: string;
  supplierName: string;
  sppgName: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";
  items?: { name: string; agreedPrice: number }[];
}

const statusConfig = {
  DRAFT: { label: "Draf", variant: "default" as const },
  ACTIVE: { label: "Aktif", variant: "success" as const },
  EXPIRED: { label: "Berakhir", variant: "danger" as const },
  TERMINATED: { label: "Ditutup", variant: "danger" as const },
};

export default function MoUPage() {
  const { token } = useAuth();
  const [contracts, setContracts] = useState<MoU[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function fetchMoUs() {
      try {
        const response = await getMoUs(token!);
        if (response.success) {
          setContracts((response.data as any)?.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch MoUs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMoUs();
  }, [token]);

  return (
    <phantom-ui loading={loading}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">MoU Aktif</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola perjanjian kerja sama dengan SPPG
          </p>
        </div>

        {contracts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 shadow-sm text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada MoU</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">
                        {contract.mouNumber || contract.id}
                      </span>
                      <Badge
                        variant={
                          statusConfig[contract.status]?.variant || "default"
                        }
                      >
                        {statusConfig[contract.status]?.label ||
                          contract.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mt-2">
                      {contract.supplierName || "Supplier"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      SPPG: {contract.sppgName || "-"}
                    </p>
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>
                        Mulai:{" "}
                        {contract.startDate
                          ? new Date(contract.startDate).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </span>
                      <span>
                        Selesai:{" "}
                        {contract.endDate
                          ? new Date(contract.endDate).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </span>
                    </div>
                    {contract.items && contract.items.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {contract.items.map((item, idx) => (
                          <p key={idx} className="text-xs text-gray-500">
                            {item.name} - Rp{" "}
                            {item.agreedPrice.toLocaleString("id-ID")}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  {contract.status === "DRAFT" && (
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Konfirmasi
                      </button>
                      <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </phantom-ui>
  );
}
