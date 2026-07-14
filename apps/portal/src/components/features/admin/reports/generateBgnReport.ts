import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { InvoiceRow, ReportStats, ReportFilter } from "./types";

interface SppgInfo {
  name?: string;
  address?: string;
  regency?: string;
  province?: string;
}

function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  return `Rp ${amount}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateID(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function generateBgnReport(
  rows: InvoiceRow[],
  stats: ReportStats,
  filter: ReportFilter,
  sppg?: SppgInfo
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // ─── HEADER ──────────────────────────────────────────────
  // Garis atas
  doc.setDrawColor(30, 58, 138); // blue-900
  doc.setLineWidth(0.8);
  doc.line(margin, 12, pageWidth - margin, 12);

  // Garuda placeholder
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(margin, 16, 10, 10, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text("BGN", margin + 5, 22.5, { align: "center" });

  // Judul
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN PENGELUARAN DANA BGN", margin + 14, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Bantuan Gizi Nasional - Sistem Informasi Gizi Terintegrasi", margin + 14, 25);

  // Garis bawah header
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.3);
  doc.line(margin, 30, pageWidth - margin, 30);

  // ─── INFO SPPG & PERIODE ────────────────────────────────
  let y = 36;

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("SPPG:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(sppg?.name || "Tidak diketahui", margin + 25, y);

  y += 5;
  if (sppg?.address || sppg?.regency) {
    doc.setFont("helvetica", "bold");
    doc.text("Alamat:", margin, y);
    doc.setFont("helvetica", "normal");
    const addr = [sppg.address, sppg.regency, sppg.province].filter(Boolean).join(", ");
    doc.text(addr, margin + 25, y);
    y += 5;
  }

  doc.setFont("helvetica", "bold");
  doc.text("Periode:", margin, y);
  doc.setFont("helvetica", "normal");
  const periode =
    filter.periodType === "daily"
      ? formatDateID(filter.date)
      : filter.weekLabel || `${formatDateID(filter.weekStart || "")} - Mingguan`;
  doc.text(periode, margin + 25, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Tanggal Cetak:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatDateID(new Date().toISOString().slice(0, 10)), margin + 25, y);

  // ─── RINGKASAN ───────────────────────────────────────────
  y += 10;

  doc.setFillColor(30, 58, 138);
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RINGKASAN", margin + 4, y + 5.5);

  y += 12;

  // 4 kotak ringkasan
  const boxWidth = (contentWidth - 12) / 4;
  const boxHeight = 22;
  const summaryItems = [
    { label: "Total Pengeluaran", value: formatCurrencyShort(stats.totalPengeluaran), sub: `${stats.invoiceCount} Invoice` },
    { label: "Input Tambahan", value: formatCurrencyShort(stats.totalTambahan), sub: "Biaya operasional" },
    { label: "Total Porsi", value: `${stats.totalPorsi.toLocaleString("id-ID")}`, sub: "Porsi terkirim" },
    {
      label: "Total Keseluruhan",
      value: formatCurrencyShort(stats.totalPengeluaran + stats.totalTambahan),
      sub: "Pengeluaran + Tambahan",
    },
  ];

  summaryItems.forEach((item, i) => {
    const x = margin + i * (boxWidth + 4);
    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(x, y, boxWidth, boxHeight, 1, 1, "FD");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(item.label.toUpperCase(), x + 3, y + 5);

    doc.setTextColor(30, 58, 138);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, x + 3, y + 13);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(item.sub, x + 3, y + 18);
  });

  y += boxHeight + 10;

  // ─── TABEL RINCIAN ───────────────────────────────────────
  // Section title
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RINCIAN PENGELUARAN", margin + 4, y + 5.5);

  y += 12;

  // Prepare table data
  const tableBody = rows.map((row, i) => [
    (i + 1).toString(),
    formatShortDate(row.date),
    row.ref,
    row.supplierName || "-",
    row.category.length > 30 ? row.category.slice(0, 28) + "..." : row.category,
    formatCurrency(row.nominal),
    row.isManual ? "Manual" : "Sistem",
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["No", "Tanggal", "Ref", "Supplier", "Kategori", "Nominal", "Status"]],
    body: tableBody,
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      textColor: [51, 51, 51],
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 2.5,
      halign: "center",
    },
    bodyStyles: {
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "center", cellWidth: 22 },
      2: { halign: "center", cellWidth: 22 },
      3: { cellWidth: 35 },
      4: { cellWidth: 45 },
      5: { halign: "right", cellWidth: 28 },
      6: { halign: "center", cellWidth: 18 },
    },
    didDrawPage: (data) => {
      // Footer setiap halaman
      const pageH = doc.internal.pageSize.height;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(margin, pageH - 20, pageWidth - margin, pageH - 20);

      doc.setTextColor(150, 150, 150);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Dokumen ini dihasilkan otomatis oleh SIGIZI - Sistem Informasi Gizi Terintegrasi",
        margin,
        pageH - 15
      );
      doc.text(`Halaman ${(doc.internal as any).getNumberOfPages()}`, pageWidth - margin, pageH - 15, {
        align: "right",
      });
    },
  });

  // ─── TOTAL BARIS ─────────────────────────────────────────
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || y + 50;

  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(margin, finalY + 3, contentWidth, 10, 1, 1, "FD");

  doc.setTextColor(30, 58, 138);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PENGELUARAN", margin + 4, finalY + 10);
  doc.text(formatCurrency(stats.totalPengeluaran + stats.totalTambahan), pageWidth - margin - 4, finalY + 10, {
    align: "right",
  });

  // ─── TANDA TANGAN ────────────────────────────────────────
  let signY = finalY + 25;

  // Check if we need a new page
  if (signY > 250) {
    doc.addPage();
    signY = 30;
  }

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Mengetahui,", margin, signY);

  signY += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Kepala SPPG", margin, signY);
  doc.text("Admin Keuangan", pageWidth - margin - 40, signY);

  signY += 18;
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);

  // Garis tanda tangan kiri
  doc.line(margin + 10, signY, margin + 50, signY);
  // Garis tanda tangan kanan
  doc.line(pageWidth - margin - 50, signY, pageWidth - margin - 10, signY);

  signY += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(sppg?.name || "Kepala SPPG", margin + 30, signY, { align: "center" });
  doc.text("(___________________)", pageWidth - margin - 30, signY, { align: "center" });

  signY += 5;
  doc.setFont("helvetica", "normal");
  doc.text("(___________________)", margin + 30, signY, { align: "center" });

  // ─── SAVE ────────────────────────────────────────────────
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const fileName = `Laporan_BGN_${dateStr}.pdf`;

  doc.save(fileName);
}
