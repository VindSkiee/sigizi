"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  ClipboardList,
  FileText,
  Building2,
  Globe,
} from "lucide-react";

const allNavigation = [
  { name: "Dashboard", href: "/supplier", icon: Home },
  { name: "Katalog Produk", href: "/supplier/katalog", icon: Package },
  { name: "Pesanan Baru", href: "/supplier/pesanan", icon: ClipboardList },
  { name: "MoU Aktif", href: "/supplier/mou", icon: FileText, devOnly: false },
  { name: "Profil", href: "/supplier/profil", icon: Building2 },
];

const navigation =
  process.env.NODE_ENV === "development"
    ? allNavigation.filter((item) => item.devOnly !== false)
    : allNavigation;

export function SupplierSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30">

      {/* Navigation */}
      <nav className="mt-6 px-3">
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
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary-600" : "text-gray-400",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* SPPG Network Badge */}
      <div className="absolute bottom-6 left-3 right-3">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5" />
            <span className="text-sm font-medium">SPPG Network</span>
          </div>
          <p className="text-xs text-primary-100">Terhubung dengan 5 SPPG</p>
        </div>
      </div>
    </aside>
  );
}
