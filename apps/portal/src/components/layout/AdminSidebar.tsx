"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Utensils,
  Users,
  FileText,
  Package,
  AlertTriangle,
  UserCircle,
  LogOut,
  Store,
  ShoppingCart,
  Home,
} from "lucide-react";

const navigation = [
  { name: "Beranda", href: "/admin", icon: Home },
  { name: "Penerima Manfaat", href: "/admin/beneficiaries", icon: Users },
  { name: "Batch Makanan", href: "/admin/batches", icon: Utensils },
  { name: "Keranjang Pesanan", href: "/admin/suppliers", icon: ShoppingCart },
  { name: "Pasar Bahan Baku", href: "/admin/market", icon: Store },
  { name: "Inventaris", href: "/admin/inventory", icon: Package },
  { name: "Laporan Keuangan", href: "/admin/reports", icon: FileText },
  { name: "Komplain", href: "/admin/complaints", icon: AlertTriangle },
  { name: "Profil", href: "/admin/profile", icon: UserCircle },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userName = user?.name || "User";
  const sppgName = user?.sppg?.name || "SPPG";
  const userInitials = user?.name ? getInitials(user.name) : "U";

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <Image src="/logo.png" alt="SIGIZI" width={140} height={32} priority />
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-[#1E40AF]" : "text-gray-400",
                  )}
                />
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
              <span className="font-semibold">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{userName}</p>
              <p className="text-xs text-blue-100 truncate">{sppgName}</p>
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
