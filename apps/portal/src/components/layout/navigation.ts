import type { LucideIcon } from "lucide-react";
import {
  Home,
  ShoppingCart,
  Store,
  FileText,
  UserCircle,
  LayoutDashboard,
  Package,
  Building2,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  devOnly?: boolean;
}

export interface SidebarTheme {
  /** Classes for the active nav link container, e.g. "bg-blue-50 text-blue-700" */
  activeItem: string;
  /** Classes for the active nav icon color, e.g. "text-[#1E40AF]" */
  activeIcon: string;
  /** Gradient classes for the user card, e.g. "from-[#1E40AF] to-[#2563EB]" */
  cardGradient: string;
}

export interface UserCard {
  name: string;
  subtitle?: string;
  initials: string;
}

// ============================================================================
// Admin (SPPG) navigation + theme
// ============================================================================

export const adminNavigation: NavItem[] = [
  { name: "Beranda", href: "/admin", icon: Home },
  { name: "Keranjang Pesanan", href: "/admin/suppliers", icon: ShoppingCart },
  { name: "Pasar Bahan Baku", href: "/admin/market", icon: Store },
  { name: "Laporan Keuangan", href: "/admin/reports", icon: FileText },
  { name: "Profil", href: "/admin/profile", icon: UserCircle },
];

export const adminTheme: SidebarTheme = {
  activeItem: "bg-blue-50 text-blue-700",
  activeIcon: "text-[#1E40AF]",
  cardGradient: "from-[#1E40AF] to-[#2563EB]",
};

// ============================================================================
// Supplier navigation + theme
// ============================================================================

const allSupplierNavigation: NavItem[] = [
  { name: "Dashboard", href: "/supplier", icon: LayoutDashboard },
  { name: "Katalog Produk", href: "/supplier/katalog", icon: Package },
  { name: "Pesanan Masuk", href: "/supplier/pesanan", icon: ShoppingCart },
  { name: "MoU & Kontrak", href: "/supplier/mou", icon: FileText, devOnly: true },
  { name: "Profil", href: "/supplier/profil", icon: Building2 },
];

// Preserve existing (dev) filtering behavior from SupplierLayout.
export const supplierNavigation: NavItem[] =
  process.env.NODE_ENV === "development"
    ? allSupplierNavigation.filter((item) => item.devOnly !== true)
    : allSupplierNavigation;

export const supplierTheme: SidebarTheme = {
  activeItem: "bg-green-50 text-green-700",
  activeIcon: "text-green-600",
  cardGradient: "from-green-500 to-green-600",
};

// ============================================================================
// Helpers
// ============================================================================

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
