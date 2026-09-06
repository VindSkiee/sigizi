"use client";

import { useParams, useRouter } from "next/navigation";
import KPICard from "@/components/features/bgn/common/KPICard";
import AreaChart from "@/components/features/bgn/common/AreaChart";
import { suppliers, sppgs, orders, formatRupiah } from "@/lib/bgn-mock-data";

export default function BgnSupplierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supplierId = params.supplierId as string;
  const supplier = suppliers.find((s) => s.id === supplierId);

  if (!supplier)
    return (
      <div className="p-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Supplier tidak ditemukan.
      </div>
    );

  const servedSppgs = sppgs.filter((s) => supplier.sppgsServed.includes(s.id));
  const supplierOrders = orders.filter((o) => o.supplierId === supplierId);

  const cancRate =
    supplier.orders > 0
      ? ((supplier.cancelled / supplier.orders) * 100).toFixed(1)
      : "0.0";

  const trendData = [
    { label: "Apr", value: Math.round(supplier.procurementValue * 0.14) },
    { label: "Mei", value: Math.round(supplier.procurementValue * 0.16) },
    { label: "Jun", value: Math.round(supplier.procurementValue * 0.18) },
    { label: "Jul", value: Math.round(supplier.procurementValue * 0.22) },
    { label: "Ags", value: Math.round(supplier.procurementValue * 0.3) },
  ];

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
          onClick={() => router.push("/bgn/suppliers")}
          className="hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Supplier
        </button>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{supplier.name}</span>
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
            {supplier.name}
          </h1>
          <div
            className="text-xs mt-1 flex items-center gap-3"
            style={{ color: "var(--text-muted)" }}
          >
            <span>{supplier.region}</span>
            <span>·</span>
            <span>{supplier.activeItems} item aktif</span>
          </div>
        </div>
        <button
          onClick={() => router.push("/bgn/suppliers")}
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
        <KPICard label="Total Order" value={String(supplier.orders)} />
        <KPICard
          label="Nilai Pengadaan"
          value={formatRupiah(supplier.procurementValue, true)}
        />
        <KPICard
          label="SPPG Dilayani"
          value={String(supplier.sppgsServed.length)}
        />
        <KPICard
          label="Rata-rata Nilai Order"
          value={formatRupiah(supplier.avgOrderValue, true)}
        />
        <KPICard
          label="Tingkat Pembatalan"
          value={`${cancRate}%`}
          highlight={supplier.cancelled > 8}
        />
      </div>

      {/* Trend + SPPGs */}
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
            color="#16A34A"
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
            className="font-semibold text-sm mb-3"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            SPPG Dilayani
          </div>
          <div className="space-y-2">
            {servedSppgs.slice(0, 8).map((s) => (
              <button
                key={s.id}
                onClick={() => router.push(`/bgn/sppg/${s.id}`)}
                className="w-full text-left flex items-center justify-between py-2 border-b hover:opacity-70 transition-opacity"
                style={{ borderColor: "var(--border)" }}
              >
                <div>
                  <div
                    className="text-xs font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {s.name}
                  </div>
                  <div
                    className="text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {s.region}
                  </div>
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {supplierOrders.length > 0 && (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
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
              Transaksi Terkini
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg)" }}>
                {["ID", "Tanggal", "SPPG", "Total", "Status"].map((h) => (
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
              {supplierOrders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => router.push(`/bgn/transactions/${o.id}`)}
                  className="border-t cursor-pointer hover:bg-blue-50/30 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td
                    className="px-5 py-3 text-xs font-semibold"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    #{o.id}
                  </td>
                  <td
                    className="px-5 py-3 text-xs"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {o.date}
                  </td>
                  <td
                    className="px-5 py-3 text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {o.sppgName}
                  </td>
                  <td
                    className="px-5 py-3 text-xs font-semibold"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatRupiah(o.total, true)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          o.status === "COMPLETED"
                            ? "#F0FDF4"
                            : o.status === "CANCELLED"
                              ? "#FEF2F2"
                              : "#EFF6FF",
                        color:
                          o.status === "COMPLETED"
                            ? "#15803D"
                            : o.status === "CANCELLED"
                              ? "#DC2626"
                              : "#1D4ED8",
                      }}
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
