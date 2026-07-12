"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { Logo } from "@/components/features/auth/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginEmail, loginSso } from "@/lib/api";

interface FormErrors {
  email?: string;
  password?: string;
}

const isDev = process.env.NODE_ENV !== "production";

// Mock users - fallback saat backend tidak tersedia (hanya dev)
const mockUsers = isDev
  ? [
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
    ]
  : [];

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!password) {
      newErrors.password = "Password wajib diisi";
    } else if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setErrors({});

    if (!validateForm()) {
      return;
    }

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
      // Parse backend error for field-level details
      if (err.details && Array.isArray(err.details)) {
        const fieldErrors: FormErrors = {};
        err.details.forEach((d: any) => {
          if (d.field === "email") fieldErrors.email = d.message;
          if (d.field === "password") fieldErrors.password = d.message;
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }
      }
      // Generic error message
      if (err.status === 401) {
        setError("Email atau password salah. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }
      if (err.status === 422 || err.status === 400) {
        setError(err.message || "Input tidak valid. Silakan periksa form.");
        setIsLoading(false);
        return;
      }
    }

    // Fallback ke mock login (dev only)
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
    <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 md:min-h-screen md:overflow-auto">
      <div className="w-full max-w-md flex flex-col justify-center h-full max-h-[600px] md:h-auto md:max-h-none md:bg-white md:p-10 md:shadow-lg md:border md:border-gray-100">
        <Logo className="mb-4 md:mb-8 scale-90 md:scale-100 origin-center" />

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
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            required
          />

          <Input
            id="password"
            type="password"
            label="Masukkan Kata Sandi"
            placeholder="Masukkan Kata Sandi"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
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

          <div className="flex w-full gap-[10px] pt-1 md:pt-0">
            <Button
              type="submit"
              variant="primary"
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

        {isDev && (
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
        )}
      </div>
    </div>
  );
}
