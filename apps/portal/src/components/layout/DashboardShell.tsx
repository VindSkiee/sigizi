"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "./Sidebar";
import type { NavItem, SidebarTheme, UserCard } from "./navigation";

interface DashboardShellProps {
  navigation: NavItem[];
  theme: SidebarTheme;
  userCard: UserCard;
  children: ReactNode;
}

export function DashboardShell({
  navigation,
  theme,
  userCard,
  children,
}: DashboardShellProps) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
        <Image src="/logo.png" alt="SIGIZI" width={120} height={28} priority />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buka menu"
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Backdrop (mobile only, when drawer open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      <Sidebar
        navigation={navigation}
        theme={theme}
        userCard={userCard}
        onLogout={logout}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
