"use client";

import { ErrorBoundary } from "../ui/ErrorBoundary";
import { ReactNode } from "react";

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
}

export function PageErrorBoundary({
  children,
  pageName = "halaman",
}: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Gagal Memuat {pageName}
            </h2>
            <p className="text-gray-500 mb-4">
              Terjadi kesalahan saat memuat data. Silakan coba lagi.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
