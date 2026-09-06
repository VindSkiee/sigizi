"use client";

import { useParams, useRouter } from "next/navigation";
import {
  anomalies,
  commodityPriceData,
  formatRupiah,
  deviationColor,
  deviationBg,
} from "@/lib/bgn-mock-data";
import AreaChart from "@/components/features/bgn/common/AreaChart";

export default function BgnAnomalyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const anomalyId = params.anomalyId as string;
  const anomaly = anomalies.find((a) => a.id === anomalyId);

  if (!anomaly)
    return (
      <div className="p-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Anomali tidak ditemukan.
      </div>
    );

  const priceData = commodityPriceData[anomaly.commodityId];
  const historicData = priceData
    ? priceData.historicalPrices.map((p) => ({
        label: p.month,
        value: p.price,
      }))
    : [];

  const devColor = deviationColor(anomaly.deviation);
  const devBg = deviationBg(anomaly.deviation);

  return (
    <div className="bgn-root p-6 space-y-6">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        <button
          onClick={() => router.push("/bgn")}
          className="hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Overview
        </button>
        <span>/</span>
        <button
          onClick={() => router.push("/bgn/anomaly")}
          className="hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Anomali
        </button>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>#{anomaly.id}</span>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-xl font-bold"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            Detail Anomali
          </h1>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {anomaly.type} · {anomaly.sppgName} · {anomaly.region}
          </div>
        </div>
        <button
          onClick={() => router.push("/bgn/anomaly")}
          className="text-xs px-3 py-2 rounded-md border font-medium"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          &larr; Kembali
        </button>
      </div>

      {/* Signal */}
      <div
        className="rounded-md p-4"
        style={{
          background: anomaly.priority === "High" ? "#FEF2F2" : "#FFFBEB",
          border: `1px solid ${anomaly.priority === "High" ? "#FECACA" : "#FDE68A"}`,
        }}
      >
        <div
          className="text-[10px] uppercase tracking-widest font-bold mb-1"
          style={{
            color: anomaly.priority === "High" ? "var(--red)" : "var(--amber)",
          }}
        >
          Sinyal · {anomaly.priority} Priority
        </div>
        <div
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {anomaly.signal}
        </div>
      </div>

      {/* Evidence */}
      <div>
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Bukti
        </div>
        <div
          className="rounded-md overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {[
            { label: "ID Transaksi", value: `#${anomaly.orderId}`, mono: true },
            { label: "SPPG", value: anomaly.sppgName },
            { label: "Supplier", value: anomaly.supplierName },
            { label: "Komoditas", value: anomaly.commodityName },
            {
              label: "Tanggal Terdeteksi",
              value: anomaly.detectedAt,
              mono: true,
            },
            ...(anomaly.type.includes("Price") ||
            anomaly.type.includes("Regional")
              ? [
                  {
                    label: "Harga Transaksi",
                    value: formatRupiah(anomaly.observedValue),
                    mono: true,
                    bold: true,
                  },
                  {
                    label: "Harga Referensi",
                    value: formatRupiah(anomaly.referenceValue),
                    mono: true,
                  },
                  {
                    label: "Median Regional",
                    value: formatRupiah(anomaly.regionalMedian),
                    mono: true,
                  },
                  {
                    label: "Jumlah Transaksi Terkait",
                    value: String(anomaly.transactionCount),
                    mono: true,
                  },
                ]
              : [
                  {
                    label: "Nilai Observasi",
                    value: `${anomaly.observedValue}${anomaly.type.includes("Rate") ? "%" : ""}`,
                    mono: true,
                    bold: true,
                  },
                  {
                    label: "Benchmark Ekosistem",
                    value: `${anomaly.referenceValue}${anomaly.type.includes("Rate") ? "%" : ""}`,
                    mono: true,
                  },
                ]),
          ].map((row, i) => (
            <div
              key={i}
              className="flex justify-between items-center px-4 py-2.5 text-xs border-b last:border-0"
              style={{ borderColor: "var(--border)" }}
            >
              <span style={{ color: "var(--text-secondary)" }}>
                {row.label}
              </span>
              <span
                className={row.bold ? "font-bold" : "font-medium"}
                style={{
                  color: "var(--text-primary)",
                  fontFamily: row.mono ? "var(--font-mono)" : "inherit",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Deviation highlight */}
        <div
          className="mt-3 flex items-center justify-between rounded-md px-4 py-3"
          style={{ background: devBg, border: `1px solid ${devColor}30` }}
        >
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Deviasi
          </span>
          <span
            className="text-xl font-bold"
            style={{ color: devColor, fontFamily: "var(--font-mono)" }}
          >
            {anomaly.deviation > 0 ? "+" : ""}
            {anomaly.deviation.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Historical Context */}
      {historicData.length > 0 && (
        <div>
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Konteks Historis — {anomaly.commodityName}
          </div>
          <div
            className="rounded-md p-4"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
            }}
          >
            <AreaChart
              data={historicData}
              color={anomaly.deviation >= 10 ? "#D97706" : "#1B4FBE"}
              height={100}
              formatValue={(v) => formatRupiah(v)}
            />
          </div>
        </div>
      )}

      {/* Regional Comparison */}
      {priceData && (
        <div>
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Perbandingan Regional
          </div>
          <div className="space-y-2">
            {priceData.regionalComparison.slice(0, 5).map((r) => {
              const dev =
                ((r.avgPrice - anomaly.referenceValue) /
                  anomaly.referenceValue) *
                100;
              const isThis = r.region === anomaly.region;
              return (
                <div
                  key={r.region}
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-md"
                  style={{
                    background: isThis ? "var(--accent-light)" : "var(--bg)",
                    border: isThis
                      ? "1px solid var(--accent)"
                      : "1px solid transparent",
                  }}
                >
                  <span
                    style={{
                      color: isThis ? "var(--accent)" : "var(--text-secondary)",
                      fontWeight: isThis ? 700 : 400,
                    }}
                  >
                    {r.region} {isThis && "← ini"}
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {formatRupiah(r.avgPrice)}
                    </span>
                    <span
                      className="font-semibold"
                      style={{
                        color: deviationColor(dev),
                        fontFamily: "var(--font-mono)",
                        minWidth: 52,
                        textAlign: "right",
                      }}
                    >
                      {dev > 0 ? "+" : ""}
                      {dev.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        className="space-y-2 pt-2 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Tindakan
        </div>
        <button
          onClick={() => router.push(`/bgn/transactions/${anomaly.orderId}`)}
          className="w-full text-sm font-semibold py-2.5 rounded-md transition-colors"
          style={{
            background: "var(--accent)",
            color: "#fff",
            fontFamily: "var(--font-body)",
          }}
        >
          Tinjau Transaksi #{anomaly.orderId}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => router.push(`/bgn/sppg/${anomaly.sppgId}`)}
            className="text-xs font-semibold py-2 rounded-md border transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Lihat SPPG
          </button>
          <button
            onClick={() => router.push(`/bgn/suppliers/${anomaly.supplierId}`)}
            className="text-xs font-semibold py-2 rounded-md border transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            Lihat Supplier
          </button>
        </div>
      </div>
    </div>
  );
}
