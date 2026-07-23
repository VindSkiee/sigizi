"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/features/auth/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { loginEmail, loginSso } from "@/lib/api";

const isDev = process.env.NODE_ENV === "development";

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginFormProps {
  prefillEmail?: string;
  prefillPassword?: string;
}

export function LoginForm({ prefillEmail, prefillPassword }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const submittedRef = useRef<string | null>(null);

  async function performLogin(emailVal: string, passwordVal: string) {
    setIsLoading(true);
    setError("");
    setErrors({});

    try {
      const response = await loginEmail(emailVal, passwordVal);
      if (response.success) {
        const data = response.data as { token: string; user: any };
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href =
          data.user.role === "SUPPLIER" ? "/supplier" : "/admin";
        return;
      }
    } catch (err: any) {
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
      if (err.status === 401) {
        setError("Email atau password salah. Silakan coba lagi.");
      } else if (err.status === 422 || err.status === 400) {
        setError(err.message || "Input tidak valid. Silakan periksa form.");
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (
      prefillEmail &&
      prefillPassword &&
      submittedRef.current !== prefillEmail
    ) {
      submittedRef.current = prefillEmail;
      setEmail(prefillEmail);
      setPassword(prefillPassword);
      performLogin(prefillEmail, prefillPassword);
    }
  }, [prefillEmail, prefillPassword]);

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

    await performLogin(email, password);
  }

  async function handleSsoLogin() {
    setIsSsoLoading(true);
    setError("");
    try {
      const response = await loginSso("init", "state");
      if (response.success) {
        const data = response.data as { redirectUrl: string };
        window.location.href = data.redirectUrl;
      }
    } catch (err: any) {
      setError("SSO tidak tersedia. Silakan login dengan email.");
      setIsSsoLoading(false);
    }
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 md:min-h-screen md:overflow-auto">
      <div className="relative w-full max-w-md flex flex-col justify-center h-full max-h-[600px] md:h-auto md:max-h-none md:p-10 md:rounded-[2.5rem] md:bg-white/95 md:backdrop-blur-2xl md:border md:border-white md:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.05),_0_12px_24px_-8px_rgba(34,197,94,0.08)] md:ring-1 md:ring-gray-900/5">
        {/* Aksen Highlight Cahaya (Muncul di layar md ke atas) */}
        <div className="hidden md:block absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
        <Logo className="mb-4 md:mb-8 scale-90 md:scale-100 origin-center" />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-3 md:space-y-5"
        >
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

          {process.env.NEXT_PUBLIC_DEMO_MODE !== "true" && (
            <div className="flex justify-end pt-1">
              <Link
                href="/forgot-password"
                className="text-xs md:text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
          )}

          <div className="flex w-full gap-[10px] pt-1 md:pt-0">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="flex-1 py-2 md:py-2.5 text-sm md:text-base"
            >
              Login
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleSsoLogin}
              isLoading={isSsoLoading}
              className="flex-1 py-2 md:py-2.5 text-sm md:text-base gap-1.5"
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
            href="/auth/register"
            onClick={() => {
              document.body.classList.add("hide-toploader");
              sessionStorage.setItem("auth-slide", "left");
            }}
            className="text-primary-600 font-semibold hover:underline cursor-pointer"
          >
            Klik disini
          </Link>
        </p>

        {isDev && process.env.NEXT_PUBLIC_DEMO_MODE !== "true" && (
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
