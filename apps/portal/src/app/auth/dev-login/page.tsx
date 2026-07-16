"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDevUsers, devLogin } from "@/lib/api";

interface DevUser {
  id: string;
  name: string;
  email: string;
  role: string;
  sppg?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
}

function DevLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "SPPG_ADMIN";

  const [users, setUsers] = useState<DevUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await getDevUsers(role);
        if (response.success) {
          setUsers(response.data as DevUser[]);
        } else {
          setError("Gagal memuat daftar user");
        }
      } catch (err: any) {
        setError(err.message || "Pastikan backend berjalan");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [role]);

  async function handleLogin(userId: string) {
    setLoggingIn(userId);
    setError("");
    try {
      const response = await devLogin(role, userId);
      if (response.success) {
        const data = response.data as { token: string; user: any };
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href =
          data.user.role === "SUPPLIER" ? "/supplier" : "/admin";
      } else {
        setError("Login gagal");
      }
    } catch (err: any) {
      setError(err.message || "Login gagal");
    } finally {
      setLoggingIn(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm">Memuat daftar user...</p>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-primary-600 hover:underline"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">
            Tidak ada user dengan role{" "}
            {role === "SUPPLIER" ? "Supplier" : "Admin SPPG"}
          </p>
          <p className="text-gray-500 text-xs mb-4">
            Jalankan seed terlebih dahulu
          </p>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-primary-600 hover:underline"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Pilih Akun {role === "SUPPLIER" ? "Supplier" : "Admin SPPG"}
          </h1>
          <p className="text-sm text-gray-500">
            Ditemukan {users.length} user tersedia
          </p>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user.id)}
              disabled={loggingIn !== null}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-primary-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  {user.sppg && (
                    <p className="text-xs text-gray-400 mt-1">
                      SPPG: {user.sppg.name}
                    </p>
                  )}
                  {user.supplier && (
                    <p className="text-xs text-gray-400 mt-1">
                      Supplier: {user.supplier.name}
                    </p>
                  )}
                </div>
                {loggingIn === user.id && (
                  <span className="text-xs text-primary-600 whitespace-nowrap ml-2">
                    Logging in...
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-center text-red-600 text-sm">{error}</p>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Kembali ke Login
          </button>
        </div>
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
