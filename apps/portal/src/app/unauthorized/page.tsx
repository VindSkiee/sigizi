"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-red-500">403</div>
        <h1 className="text-xl font-semibold text-gray-800">Akses Ditolak</h1>
        <p className="text-sm text-gray-500 max-w-sm">
          Anda tidak memiliki hak akses ke halaman ini. Silakan login dengan
          akun yang sesuai.
        </p>
        <Link
          href="/auth/login"
          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
