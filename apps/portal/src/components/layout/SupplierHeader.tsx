'use client';

import { useAuth } from '@/contexts/AuthContext';

export function SupplierHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Beranda Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Company Info */}
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">
            {user?.name || 'PT Sumber Makmur'}
          </p>
          <p className="text-xs text-gray-500">ID: SUP-9921</p>
        </div>

        {/* Avatar + Logout */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-700">
              {user?.name?.charAt(0) || 'S'}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
