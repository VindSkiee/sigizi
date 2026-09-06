"use client";

import { useParams, useRouter } from "next/navigation";
import KPICard from "@/components/features/bgn/common/KPICard";
import StatusBadge from "@/components/features/bgn/common/StatusBadge";
import AreaChart from "@/components/features/bgn/common/AreaChart";
import { sppgs, orders, formatRupiah, anomalies } from "@/lib/bgn-mock-data";

export default function BgnSPPGDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sppgId = params.sppgId as string;
  const sppg = sppgs.find((s) => s.id === sppgId);

  if (!sppg)
    return (
      <div className="p-6 text-sm" style={{ color: "var(--text-muted)" }}>
        SPPG tidak ditemukan.
      </div>
    );

  const sppgOrders = orders.filter((o) => o.sppgId === sppgId);
  const supplierDist = sppgOrders.reduce<
    Record<
      string,
      { name: string; orders: number; value: number; cancelled: number }
    >
  >((acc, o) => {
    if (!acc[o.supplierId])
      acc[o.supplierId] = {
        name: o.supplierName,
        orders: 0,
        value: 0,
        cancelled: 0,
      };
    acc[o.supplierId].orders++;
    acc[o.supplierId].value += o.total;
    if (o.status === "CANCELLED") acc[o.supplierId].cancelled++;
    return acc;
  }, {});
  const supplierRows = Object.values(supplierDist);
  const totalSupValue = supplierRows.reduce((a, r) => a + r.value, 0);

  const attentionSignals = anomalies.filter(
    (a) =>
      a.sppgId === sppgId &&
      a.status !== "Resolved" &&
      a.status !== "Dismissed",
  );

  const trendData = [
    { label: "Apr", value: Math.round(sppg.procurementValue * 0.12) },
    { label: "Mei", value: Math.round(sppg.procurementValue * 0.15) },
    { label: "Jun", value: Math.round(sppg.procurementValue * 0.17) },
    { label: "Jul", value: Math.round(sppg.procurementValue * 0.21) },
    { label: "Ags", value: Math.round(sppg.procurementValue * 0.35) },
  ];

  const cancRate =
    sppg.orders > 0 ? ((sppg.cancelled / sppg.orders) * 100).toFixed(1) : "0.0";

  return (
    <div className="bgn-root p-6 space-y-5">
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
          onClick={() => router.push("/bgn/sppg")}
          className="hover:underline"
          style={{ color: "var(--accent)" }}
        >
          SPPG
        </button>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{sppg.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="text-xl font-bold"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              {sppg.name}
            </h1>
            <StatusBadge status={sppg.status} />
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {sppg.region}
          </div>
        </div>
        <button
          onClick={() => router.push("/bgn/sppg")}
          className="text-xs px-3 py-2 rounded-md border font-medium"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          &larr; Kembali
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <KPICard label="Total Order" value={String(sppg.orders)} />
        <KPICard
          label="Nilai Pengadaan"
          value={formatRupiah(sppg.procurementValue, true)}
        />
        <KPICard label="Supplier Aktif" value={String(sppg.supplierCount)} />
        <KPICard
          label="Rata-rata Order"
          value={formatRupiah(sppg.avgOrderValue, true)}
        />
        <KPICard
          label="Tingkat Pembatalan"
          value={`${cancRate}%`}
          highlight={sppg.cancelled > 10}
        />
      </div>

      {/* Trend + Attention */}
      <div className="grid grid-cols-3 gap-4">
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
            Tren Pengadaan
          </div>
          <div
            className="text-xs mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Nilai pengadaan (Rp)
          </div>
          <AreaChart
            data={trendData}
            formatValue={(v) => formatRupiah(v, true)}
            height={140}
          />
        </div>

        <div
          className="rounded-lg p-5"
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
            Sinyal Perhatian
          </div>
          {attentionSignals.length === 0 ? (
            <div
              className="text-xs mt-4"
              style={{ color: "var(--text-muted)" }}
            >
              Tidak ada sinyal perhatian terdeteksi untuk SPPG ini.
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              {attentionSignals.map((a) => (
                <button
                  key={a.id}
                  onClick={() => router.push(`/bgn/anomaly/${a.id}`)}
                  className="w-full text-left rounded-md p-3 transition-opacity hover:opacity-80"
                  style={{
                    background: a.priority === "High" ? "#FEF2F2" : "#FFFBEB",
                    border: `1px solid ${a.priority === "High" ? "#FECACA" : "#FDE68A"}`,
                  }}
                >
                  <div
                    className="text-xs font-semibold"
                    style={{
                      color:
                        a.priority === "High" ? "var(--red)" : "var(--amber)",
                    }}
                  >
                    {a.type}
                  </div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {a.signal}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Supplier Distribution */}
      <div
        className="rounded-lg overflow-hidden"
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
            Distribusi Supplier
          </div>
        </div>
        {supplierRows.length === 0 ? (
          <div
            className="p-6 text-sm text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Belum ada data supplier.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                {["Supplier", "Order", "Nilai", "Porsi", "Batal"].map((h) => (
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
              {supplierRows.map((r, i) => (
                <tr
                  key={i}
                  className="border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td
                    className="px-5 py-3 text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {r.name}
                  </td>
                  <td
                    className="px-5 py-3 text-sm"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {r.orders}
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
                  <td
                    className="px-5 py-3 text-sm font-semibold"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {totalSupValue > 0
                      ? ((r.value / totalSupValue) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                  <td
                    className="px-5 py-3 text-sm"
                    style={{
                      color:
                        r.cancelled > 0 ? "var(--red)" : "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {r.cancelled}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
