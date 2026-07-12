"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { handleSsoCallback } from "@/lib/api";

export default function SsoRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = searchParams.get("state") || "";
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const mockUser = {
    name: "Budi Santoso",
    email: "admin@sppg.go.id",
    role: "SPPG_ADMIN",
    nip: "198501012010011001",
    institution: "SPPG Purwakarta",
  };

  async function handleAuthorize() {
    setStatus("processing");
    try {
      const response = await handleSsoCallback("mock-auth-code", state);
      if (response.success) {
        const data = response.data as { token: string; user: any };
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href =
          data.user.role === "SUPPLIER" ? "/supplier" : "/admin";
      } else {
        setStatus("error");
        setErrorMessage("Gagal melakukan autentikasi. Silakan coba lagi.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(
        err.message || "Gagal melakukan autentikasi. Silakan coba lagi.",
      );
    }
  }

  function handleCancel() {
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* BGN Portal Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-700 px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-xl p-3 shadow-md">
                <Image
                  src="/bgn_logo.png"
                  alt="BGN Logo"
                  width={64}
                  height={64}
                  className="h-16 w-auto"
                  priority
                />
              </div>
            </div>
            <h1 className="text-white text-lg font-bold">
              Kementerian Pangan Republik Indonesia
            </h1>
            <p className="text-green-100 text-sm mt-1">Single Sign-On (SSO)</p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Permintaan Autentikasi
              </h2>
              <p className="text-sm text-gray-500">
                Aplikasi{" "}
                <span className="font-semibold text-gray-700">SIGIZI</span>{" "}
                meminta akses ke akun Anda
              </p>
            </div>

            {/* User Info Card */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-lg">
                    {mockUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {mockUser.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {mockUser.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    NIP: {mockUser.nip}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Instansi:</span>{" "}
                  {mockUser.institution}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-medium">Peran:</span> Admin SPPG
                </p>
              </div>
            </div>

            {/* Permissions */}
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Akses yang diminta:
              </p>
              <ul className="space-y-1.5">
                {[
                  "Melihat data batch makanan",
                  "Mengelola data supplier",
                  "Menganalisis harga pasar",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="w-4 h-4 text-green-500 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Error message */}
            {status === "error" && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAuthorize}
                disabled={status === "processing"}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {status === "processing" ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  "Authorize"
                )}
              </button>

              <button
                onClick={handleCancel}
                disabled={status === "processing"}
                className="w-full py-3 px-4 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-600 font-medium rounded-xl border border-gray-300 transition-colors duration-200"
              >
                Batal
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              SSO BGN © 2026 Kementerian Pangan RI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
