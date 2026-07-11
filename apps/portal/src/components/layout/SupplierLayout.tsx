'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, FileText, Network, LogOut } from 'lucide-react';

interface SupplierLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: 'Dashboard', href: '/supplier', icon: LayoutDashboard },
  { name: 'Katalog Produk', href: '/supplier/katalog', icon: Package },
  { name: 'Pesanan Masuk', href: '/supplier/pesanan', icon: ShoppingCart },
  { name: 'MoU & Kontrak', href: '/supplier/mou', icon: FileText },
  { name: 'Profil', href: '/supplier/profil', icon: Network },
];

export default function SupplierLayout({ children }: SupplierLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Supplier Portal</h2>
          <p className="text-sm text-gray-500 mt-1">{user?.name || 'PT Sumber Makmur'}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Supplier Info Card */}
        <div className="p-3 border-t border-gray-200">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-semibold">SM</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name || 'PT Sumber Makmur'}</p>
                <p className="text-xs text-green-100">ID: {user?.supplierId || 'SUP-001'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
            >
              <LogOut size={14} />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
