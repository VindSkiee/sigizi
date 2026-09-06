"use client";

import { useParams, useRouter } from "next/navigation";
import StatusBadge from "@/components/features/bgn/common/StatusBadge";
import Timeline from "@/components/features/bgn/common/Timeline";
import {
  orders,
  formatRupiah,
  deviationColor,
  deviationBg,
} from "@/lib/bgn-mock-data";

const statusOrder = ["PENDING", "CONFIRMED", "DELIVERED", "COMPLETED"];

export default function BgnTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const order = orders.find((o) => o.id === orderId);

  if (!order)
    return (
      <div className="p-6 text-sm" style={{ color: "var(--text-muted)" }}>
        Transaksi tidak ditemukan.
      </div>
    );

  const currentStep = statusOrder.indexOf(order.status);

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
          onClick={() => router.push("/bgn/transactions")}
          className="hover:underline"
          style={{ color: "var(--accent)" }}
        >
          Transaksi
        </button>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>#{order.id}</span>
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
              Transaksi #{order.id}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <div
            className="text-xs mt-1"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {order.date} · {order.region}
          </div>
        </div>
        <button
          onClick={() => router.push("/bgn/transactions")}
          className="text-xs px-3 py-2 rounded-md border font-medium"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-body)",
          }}
        >
          &larr; Kembali
        </button>
      </div>

      {/* Status Timeline */}
      <div
        className="rounded-lg p-5"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          Status Transaksi
        </div>
        <div className="flex items-center gap-0">
          {statusOrder.map((s, i) => {
            const done =
              order.status === "CANCELLED" ? false : currentStep >= i;
            const active = currentStep === i && order.status !== "CANCELLED";
            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                    style={{
                      borderColor: done ? "var(--accent)" : "var(--border)",
                      background: done
                        ? active
                          ? "var(--accent)"
                          : "var(--accent-light)"
                        : "var(--bg)",
                      color: done
                        ? active
                          ? "#fff"
                          : "var(--accent)"
                        : "var(--text-muted)",
                    }}
                  >
                    {done && !active ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div
                    className="text-[10px] font-medium text-center"
                    style={{
                      color: done ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {s}
                  </div>
                </div>
                {i < statusOrder.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-2 mb-3"
                    style={{
                      background:
                        done && currentStep > i
                          ? "var(--accent)"
                          : "var(--border)",
                    }}
                  />
                )}
              </div>
            );
          })}
          {order.status === "CANCELLED" && (
            <div className="ml-4 flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: "var(--red)", background: "#FEF2F2" }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--red)"
                  strokeWidth="3"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div
                className="text-[10px] font-medium"
                style={{ color: "var(--red)" }}
              >
                CANCELLED
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two-column: Parties + Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-lg p-5 space-y-4"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Pihak Terlibat
          </div>
          <div className="space-y-3">
            <div>
              <div
                className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                style={{ color: "var(--accent)" }}
              >
                SPPG
              </div>
              <div
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {order.sppgName}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {order.region}
              </div>
              <button
                onClick={() => router.push(`/bgn/sppg/${order.sppgId}`)}
                className="text-xs mt-1 underline"
                style={{ color: "var(--accent)" }}
              >
                Lihat profil SPPG &rarr;
              </button>
            </div>
            <div
              className="border-t pt-3"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="text-[10px] uppercase tracking-wider font-semibold mb-1"
                style={{ color: "var(--green)" }}
              >
                Supplier
              </div>
              <div
                className="font-semibold text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {order.supplierName}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {order.region}
              </div>
              <button
                onClick={() =>
                  router.push(`/bgn/suppliers/${order.supplierId}`)
                }
                className="text-xs mt-1 underline"
                style={{ color: "var(--accent)" }}
              >
                Lihat profil Supplier &rarr;
              </button>
            </div>
          </div>
        </div>

        <div
          className="rounded-lg p-5"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Ringkasan Order
          </div>
          <div className="space-y-3">
            {[
              { label: "Tanggal Dibuat", value: order.date },
              {
                label: "Total Nilai",
                value: formatRupiah(order.total),
                mono: true,
                bold: true,
              },
              { label: "Status Pembayaran", value: order.paymentStatus },
              { label: "Status Pengiriman", value: order.status },
              { label: "Risiko", value: order.risk },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center text-xs"
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {row.label}
                </span>
                <span
                  className={row.bold ? "font-bold text-sm" : "font-medium"}
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
        </div>
      </div>

      {/* Items Table */}
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
            Item yang Dibeli
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Perbandingan harga transaksi vs harga referensi komoditas
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              {[
                "Komoditas",
                "Jumlah",
                "Harga Satuan",
                "Subtotal",
                "Harga Referensi",
                "Deviasi",
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
            {order.items.map((item, i) => {
              const devPct =
                ((item.unitPrice - item.referencePrice) / item.referencePrice) *
                100;
              const devColor = deviationColor(devPct);
              const devBg = deviationBg(devPct);
              return (
                <tr
                  key={i}
                  className="border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="px-5 py-3">
                    <div
                      className="font-medium text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.commodityName}
                    </div>
                    {item.isWarningBypass && item.justificationNote && (
                      <div
                        className="text-[10px] mt-1 px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{ background: "#FFFBEB", color: "#B45309" }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        Bypass: {item.justificationNote}
                      </div>
                    )}
                  </td>
                  <td
                    className="px-5 py-3 text-sm"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {item.quantity.toLocaleString("id-ID")} {item.unit}
                  </td>
                  <td
                    className="px-5 py-3 font-semibold"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatRupiah(item.unitPrice)}/{item.unit}
                  </td>
                  <td
                    className="px-5 py-3 font-semibold"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatRupiah(item.subtotal, true)}
                  </td>
                  <td
                    className="px-5 py-3 text-sm"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatRupiah(item.referencePrice)}/{item.unit}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        color: devColor,
                        background: devBg,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {devPct > 0 ? "+" : ""}
                      {devPct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Audit Timeline */}
      <div
        className="rounded-lg p-5"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div
          className="font-semibold text-sm mb-4"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
          }}
        >
          Riwayat Audit
        </div>
        <Timeline events={order.timeline} />
      </div>
    </div>
  );
}
