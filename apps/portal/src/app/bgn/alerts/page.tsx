"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  anomalies,
  formatRupiah,
  type AnomalyStatus,
} from "@/lib/bgn-mock-data";
import DetailDrawer from "@/components/features/bgn/common/DetailDrawer";

const statusColors: Record<AnomalyStatus, { bg: string; color: string }> = {
  New: { bg: "#EFF6FF", color: "#1D4ED8" },
  Reviewing: { bg: "#FFFBEB", color: "#B45309" },
  Resolved: { bg: "#F0FDF4", color: "#15803D" },
  Dismissed: { bg: "#F8FAFC", color: "#94A3B8" },
};

const priorityColor: Record<string, string> = {
  High: "var(--red)",
  Medium: "var(--amber)",
  Low: "var(--text-muted)",
};

const typeIcon: Record<string, string> = {
  "High Price Deviation": "💰",
  "High Supplier Concentration": "🔗",
  "High Cancellation Rate": "❌",
  "Low Procurement Activity": "📉",
  "Unusual Regional Price": "🗺️",
  "Unusual Procurement Pattern": "📊",
};

export default function BgnAnomalyCenterPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<AnomalyStatus | "ALL">(
    "ALL",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const statusGroups: Record<AnomalyStatus, number> = {
    New: anomalies.filter((a) => a.status === "New").length,
    Reviewing: anomalies.filter((a) => a.status === "Reviewing").length,
    Resolved: anomalies.filter((a) => a.status === "Resolved").length,
    Dismissed: anomalies.filter((a) => a.status === "Dismissed").length,
  };

  const filtered = anomalies.filter(
    (a) => statusFilter === "ALL" || a.status === statusFilter,
  );

  function openDetail(id: string) {
    router.push(`/bgn/anomaly/${id}`);
  }

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
          Perhatian &amp; Anomali
        </h1>
        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Pola pengadaan yang memerlukan tinjauan lebih lanjut
        </p>
        <div
          className="mt-2 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-md"
          style={{
            background: "var(--amber-light)",
            color: "var(--amber)",
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
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Sinyal ini bukan konfirmasi pelanggaran — diperlukan investigasi untuk
          menentukan konteks.
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        {(["New", "Reviewing", "Resolved", "Dismissed"] as AnomalyStatus[]).map(
          (s) => {
            const cfg = statusColors[s];
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(isActive ? "ALL" : s)}
                className="rounded-lg p-4 text-left transition-all"
                style={{
                  background: isActive ? cfg.color : cfg.bg,
                  border: `1.5px solid ${isActive ? cfg.color : cfg.bg}`,
                  outline: isActive ? `2px solid ${cfg.color}` : "none",
                }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: isActive ? "#fff" : cfg.color,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {statusGroups[s]}
                </div>
                <div
                  className="text-xs font-semibold mt-1"
                  style={{
                    color: isActive ? "rgba(255,255,255,0.85)" : cfg.color,
                  }}
                >
                  {s}
                </div>
              </button>
            );
          },
        )}
      </div>

      {/* Anomaly List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div
            className="rounded-lg p-10 text-center"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Tidak ada anomali signifikan terdeteksi untuk periode yang
              dipilih.
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              Sistem akan terus memantau pola pengadaan.
            </div>
          </div>
        )}
        {filtered.map((a) => {
          const statusCfg = statusColors[a.status];
          return (
            <div
              key={a.id}
              className="rounded-lg overflow-hidden"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Type + Priority */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-base">
                        {typeIcon[a.type] || "⚠️"}
                      </span>
                      <span
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: priorityColor[a.priority] }}
                      >
                        {a.priority}
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {a.type}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto"
                        style={{
                          background: statusCfg.bg,
                          color: statusCfg.color,
                        }}
                      >
                        {a.status}
                      </span>
                    </div>

                    {/* Entities */}
                    <div className="flex gap-4 text-xs mb-3 flex-wrap">
                      <span>
                        <span style={{ color: "var(--text-muted)" }}>
                          SPPG:
                        </span>{" "}
                        <span
                          className="font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {a.sppgName}
                        </span>
                      </span>
                      <span>
                        <span style={{ color: "var(--text-muted)" }}>
                          Supplier:
                        </span>{" "}
                        <span
                          className="font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {a.supplierName}
                        </span>
                      </span>
                      <span>
                        <span style={{ color: "var(--text-muted)" }}>
                          Komoditas:
                        </span>{" "}
                        <span
                          className="font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {a.commodityName}
                        </span>
                      </span>
                      <span>
                        <span style={{ color: "var(--text-muted)" }}>
                          Wilayah:
                        </span>{" "}
                        <span
                          className="font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {a.region}
                        </span>
                      </span>
                    </div>

                    {/* Signal */}
                    <div
                      className="text-xs mb-3"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {a.signal}
                    </div>

                    {/* Evidence inline */}
                    {a.type === "High Price Deviation" ||
                    a.type === "Unusual Regional Price" ? (
                      <div
                        className="flex gap-4 text-xs rounded-md p-3 flex-wrap"
                        style={{
                          background: "var(--bg)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <div>
                          <div style={{ color: "var(--text-muted)" }}>
                            Harga Transaksi
                          </div>
                          <div
                            className="font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {formatRupiah(a.observedValue)}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "var(--text-muted)" }}>
                            Harga Referensi
                          </div>
                          <div
                            className="font-bold"
                            style={{ color: "var(--blue)" }}
                          >
                            {formatRupiah(a.referenceValue)}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "var(--text-muted)" }}>
                            Median Regional
                          </div>
                          <div
                            className="font-bold"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {formatRupiah(a.regionalMedian)}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "var(--text-muted)" }}>
                            Jumlah Transaksi
                          </div>
                          <div
                            className="font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {a.transactionCount}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "var(--text-muted)" }}>
                            Deviasi
                          </div>
                          <div
                            className="font-bold text-base"
                            style={{
                              color:
                                a.deviation >= 20
                                  ? "var(--red)"
                                  : a.deviation >= 10
                                    ? "var(--amber)"
                                    : "var(--text-primary)",
                            }}
                          >
                            {a.deviation > 0 ? "+" : ""}
                            {a.deviation.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="flex gap-4 text-xs rounded-md p-3 flex-wrap"
                        style={{
                          background: "var(--bg)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <div>
                          <div style={{ color: "var(--text-muted)" }}>
                            Nilai Observasi
                          </div>
                          <div
                            className="font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {a.type.includes("Rate") ||
                            a.type.includes("Activity")
                              ? `${a.observedValue}${a.type.includes("Rate") ? "%" : ""}`
                              : formatRupiah(a.observedValue)}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "var(--text-muted)" }}>
                            Benchmark
                          </div>
                          <div
                            className="font-bold"
                            style={{ color: "var(--blue)" }}
                          >
                            {a.type.includes("Rate") ||
                            a.type.includes("Activity")
                              ? `${a.referenceValue}${a.type.includes("Rate") ? "%" : ""}`
                              : formatRupiah(a.referenceValue)}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "var(--text-muted)" }}>
                            Deviasi
                          </div>
                          <div
                            className="font-bold text-base"
                            style={{
                              color:
                                a.deviation >= 20 || a.deviation <= -20
                                  ? "var(--red)"
                                  : "var(--amber)",
                            }}
                          >
                            {a.deviation > 0 ? "+" : ""}
                            {a.deviation.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex items-center gap-2 mt-4 pt-4 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    onClick={() => openDetail(a.id)}
                    className="text-xs font-semibold px-3 py-2 rounded-md transition-colors"
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Investigasi →
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/bgn/transactions/${a.orderId}`)
                    }
                    className="text-xs font-semibold px-3 py-2 rounded-md border transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Tinjau Transaksi
                  </button>
                  <button
                    onClick={() => router.push(`/bgn/sppg/${a.sppgId}`)}
                    className="text-xs font-semibold px-3 py-2 rounded-md border transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Lihat SPPG
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/bgn/suppliers/${a.supplierId}`)
                    }
                    className="text-xs font-semibold px-3 py-2 rounded-md border transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    Lihat Supplier
                  </button>
                  <div
                    className="ml-auto text-[10px]"
                    style={{
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Terdeteksi: {a.detectedAt}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
