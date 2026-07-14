'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Utensils, 
  Truck, 
  Users, 
  FileText, 
  BarChart3,
  Package,
  AlertTriangle,
  UserCircle,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Batch Makanan', href: '/admin/batches', icon: Utensils },
  { name: 'Integrasi Supplier', href: '/admin/suppliers', icon: Truck },
  { name: 'Inventaris', href: '/admin/inventory', icon: Package },
  { name: 'Komplain', href: '/admin/complaints', icon: AlertTriangle },
  { name: 'Penerima Manfaat', href: '/admin/beneficiaries', icon: Users },
  { name: 'Laporan BGN & Ekspor', href: '/admin/reports', icon: FileText },
  { name: 'Analitik Pasar', href: '/admin/market', icon: BarChart3 },
  { name: 'Profil', href: '/admin/profile', icon: UserCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <svg width="28" height="25" viewBox="0 0 28 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 3.5C10.2266 3.5 15.75 9.02344 15.75 15.75V23.625C15.75 24.1172 15.3125 24.5 14.875 24.5H13.125C12.6328 24.5 12.25 24.1172 12.25 23.625V15.75C5.46875 15.75 0 10.2812 0 3.5H3.5ZM24.5 0H28C28 6.34375 23.1875 11.5938 17.0078 12.1953C16.4062 10.0078 15.3125 7.98438 13.7812 6.34375C15.8594 2.57031 19.8516 0 24.5 0Z" fill="#10B981"/>
          </svg>
          <span className="font-bold text-gray-800 text-lg">SIGIZI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive ? 'text-[#1E40AF]' : 'text-gray-400')} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin Info Card */}
      <div className="p-3 border-t border-gray-200">
        <div className="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] rounded-lg p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="font-semibold">BS</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">Budi Santoso</p>
              <p className="text-xs text-blue-100">ID: ADM-001</p>
              <p className="text-xs text-blue-100 truncate">SPPG Purwakarta</p>
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
  );
}
