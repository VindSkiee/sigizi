"use client";

import { useState, useMemo } from "react";
import { BeneficiaryClass } from "@/components/features/admin/beneficiary/types";
import { MOCK_CLASSES, MOCK_STATS } from "@/components/features/admin/beneficiary/mockData";
import { BeneficiaryStatsCards } from "@/components/features/admin/beneficiary/BeneficiaryStatsCards";
import { BeneficiarySearchBar } from "@/components/features/admin/beneficiary/BeneficiarySearchBar";
import { BeneficiaryTable } from "@/components/features/admin/beneficiary/BeneficiaryTable";

export default function BeneficiariesPage() {
  const [classes, setClasses] = useState<BeneficiaryClass[]>(MOCK_CLASSES);
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const filteredClasses = useMemo(() => {
    if (!search.trim()) return classes;
    const q = search.toLowerCase();
    return classes.filter(
      (c) =>
        c.schoolName.toLowerCase().includes(q) ||
        c.className.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q),
    );
  }, [classes, search]);

  const stats = useMemo(() => {
    const present = classes.reduce(
      (sum, c) => sum + (c.presentToday ?? 0),
      0,
    );
    const absent = classes.reduce(
      (sum, c) => sum + (c.totalRegistered - (c.presentToday ?? 0)),
      0,
    );
    const synced = classes.filter((c) => c.presentToday !== null).length;
    return {
      ...MOCK_STATS,
      presentToday: present,
      absentToday: absent,
      syncedClasses: synced,
    };
  }, [classes]);

  function handleSync() {
    setIsSyncing(true);
    setTimeout(() => {
      setClasses((prev) =>
        prev.map((c) => {
          if (c.presentToday !== null) return c;
          const present = Math.floor(c.totalRegistered * 0.9);
          return {
            ...c,
            presentToday: present,
            sickCount: c.totalRegistered - present,
            absentCount: 0,
            targetPortions: present,
            distributionStatus: "menunggu" as const,
            lastSyncTime: "07:15 WIB",
          };
        }),
      );
      setIsSyncing(false);
    }, 2000);
  }

  function handleExport() {
    window.alert("Fitur export log akan segera tersedia.");
  }

  function handleAction(row: BeneficiaryClass) {
    if (row.distributionStatus === "terkirim") {
      window.alert(
        `Log Pengiriman:\n\n${row.schoolName} - ${row.className}\nPorsi: ${row.targetPortions}\nStatus: Terkirim / Selesai\nWaktu: ${row.lastSyncTime}`,
      );
    } else {
      window.alert(
        `Log Penerimaan:\n\n${row.schoolName} - ${row.className}\nTarget: ${row.targetPortions ?? "-"} porsi\nStatus: ${row.distributionStatus}`,
      );
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Data Penerima Manfaat &amp; Distribusi
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Sinkronisasi data kehadiran siswa harian untuk menentukan target
          porsi masakan yang akurat.
        </p>
      </div>

      {/* Stats */}
      <BeneficiaryStatsCards stats={stats} />

      {/* Search + Actions */}
      <BeneficiarySearchBar
        search={search}
        onSearchChange={setSearch}
        onExport={handleExport}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Table */}
      <BeneficiaryTable rows={filteredClasses} onAction={handleAction} />
    </div>
  );
}
