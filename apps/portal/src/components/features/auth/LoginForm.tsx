"use client";

import { useState } from "react";
import Link from "next/link";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    setError("");
    try {
      const response = await loginSso("mock-code", "mock-state");
      if (response.success) {
        const data = response.data as { redirectUrl: string };
        window.location.href = data.redirectUrl;
      }
    } catch (err: any) {
      window.location.href = "/auth/sso-redirect?state=mock-state";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 md:p-10">
        <Logo className="mb-8" />

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
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

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Login
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-400">atau</span>
          </div>
        </div>

        <button
          onClick={handleSsoLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center gap-3"
        >
          <svg
            className="w-5 h-5 text-green-600"
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
          Login via SSO BGN
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Daftar sebagai supplier!{" "}
          <Link
            href="/register"
            className="text-primary-600 font-semibold hover:underline"
          >
            Klik disini
          </Link>
        </p>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400 mb-2">
            Dev Login (untuk testing)
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/dev-login?role=SPPG_ADMIN"
              className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
            >
              Login sebagai Admin
            </Link>
            <Link
              href="/auth/dev-login?role=SUPPLIER"
              className="text-xs text-blue-500 hover:text-blue-700 hover:underline"
            >
              Login sebagai Supplier
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
