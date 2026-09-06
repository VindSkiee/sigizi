"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import KPICard from "@/components/features/bgn/common/KPICard";
import MiniBarChart from "@/components/features/bgn/common/MiniBarChart";
import AreaChart from "@/components/features/bgn/common/AreaChart";
import {
  regionalData,
  procurementTrend,
  anomalies,
  formatRupiah,
} from "@/lib/bgn-mock-data";

export default function BgnOverviewPage() {
  const router = useRouter();
  const [trendTab, setTrendTab] = useState<"transactions" | "value">(
    "transactions",
  );

  const trendData = procurementTrend.map((d) => ({
    label: d.month,
    value: trendTab === "transactions" ? d.transactions : d.value,
  }));

  const attentionCounts = {
    "High Price Deviation": anomalies.filter(
      (a) =>
        a.type === "High Price Deviation" &&
        a.status !== "Resolved" &&
        a.status !== "Dismissed",
    ).length,
    "High Supplier Concentration": anomalies.filter(
      (a) =>
        a.type === "High Supplier Concentration" && a.status !== "Resolved",
    ).length,
    "High Cancellation Rate": anomalies.filter(
      (a) => a.type === "High Cancellation Rate" && a.status !== "Resolved",
    ).length,
    "Low Procurement Activity": anomalies.filter(
      (a) => a.type === "Low Procurement Activity" && a.status !== "Resolved",
    ).length,
  };

  const totalAttention =
    Object.values(attentionCounts).reduce((a, b) => a + b, 0) + 9;

  return (
    <div className="bgn-root p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-xl font-bold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            Procurement Overview
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Aktivitas pengadaan nasional di ekosistem SPPG dan Supplier
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="text-xs border rounded-md px-3 py-2 outline-none"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              background: "var(--card)",
              fontFamily: "var(--font-body)",
            }}
          >
            <option>Ags 2025</option>
            <option>Jul 2025</option>
            <option>30 Hari Terakhir</option>
          </select>
          <select
            className="text-xs border rounded-md px-3 py-2 outline-none"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              background: "var(--card)",
              fontFamily: "var(--font-body)",
            }}
          >
            <option>Semua Wilayah</option>
            <option>Jawa Barat</option>
            <option>Jawa Tengah</option>
          </select>
          <button
            className="text-xs font-semibold px-3 py-2 rounded-md flex items-center gap-2 transition-colors"
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-body)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Ekspor
          </button>
        </div>
      </div>

      {/* KPI Groups */}
      <div className="space-y-3">
        <div>
          <div
            className="text-[10px] uppercase tracking-widest font-semibold mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Pengadaan Nasional
          </div>
          <div className="grid grid-cols-3 gap-3">
            <KPICard
              label="Nilai Pengadaan"
              value="Rp 18,4M"
              trend="+12,4% vs periode lalu"
              trendUp
            />
            <KPICard
              label="Transaksi Digital"
              value="12.482"
              trend="+14,8% vs periode lalu"
              trendUp
            />
            <KPICard
              label="Cakupan Pengadaan Digital"
              value="68,4%"
              sub="Dari total aktivitas yang tercatat di SIGIZI"
              highlight
            />
          </div>
        </div>
        <div>
          <div
            className="text-[10px] uppercase tracking-widest font-semibold mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Ekosistem
          </div>
          <div className="grid grid-cols-3 gap-3">
            <KPICard
              label="SPPG Aktif"
              value="142"
              sub="dari 208 total SPPG"
              trend="68,3% tingkat partisipasi"
              trendUp
            />
            <KPICard
              label="Supplier Aktif"
              value="87"
              sub="dari 112 total supplier"
            />
            <KPICard
              label="SPPG dengan Transaksi"
              value="118"
              sub="dari 208 total SPPG"
              trend="56,7% coverage"
              trendUp
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-5 gap-4">
        <div
          className="col-span-3 rounded-lg p-5"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div
                className="font-semibold text-sm"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                Aktivitas Pengadaan
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Tren 6 bulan terakhir
              </div>
            </div>
            <div
              className="flex rounded-md overflow-hidden border"
              style={{ borderColor: "var(--border)" }}
            >
              {(["transactions", "value"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTrendTab(tab)}
                  className="text-xs px-3 py-1.5 font-medium transition-colors"
                  style={{
                    background:
                      trendTab === tab ? "var(--accent)" : "transparent",
                    color: trendTab === tab ? "#fff" : "var(--text-secondary)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {tab === "transactions" ? "Transaksi" : "Nilai (M)"}
                </button>
              ))}
            </div>
          </div>
          <AreaChart
            data={trendData}
            height={160}
            formatValue={
              trendTab === "value"
                ? (v) => `Rp ${v.toFixed(1)}M`
                : (v) => v.toLocaleString("id-ID")
            }
          />
        </div>

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
            Aktivitas per Wilayah
          </div>
          <div
            className="text-xs mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Peringkat berdasarkan nilai pengadaan
          </div>
          <MiniBarChart
            items={regionalData.slice(0, 6).map((r) => ({
              label: r.region
                .replace("Sumatera ", "Sum. ")
                .replace("Sulawesi ", "Sul. ")
                .replace("Kalimantan ", "Kal. "),
              value: r.value,
              sub: `+${r.growth}%`,
            }))}
            formatValue={(v) => formatRupiah(v, true)}
          />
        </div>
      </div>

      {/* Attention Signals */}
      <div
        className="rounded-lg p-5"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <div
                className="font-semibold text-sm flex items-center gap-2"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: "var(--red)" }}
                >
                  {totalAttention}
                </span>
                Sinyal Perhatian
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Pola pengadaan yang memerlukan tinjauan lebih lanjut
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/bgn/anomaly")}
            className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
            style={{
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              background: "var(--accent-light)",
              fontFamily: "var(--font-body)",
            }}
          >
            Lihat Semua &rarr;
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: "High Price Deviation",
              count: 8,
              color: "var(--red)",
              bg: "#FEF2F2",
            },
            {
              label: "High Cancellation Rate",
              count: 5,
              color: "var(--amber)",
              bg: "#FFFBEB",
            },
            {
              label: "Low Procurement Activity",
              count: 12,
              color: "var(--amber)",
              bg: "#FFFBEB",
            },
            {
              label: "High Supplier Concentration",
              count: 3,
              color: "var(--blue)",
              bg: "#EFF6FF",
            },
          ].map((sig) => (
            <button
              key={sig.label}
              onClick={() => router.push("/bgn/anomaly")}
              className="rounded-md p-4 text-left transition-opacity hover:opacity-80"
              style={{ background: sig.bg, border: `1px solid ${sig.color}30` }}
            >
              <div
                className="text-2xl font-bold"
                style={{ color: sig.color, fontFamily: "var(--font-mono)" }}
              >
                {sig.count}
              </div>
              <div
                className="text-xs font-medium mt-1"
                style={{ color: "var(--text-primary)" }}
              >
                {sig.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Regional Table */}
      <div
        className="rounded-lg"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="font-semibold text-sm"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            Detail Wilayah
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              {[
                "Wilayah",
                "SPPG",
                "Supplier",
                "Transaksi",
                "Nilai Pengadaan",
                "Pertumbuhan",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] uppercase tracking-wider font-semibold px-5 py-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regionalData.map((r) => (
              <tr
                key={r.region}
                className="border-t transition-colors hover:bg-blue-50/30 cursor-pointer"
                style={{ borderColor: "var(--border)" }}
              >
                <td
                  className="px-5 py-3 text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {r.region}
                </td>
                <td
                  className="px-5 py-3 text-sm"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.sppgCount}
                </td>
                <td
                  className="px-5 py-3 text-sm"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.supplierCount}
                </td>
                <td
                  className="px-5 py-3 text-sm"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {r.transactions.toLocaleString("id-ID")}
                </td>
                <td
                  className="px-5 py-3 text-sm font-semibold"
                  style={{
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {formatRupiah(r.value, true)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: "var(--green)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    +{r.growth}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
