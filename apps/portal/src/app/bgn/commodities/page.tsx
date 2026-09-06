"use client";

import { useState } from "react";
import {
  commodities,
  commodityPriceData,
  formatRupiah,
  deviationColor,
  deviationBg,
} from "@/lib/bgn-mock-data";
import AreaChart from "@/components/features/bgn/common/AreaChart";

export default function BgnCommodityPage() {
  const [selectedId, setSelectedId] = useState("c1");

  const commodity = commodities.find((c) => c.id === selectedId)!;
  const priceData = commodityPriceData[selectedId] || commodityPriceData["c1"];

  const refPrice = commodity.referencePrice;
  const prices = priceData.regionalComparison.map((r) => r.avgPrice);
  const avgPrice = Math.round(
    prices.reduce((a, b) => a + b, 0) / prices.length,
  );
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const medianPrice = [...prices].sort((a, b) => a - b)[
    Math.floor(prices.length / 2)
  ];
  const devPct = ((avgPrice - refPrice) / refPrice) * 100;

  const historicData = priceData.historicalPrices.map((p) => ({
    label: p.month,
    value: p.price,
  }));

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
          Komoditas &amp; Intelijen Harga
        </h1>
        <p
          className="text-sm mt-0.5"
          style={{ color: "var(--text-secondary)" }}
        >
          Pantau harga pengadaan terhadap harga referensi komoditas
        </p>
      </div>

      {/* Commodity Selector */}
      <div
        className="rounded-lg p-3 flex gap-2 flex-wrap"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        {commodities.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            className="text-xs font-semibold px-3 py-2 rounded-md transition-colors"
            style={{
              background: selectedId === c.id ? "var(--accent)" : "var(--bg)",
              color: selectedId === c.id ? "#fff" : "var(--text-secondary)",
              fontFamily: "var(--font-body)",
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Price Stats + Trend + Distribution */}
      <div className="grid grid-cols-3 gap-4">
        {/* Stats Card */}
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
            {commodity.name}
          </div>
          <div
            className="text-xs mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {commodity.category} · per {commodity.unit}
          </div>

          <div className="space-y-3">
            {[
              {
                label: "Harga Referensi",
                value: formatRupiah(refPrice) + "/" + commodity.unit,
                color: "var(--blue)",
                bold: true,
              },
              {
                label: "Rata-rata Transaksi",
                value: formatRupiah(avgPrice) + "/" + commodity.unit,
                color: "var(--text-primary)",
                bold: true,
              },
              {
                label: "Minimum",
                value: formatRupiah(minPrice),
                color: "var(--green)",
              },
              {
                label: "Maksimum",
                value: formatRupiah(maxPrice),
                color: "var(--red)",
              },
              {
                label: "Median",
                value: formatRupiah(medianPrice),
                color: "var(--text-secondary)",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center text-xs border-b pb-2"
                style={{ borderColor: "var(--border)" }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {row.label}
                </span>
                <span
                  className={row.bold ? "font-bold" : "font-semibold"}
                  style={{ color: row.color, fontFamily: "var(--font-mono)" }}
                >
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: "var(--text-secondary)" }}>
                Deviasi Rata-rata
              </span>
              <span
                className="font-bold px-2 py-0.5 rounded-full"
                style={{
                  color: deviationColor(devPct),
                  background: deviationBg(devPct),
                  fontFamily: "var(--font-mono)",
                }}
              >
                {devPct > 0 ? "+" : ""}
                {devPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Price Trend */}
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
            Tren Harga
          </div>
          <div
            className="text-xs mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            6 bulan terakhir
          </div>
          <AreaChart
            data={historicData}
            color={devPct >= 10 ? "#D97706" : "#1B4FBE"}
            height={140}
            formatValue={(v) => formatRupiah(v)}
          />
          <div
            className="mt-2 flex items-center gap-2 text-xs"
            style={{ color: "var(--blue)" }}
          >
            <div
              className="w-4 h-0.5 border-t-2 border-dashed"
              style={{ borderColor: "var(--blue)" }}
            />
            Referensi: {formatRupiah(refPrice)}/{commodity.unit}
          </div>
        </div>

        {/* Deviation Distribution */}
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
            Distribusi Deviasi Harga
          </div>
          <div
            className="text-xs mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Sebaran transaksi terhadap harga referensi
          </div>
          <div className="space-y-3">
            {priceData.distribution.map((d) => (
              <div key={d.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span
                    style={{ color: "var(--text-primary)", fontWeight: 500 }}
                  >
                    {d.label}
                  </span>
                  <span
                    style={{
                      color: d.color,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                    }}
                  >
                    {d.pct}%
                  </span>
                </div>
                <div
                  className="w-full h-4 rounded-sm overflow-hidden"
                  style={{ background: "var(--bg)" }}
                >
                  <div
                    className="h-full rounded-sm transition-all duration-500"
                    style={{
                      width: `${d.pct}%`,
                      background: d.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 text-xs rounded-md p-2"
            style={{
              background: "var(--accent-light)",
              color: "var(--accent)",
            }}
          >
            Deviasi tinggi (&gt;20%):{" "}
            {priceData.distribution.find((d) => d.label.includes("Tinggi"))
              ?.pct ?? 0}
            % transaksi — perlu investigasi lebih lanjut.
          </div>
        </div>
      </div>

      {/* Regional Comparison Table */}
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
            Perbandingan Harga Regional — {commodity.name}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Rata-rata harga transaksi vs harga referensi per wilayah
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              {[
                "Wilayah",
                "Jumlah Transaksi",
                "Rata-rata Harga",
                "Harga Referensi",
                "Deviasi",
                "",
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
            {priceData.regionalComparison.map((r) => {
              const dev = ((r.avgPrice - refPrice) / refPrice) * 100;
              const devCol = deviationColor(dev);
              const devBg2 = deviationBg(dev);
              return (
                <tr
                  key={r.region}
                  className="border-t"
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
                    {r.txCount.toLocaleString("id-ID")}
                  </td>
                  <td
                    className="px-5 py-3 font-semibold"
                    style={{
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatRupiah(r.avgPrice)}/{commodity.unit}
                  </td>
                  <td
                    className="px-5 py-3 text-sm"
                    style={{
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatRupiah(refPrice)}/{commodity.unit}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        color: devCol,
                        background: devBg2,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {dev > 0 ? "+" : ""}
                      {dev.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {dev >= 20 && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "#FEF2F2", color: "var(--red)" }}
                      >
                        Tinjau
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
