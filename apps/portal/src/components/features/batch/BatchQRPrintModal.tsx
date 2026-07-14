"use client";

import { useState, useEffect } from "react";
import { X, Download, CheckCircle, Loader2 } from "lucide-react";
import { getBatchVerifyUrl, downloadQrAsJpg, getQrDataUrl } from "@/lib/qr";
import type { BatchManagement } from "./types";

interface BatchQRPrintModalProps {
  isOpen: boolean;
  batch: BatchManagement | null;
  onClose: () => void;
}

export function BatchQRPrintModal({
  isOpen,
  batch,
  onClose,
}: BatchQRPrintModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  useEffect(() => {
    if (isOpen && batch) {
      setIsGenerating(true);
      const url = getBatchVerifyUrl(batch.batchNumber);
      getQrDataUrl(url)
        .then((dataUrl) => {
          setQrDataUrl(dataUrl);
          setIsGenerating(false);
        })
        .catch(() => {
          setIsGenerating(false);
        });
    } else {
      setQrDataUrl("");
      setHasDownloaded(false);
    }
  }, [isOpen, batch]);

  useEffect(() => {
    if (qrDataUrl && !hasDownloaded && batch) {
      const url = getBatchVerifyUrl(batch.batchNumber);
      downloadQrAsJpg(url, `QR_${batch.batchNumber.replace(/#/g, "")}.jpg`)
        .then(() => {
          setHasDownloaded(true);
        })
        .catch(() => {});
    }
  }, [qrDataUrl, hasDownloaded, batch]);

  const handleDownload = async () => {
    if (!batch) return;
    setIsDownloading(true);
    try {
      const url = getBatchVerifyUrl(batch.batchNumber);
      await downloadQrAsJpg(url, `QR_${batch.batchNumber.replace(/#/g, "")}.jpg`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !batch) return null;

  const verifyUrl = getBatchVerifyUrl(batch.batchNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            QR Code Porsi
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-col items-center">
            {isGenerating ? (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-gray-500">Membuat QR Code...</p>
                </div>
              </div>
            ) : qrDataUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${batch.batchNumber}`}
                  className="w-48 h-48 rounded-lg border border-gray-200"
                />
                {hasDownloaded && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <p className="text-sm text-red-500">Gagal membuat QR</p>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="font-semibold text-gray-900">{batch.batchNumber}</p>
              <p className="text-sm text-gray-500">{batch.beneficiaryName}</p>
              <p className="text-sm text-gray-500">
                {batch.beneficiaryPortions} Porsi
              </p>
            </div>

            <div className="mt-3 w-full bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 text-center truncate">
                {verifyUrl}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading || !qrDataUrl}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download QR JPG
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
