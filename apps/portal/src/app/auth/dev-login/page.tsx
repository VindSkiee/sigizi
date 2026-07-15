"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { devLogin } from "@/lib/api";

function DevLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "SPPG_ADMIN";
  const [error, setError] = useState("");

  useEffect(() => {
    async function login() {
      try {
        const response = await devLogin(role);
        if (response.success) {
          const data = response.data as { token: string; user: any };
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.location.href =
            data.user.role === "SUPPLIER" ? "/supplier" : "/admin";
        } else {
          setError("Dev login gagal. Pastikan backend berjalan.");
        }
      } catch (err: any) {
        setError(err.message || "Dev login gagal. Pastikan backend berjalan.");
      }
    }
    login();
  }, [role, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="text-center">
        {error ? (
          <div>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-primary-600 hover:underline"
            >
              Kembali ke Login
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 text-sm">
              Melakukan login sebagai{" "}
              {role === "SUPPLIER" ? "Supplier" : "Admin SPPG"}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DevLoginPage() {
  return (
    <Suspense fallback={null}>
      <DevLoginContent />
    </Suspense>
  );
}
