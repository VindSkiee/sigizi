import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { createHash } from "crypto";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { dirname } from "path";
import { OfficialReportPayload, FinancialLogEntry } from "../reports.types";

@Injectable()
export class PdfGeneratorService {
  async generateReportPdf(report: OfficialReportPayload, outputPath: string) {
    await mkdir(dirname(outputPath), { recursive: true });

    return new Promise<{ pdfPath: string; pdfHash: string }>((resolve, reject) => {
      const document = new PDFDocument({ margin: 40, size: "A4" });
      const fileStream = createWriteStream(outputPath);
      const hash = createHash("sha256");

      document.on("data", (chunk) => hash.update(chunk));
      document.on("error", reject);
      fileStream.on("error", reject);
      fileStream.on("finish", () => {
        resolve({
          pdfPath: outputPath,
          pdfHash: hash.digest("hex"),
        });
      });

      document.pipe(fileStream);

      this.renderHeader(document, report);
      this.renderSummary(document, report);
      this.renderSection(document, "COGS / Biaya Riil Makanan", report.breakdown.cogs.items);
      this.renderSection(document, "Procurement / Pembelian Stok", report.breakdown.procurement.items);
      this.renderSection(document, "OpEx / Pengeluaran Operasional", report.breakdown.opex.items);

      document.end();
    });
  }

  private renderHeader(document: PDFKit.PDFDocument, report: OfficialReportPayload) {
    document.fontSize(18).text("SIGIZI - LAPORAN RESMI", { align: "center" });
    document.moveDown(0.4);
    document.fontSize(12).text(`SPPG: ${report.sppgName ?? report.sppgId}`, { align: "center" });
    document.text(`Periode: ${report.startDate} s.d. ${report.endDate}`, { align: "center" });
    document.text(`Jenis: ${report.type}`, { align: "center" });
    document.moveDown(1);
  }

  private renderSummary(document: PDFKit.PDFDocument, report: OfficialReportPayload) {
    document.fontSize(13).text("Ringkasan Performa Anggaran", { underline: true });
    document.moveDown(0.5);

    const rows = [
      ["Target Anggaran", `Rp ${(report.totals.totalPortions * 10000).toLocaleString("id-ID")}`],
      ["Aktual COGS", `Rp ${report.totals.totalCogs.toLocaleString("id-ID")}`],
      ["Procurement", `Rp ${report.totals.totalProcured.toLocaleString("id-ID")}`],
      ["OpEx", `Rp ${report.totals.totalOpex.toLocaleString("id-ID")}`],
      ["Budget Variance", `Rp ${report.totals.budgetVariance.toLocaleString("id-ID")}`],
    ];

    rows.forEach(([label, value]) => {
      document.fontSize(10).text(`${label}: ${value}`);
    });

    document.moveDown(0.75);
  }

  private renderSection(
    document: PDFKit.PDFDocument,
    title: string,
    items: FinancialLogEntry[],
  ) {
    document.fontSize(13).text(title, { underline: true });
    document.moveDown(0.25);

    if (!items.length) {
      document.fontSize(10).text("Tidak ada data pada periode ini.");
      document.moveDown(0.5);
      return;
    }

    this.renderTableHeader(document);
    items.forEach((item) => this.renderTableRow(document, item));
    document.moveDown(0.75);
  }

  private renderTableHeader(document: PDFKit.PDFDocument) {
    const top = document.y;
    const columns = [40, 110, 280, 440, 510];

    document.rect(40, top, 515, 18).stroke();
    document.fontSize(9).text("Tanggal", columns[0], top + 4);
    document.text("Sumber", columns[1], top + 4);
    document.text("Deskripsi", columns[2], top + 4);
    document.text("Referensi", columns[3], top + 4);
    document.text("Nominal", columns[4], top + 4, { width: 55, align: "right" });
    document.moveDown(1.2);
  }

  private renderTableRow(document: PDFKit.PDFDocument, item: FinancialLogEntry) {
    const top = document.y;
    const columns = [40, 110, 280, 440, 510];
    const rowHeight = 26;

    document.rect(40, top, 515, rowHeight).stroke();
    document.fontSize(8).text(item.date.slice(0, 10), columns[0], top + 4, { width: 60 });
    document.text(item.source, columns[1], top + 4, { width: 100 });
    document.text(item.title, columns[2], top + 4, { width: 145 });
    document.text(item.referenceId.slice(0, 12), columns[3], top + 4, { width: 60 });
    document.text(`Rp ${item.amount.toLocaleString("id-ID")}`, columns[4], top + 4, {
      width: 55,
      align: "right",
    });
    document.moveDown(1.5);
  }
}
