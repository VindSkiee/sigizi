"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import KPICard from "@/components/features/bgn/common/KPICard";
import MiniBarChart from "@/components/features/bgn/common/MiniBarChart";
import { suppliers, formatRupiah } from "@/lib/bgn-mock-data";

type ConcentrationTab = "sppg" | "value" | "orders";

export default function BgnSuppliersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [concTab, setConcTab] = useState<ConcentrationTab>("value");

  const filtered = suppliers.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.region.toLowerCase().includes(search.toLowerCase()),
  );

  const activeSuppliers = suppliers.filter((s) => s.orders > 0).length;
  const avgOrderValue = Math.round(
    suppliers.reduce((a, s) => a + s.avgOrderValue, 0) / suppliers.length,
  );
  const totalValue = suppliers.reduce((a, s) => a + s.procurementValue, 0);
  const top5Share = suppliers
    .slice(0, 5)
    .reduce((a, s) => a + s.procurementValue, 0);
  const top5Pct = ((top5Share / totalValue) * 100).toFixed(1);

  const concItems = (() => {
    const sorted = [...suppliers]
      .sort((a, b) => {
        if (concTab === "sppg")
          return b.sppgsServed.length - a.sppgsServed.length;
        if (concTab === "value") return b.procurementValue - a.procurementValue;
        return b.orders - a.orders;
      })
      .slice(0, 8);

    return sorted.map((s) => ({
      label: s.name
        .replace("CV ", "")
        .replace("PT ", "")
        .replace("UD ", "")
        .slice(0, 20),
      value:
        concTab === "sppg"
          ? s.sppgsServed.length
          : concTab === "value"
            ? s.procurementValue
            : s.orders,
    }));
  })();

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
          Supplier Intelligence
        </h1>
        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Partisipasi supplier dan hubungan pengadaan dalam ekosistem
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <KPICard label="Total Supplier" value="112" sub="terdaftar di SIGIZI" />
        <KPICard
          label="Supplier Aktif"
          value={String(activeSuppliers)}
          trend={`${Math.round((activeSuppliers / 112) * 100)}% partisipasi`}
          trendUp
        />
        <KPICard
          label="Supplier dengan Transaksi"
          value={String(activeSuppliers)}
          sub="data sample"
        />
        <KPICard
          label="Rata-rata Nilai Order"
          value={formatRupiah(avgOrderValue, true)}
        />
      </div>

      {/* Concentration + Table */}
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
            Konsentrasi Supplier
          </div>
          <div
            className="text-xs mb-1 rounded-md px-3 py-2 font-semibold"
            style={{
              background: "#FFFBEB",
              color: "var(--amber)",
              fontFamily: "var(--font-body)",
            }}
          >
            Top 5 supplier menguasai {top5Pct}% dari total nilai pengadaan
          </div>
          <div className="flex gap-1 my-3">
            {(["sppg", "value", "orders"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setConcTab(tab)}
                className="flex-1 text-[10px] py-1.5 rounded-md font-semibold transition-colors"
                style={{
                  background: concTab === tab ? "var(--accent)" : "var(--bg)",
                  color: concTab === tab ? "#fff" : "var(--text-secondary)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {tab === "sppg"
                  ? "SPPG Dilayani"
                  : tab === "value"
                    ? "Nilai"
                    : "Order"}
              </button>
            ))}
          </div>
          <MiniBarChart
            items={concItems}
            formatValue={
              concTab === "value"
                ? (v) => formatRupiah(v, true)
                : (v) => v.toLocaleString("id-ID")
            }
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
            className="px-4 py-3 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="13"
                height="13"
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari supplier..."
                className="w-full pl-8 pr-3 py-2 rounded-md text-xs outline-none border"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--bg)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--bg)" }}>
                  {[
                    "Supplier",
                    "Wilayah",
                    "SPPG",
                    "Order",
                    "Selesai",
                    "Batal",
                    "Nilai Pengadaan",
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
                    onClick={() => router.push(`/bgn/suppliers/${s.id}`)}
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
                      className="px-4 py-3 text-xs font-semibold"
                      style={{
                        color: "var(--accent)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.sppgsServed.length}
                    </td>
                    <td
                      className="px-4 py-3 text-xs"
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
                          s.cancelled > 8
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
