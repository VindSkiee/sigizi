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
  ReceiptText,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  devOnly?: boolean;
  /** When true, match any sub-path under href (e.g. /bgn/transactions/ORD-123) */
  matchPrefix?: boolean;
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
  profileImage?: string;
}

// ============================================================================
// Admin (SPPG) navigation + theme
// ============================================================================

export const adminNavigation: NavItem[] = [
  { name: "Beranda", href: "/admin", icon: Home },
  { name: "Keranjang Pesanan", href: "/admin/suppliers", icon: ShoppingCart },
  { name: "Pasar Bahan Baku", href: "/admin/market", icon: Store },
  { name: "Riwayat Transaksi", href: "/admin/transactions", icon: ReceiptText },
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
  { name: "Riwayat Transaksi", href: "/supplier/transactions", icon: ReceiptText },
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
// BGN (Badan Gizi Nasional) navigation + theme
// ============================================================================

export const bgnNavigation: NavItem[] = [
  { name: "Overview", href: "/bgn", icon: LayoutDashboard },
  {
    name: "Transaksi",
    href: "/bgn/transactions",
    icon: ShoppingCart,
    matchPrefix: true,
  },
  { name: "SPPG", href: "/bgn/sppg", icon: Building2, matchPrefix: true },
  { name: "Supplier", href: "/bgn/suppliers", icon: Store, matchPrefix: true },
  {
    name: "Komoditas & Harga",
    href: "/bgn/commodities",
    icon: Package,
    matchPrefix: true,
  },
  {
    name: "Perhatian & Anomali",
    href: "/bgn/alerts",
    icon: FileText,
    matchPrefix: true,
  },
];

export const bgnTheme: SidebarTheme = {
  activeItem: "bg-indigo-50 text-indigo-700",
  activeIcon: "text-[#1B4FBE]",
  cardGradient: "from-[#1B4FBE] to-[#2563EB]",
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
