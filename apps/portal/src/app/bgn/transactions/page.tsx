"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/features/bgn/common/StatusBadge";
import RiskBadge from "@/components/features/bgn/common/RiskBadge";
import { orders, formatRupiah, type OrderStatus } from "@/lib/bgn-mock-data";

const allStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

export default function BgnTransactionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const regions = Array.from(new Set(orders.map((o) => o.region)));

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.sppgName.toLowerCase().includes(search.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchRegion = regionFilter === "ALL" || o.region === regionFilter;
    return matchSearch && matchStatus && matchRegion;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeFilters: string[] = [];
  if (statusFilter !== "ALL") activeFilters.push(statusFilter);
  if (regionFilter !== "ALL") activeFilters.push(regionFilter);

  return (
    <div className="bgn-root p-6 space-y-4">
      {/* Header */}
      <div>
        <h1
          className="text-xl font-bold"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
          }}
        >
          Monitoring Transaksi
        </h1>
        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Pantau transaksi pengadaan di seluruh SPPG dan Supplier
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className="rounded-lg p-4 flex flex-wrap gap-3 items-center"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--text-muted)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari ID, SPPG, Supplier..."
            className="w-full pl-9 pr-3 py-2 rounded-md text-sm outline-none border"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          />
        </div>

        <select
          value={regionFilter}
          onChange={(e) => {
            setRegionFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs border rounded-md px-3 py-2 outline-none"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
            background: "var(--card)",
            fontFamily: "var(--font-body)",
          }}
        >
          <option value="ALL">Semua Wilayah</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs border rounded-md px-3 py-2 outline-none"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
            background: "var(--card)",
            fontFamily: "var(--font-body)",
          }}
        >
          <option value="ALL">Semua Status</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {activeFilters.length > 0 && (
          <button
            onClick={() => {
              setStatusFilter("ALL");
              setRegionFilter("ALL");
              setPage(1);
            }}
            className="text-xs px-3 py-2 rounded-md font-medium"
            style={{
              color: "var(--red)",
              background: "#FEF2F2",
              fontFamily: "var(--font-body)",
            }}
          >
            Hapus Filter
          </button>
        )}
      </div>

      {/* Active chips */}
      {activeFilters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {activeFilters.map((f) => (
            <span
              key={f}
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: "var(--accent-light)",
                color: "var(--accent)",
                fontFamily: "var(--font-body)",
              }}
            >
              {f}
            </span>
          ))}
          <span className="text-xs py-1" style={{ color: "var(--text-muted)" }}>
            {filtered.length} hasil ditemukan
          </span>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              {[
                "ID Transaksi",
                "Tanggal",
                "SPPG",
                "Supplier",
                "Item",
                "Total",
                "Status",
                "Pembayaran",
                "Risiko",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] uppercase tracking-wider font-semibold px-4 py-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((o) => (
              <tr
                key={o.id}
                onClick={() => router.push(`/bgn/transactions/${o.id}`)}
                className="border-t cursor-pointer transition-colors hover:bg-blue-50/30"
                style={{ borderColor: "var(--border)" }}
              >
                <td className="px-4 py-3">
                  <span
                    className="font-semibold"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                    }}
                  >
                    #{o.id}
                  </span>
                </td>
                <td
                  className="px-4 py-3 text-xs"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {o.date}
                </td>
                <td className="px-4 py-3">
                  <div
                    className="font-medium text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {o.sppgName}
                  </div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {o.region}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div
                    className="text-xs"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {o.supplierName}
                  </div>
                </td>
                <td
                  className="px-4 py-3 text-xs"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {o.items.length} item
                </td>
                <td className="px-4 py-3">
                  <span
                    className="font-semibold text-xs"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatRupiah(o.total, true)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} small />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.paymentStatus} small />
                </td>
                <td className="px-4 py-3">
                  <RiskBadge risk={o.risk} />
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center py-12 text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Tidak ada transaksi yang sesuai filter
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Menampilkan {(page - 1) * PER_PAGE + 1}–
              {Math.min(page * PER_PAGE, filtered.length)} dari{" "}
              {filtered.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs rounded-md border disabled:opacity-40"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                &lsaquo; Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-7 text-xs rounded-md border font-medium"
                  style={{
                    borderColor: p === page ? "var(--accent)" : "var(--border)",
                    background: p === page ? "var(--accent)" : "transparent",
                    color: p === page ? "#fff" : "var(--text-secondary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs rounded-md border disabled:opacity-40"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Berikutnya &rsaquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
