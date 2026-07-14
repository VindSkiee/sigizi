"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBeneficiaries } from "@/lib/api";
import { BeneficiaryStatsCards } from "@/components/features/admin/beneficiary/BeneficiaryStatsCards";
import { BeneficiarySearchBar } from "@/components/features/admin/beneficiary/BeneficiarySearchBar";
import { BeneficiaryTable } from "@/components/features/admin/beneficiary/BeneficiaryTable";
import type { Beneficiary, BeneficiaryStats } from "@/components/features/admin/beneficiary/types";

export default function BeneficiariesPage() {
  const { token } = useAuth();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBeneficiaries = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getBeneficiaries(token, { limit: 100 });
      if (response.success) {
        const data = response.data as any;
        const items = data?.items || data || [];
        setBeneficiaries(Array.isArray(items) ? items : []);
      }
    } catch (err) {
      console.error("Failed to fetch beneficiaries:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  const filteredBeneficiaries = useMemo(() => {
    if (!search.trim()) return beneficiaries;
    const q = search.toLowerCase();
    return beneficiaries.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.institution.toLowerCase().includes(q) ||
        (b.address && b.address.toLowerCase().includes(q))
    );
  }, [beneficiaries, search]);

  const stats = useMemo<BeneficiaryStats>(() => {
    const uniqueInstitutions = new Set(beneficiaries.map((b) => b.institution));
    const totalBeneficiaries = beneficiaries.reduce(
      (sum, b) => sum + (b.totalBeneficiary || 0),
      0
    );
    return {
      totalBeneficiaries,
      totalInstitutions: uniqueInstitutions.size,
      totalPortions: totalBeneficiaries,
    };
  }, [beneficiaries]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Data Penerima Manfaat
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar lembaga dan jumlah penerima manfaat program makan bergizi.
        </p>
      </div>

      {/* Stats */}
      <BeneficiaryStatsCards stats={stats} />

      {/* Search */}
      <BeneficiarySearchBar search={search} onSearchChange={setSearch} />

      {/* Table */}
      <BeneficiaryTable beneficiaries={filteredBeneficiaries} />
    </div>
  );
}
