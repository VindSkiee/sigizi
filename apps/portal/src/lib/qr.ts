import QRCode from "qrcode";

const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";

function cleanBatchNumber(batchNumber: string): string {
  return batchNumber.replace(/^#/, "");
}

export function getBatchVerifyUrl(batchNumber: string): string {
  const clean = cleanBatchNumber(batchNumber);
  return `${PORTAL_URL}/batch/verify/${clean}`;
}

export async function downloadQrAsJpg(url: string, filename: string) {
  const canvas = await QRCode.toCanvas(url, {
    width: 400,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });

  return new Promise<void>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve();
          return;
        }
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        resolve();
      },
      "image/jpeg",
      0.95,
    );
  });
}

export async function getQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}
