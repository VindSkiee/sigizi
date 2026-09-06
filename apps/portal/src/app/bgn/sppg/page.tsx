"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import KPICard from "@/components/features/bgn/common/KPICard";
import StatusBadge from "@/components/features/bgn/common/StatusBadge";
import MiniBarChart from "@/components/features/bgn/common/MiniBarChart";
import { sppgs, formatRupiah, type SPPGStatus } from "@/lib/bgn-mock-data";

const statuses: SPPGStatus[] = [
  "Active",
  "Low Activity",
  "High Cancellation",
  "Requires Review",
];

export default function BgnSPPGPerformancePage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered = sppgs.filter(
    (s) => statusFilter === "ALL" || s.status === statusFilter,
  );
  const active = sppgs.filter((s) => s.status === "Active").length;
  const withTx = sppgs.filter((s) => s.orders > 0).length;
  const avgCoverage = Math.round(
    sppgs.reduce((a, s) => a + s.digitalCoverage, 0) / sppgs.length,
  );

  const topSppgs = [...sppgs]
    .sort((a, b) => b.procurementValue - a.procurementValue)
    .slice(0, 8);

  return (
    <div className="bgn-root p-6 space-y-5">
      <div>
        <h1
          className="text-xl font-bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
          }}
        >
          Performa SPPG
        </h1>
        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Bandingkan perilaku pengadaan dan identifikasi SPPG yang memerlukan
          perhatian
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Total SPPG" value="208" sub="terdaftar di SIGIZI" />
        <KPICard
          label="SPPG Aktif"
          value={String(active)}
          trend={`${Math.round((active / 208) * 100)}% partisipasi`}
          trendUp
        />
        <KPICard
          label="SPPG dengan Transaksi"
          value={String(withTx)}
          sub={`dari ${sppgs.length} sample`}
        />
        <KPICard
          label="Rata-rata Cakupan Digital"
          value={`${avgCoverage}%`}
          highlight
        />
      </div>

      {/* Chart + Table */}
      <div className="grid grid-cols-5 gap-4">
        <div
          className="col-span-2 rounded-lg p-5"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="font-semibold text-sm mb-1"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            Distribusi Pengadaan SPPG
          </div>
          <div
            className="text-xs mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Top 8 SPPG berdasarkan nilai pengadaan
          </div>
          <MiniBarChart
            items={topSppgs.map((s) => ({
              label: s.name.replace("SPPG ", ""),
              value: s.procurementValue,
            }))}
            formatValue={(v) => formatRupiah(v, true)}
          />
        </div>

        <div
          className="col-span-3 rounded-lg overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="flex border-b"
            style={{ borderColor: "var(--border)" }}
          >
            {["ALL", ...statuses].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-4 py-3 text-xs font-semibold transition-colors border-b-2"
                style={{
                  borderColor:
                    statusFilter === s ? "var(--accent)" : "transparent",
                  color:
                    statusFilter === s
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {s === "ALL" ? "Semua" : s}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {[
                    "SPPG",
                    "Wilayah",
                    "Order",
                    "Selesai",
                    "Batal",
                    "Nilai",
                    "Supplier",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] uppercase tracking-wider font-semibold px-4 py-3 whitespace-nowrap"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => router.push(`/bgn/sppg/${s.id}`)}
                    className="border-t cursor-pointer transition-colors hover:bg-blue-50/30"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-4 py-3">
                      <div
                        className="font-medium text-xs"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {s.name}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {s.region}
                    </td>
                    <td
                      className="px-4 py-3 text-xs font-mono"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.orders}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{
                        color: "var(--green)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.completed}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{
                        color:
                          s.cancelled > 10
                            ? "var(--red)"
                            : "var(--text-secondary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.cancelled}
                    </td>
                    <td
                      className="px-4 py-3 text-xs font-semibold"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {formatRupiah(s.procurementValue, true)}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
                      style={{
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.supplierCount}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} small />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
