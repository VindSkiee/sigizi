"use client";

import { useEffect, useState } from "react";
import { Info, Check } from "lucide-react";

export function DemoNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Cek apakah env mode demo aktif
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

    

    if (isDemoMode) {
      setIsOpen(true);
      document.body.style.overflow = "hidden"; // Mencegah scroll di background
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
    sessionStorage.setItem("demo_notice_seen", "true");
  };

  // Mencegah hydration mismatch error di Next.js
  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Darkened & Blurred Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-[0_24px_40px_-12px_rgba(0,0,0,0.15)] p-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Minimalist Icon */}
        <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <Info className="w-6 h-6 text-gray-900 stroke-[1.5]" /> 
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight px-2">
            Sistem dalam Mode Simulasi
          </h2>
        </div>

        {/* Content */}

        <div className="text-[15px] text-gray-500 leading-relaxed mb-8 space-y-3">
          <p>
            Anda saat ini mengakses lingkungan{" "}
            <span className="font-medium text-gray-900">Demonstrasi</span>.
          </p>
          <p>
            Semua data transaksi, identitas supplier, pesanan, dan metrik
            keuangan yang ditampilkan adalah
            <span className="font-medium text-gray-900">
              {" "}
              data fiktif (palsu)
            </span>{" "}
            yang dibuat khusus untuk keperluan uji coba dan evaluasi fitur.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleClose}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all focus:outline-none focus:ring-4 focus:ring-green-200"
        >
          <Check className="w-4 h-4" strokeWidth={2.5} />
          Ya, saya mengerti
        </button>
      </div>
    </div>
  );
}
