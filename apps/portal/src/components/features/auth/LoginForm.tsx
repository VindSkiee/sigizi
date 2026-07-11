"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { Logo } from "@/components/features/auth/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { loginEmail, loginSso } from "@/lib/api";

const mockUsers = [
  {
    email: "supplier@sumbermakmur.com",
    password: "supplier123",
    user: {
      id: "sup-001",
      email: "supplier@sumbermakmur.com",
      name: "PT Sumber Makmur",
      role: "SUPPLIER",
      supplierId: "sup-9921",
    },
  },
  {
    email: "admin@sppg.go.id",
    password: "admin123",
    user: {
      id: "admin-001",
      email: "admin@sppg.go.id",
      name: "Budi Santoso",
      role: "SPPG_ADMIN",
      sppgId: "sppg-001",
    },
  },
];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await loginEmail(email, password);
      if (response.success) {
        const data = response.data as { token: string; user: any };
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href =
          data.user.role === "SUPPLIER" ? "/supplier" : "/admin";
        return;
      }
    } catch (err: any) {
      console.log("Backend tidak tersedia:", err.message);
    }

    const mockUser = mockUsers.find(
      (u) => u.email === email && u.password === password,
    );

    if (mockUser) {
      const mockToken = "mock-token-" + Date.now();
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser.user));
      window.location.href =
        mockUser.user.role === "SUPPLIER" ? "/supplier" : "/admin";
    } else {
      setError("Email atau password salah. Silakan coba lagi.");
      setIsLoading(false);
    }
  }

  async function handleSsoLogin() {
    setIsSsoLoading(true);
    setError("");
    try {
      const response = await loginSso("mock-code", "mock-state");
      if (response.success) {
        const data = response.data as { redirectUrl: string };
        window.location.href = data.redirectUrl;
      }
    } catch (err: any) {
      router.push("/auth/sso-redirect?state=mock-state");
    }
  }

  return (
    // Menggunakan h-[100dvh] dan overflow-hidden untuk mencegah scroll di mobile
    <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 md:min-h-screen md:overflow-auto">
      {/* Di mobile: tidak ada border, shadow, dan background (menyalatu dengan page). Di md (desktop): tampil sebagai Card */}
      <div className="w-full max-w-md flex flex-col justify-center h-full max-h-[600px] md:h-auto md:max-h-none md:bg-white md:p-10 md:shadow-lg md:border md:border-gray-100">
        {/* Logo diperkecil marginnya pada layar mobile */}
        <Logo className="mb-4 md:mb-8 scale-90 md:scale-100 origin-center" />

        {/* Jarak antar form-group diperrapat dari space-y-5 menjadi space-y-3 di mobile */}
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-5">
          {error && (
            <div className="p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg text-xs md:text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            id="email"
            type="email"
            label="Masukkan Email"
            placeholder="contoh: budi@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            // Catatan: Jika komponen Input Anda mendukung props ukuran/className, ukurannya disesuaikan di dalam komponen Input tersebut
          />

          <Input
            id="password"
            type="password"
            label="Masukkan Kata Sandi"
            placeholder="Masukkan Kata Sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end pt-1">
            <Link
              href="/forgot-password"
              className="text-xs md:text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>

          {/* Tombol bersebelahan dengan tinggi (padding) yang disesuaikan di mobile */}
          <div className="flex w-full gap-[10px] pt-1 md:pt-0">
            <Button
              type="submit"
              variant="primary"
              // Di mobile gunakan size medium (atau default), di desktop size lg
              size="lg"
              isLoading={isLoading}
              className="flex-1 py-2 md:py-3 text-sm md:text-base"
            >
              Login
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleSsoLogin}
              isLoading={isSsoLoading}
              className="flex-1 py-2 md:py-3 text-sm md:text-base gap-1.5"
            >
              <svg
                className="w-4 h-4 md:w-4 md:h-4 text-green-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              SSO BGN
            </Button>
          </div>
        </form>

        <p className="mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-600">
          Daftar sebagai supplier!{" "}
          <Link
            href="/register"
            className="text-primary-600 font-semibold hover:underline"
          >
            Klik disini
          </Link>
        </p>

        {/* Area Dev Login dengan jarak atas dan font yang lebih compact */}
        <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-gray-100">
          <p className="text-center text-[10px] md:text-xs text-gray-400 mb-1.5 md:mb-2">
            Dev Login (untuk testing)
          </p>
          <div className="flex justify-center gap-3 md:gap-4">
            <Link
              href="/auth/dev-login?role=SPPG_ADMIN"
              className="text-[11px] md:text-xs text-blue-500 hover:text-blue-700 hover:underline"
            >
              Login sebagai Admin
            </Link>
            <Link
              href="/auth/dev-login?role=SUPPLIER"
              className="text-[11px] md:text-xs text-blue-500 hover:text-blue-700 hover:underline"
            >
              Login sebagai Supplier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
