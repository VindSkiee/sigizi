"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem, SidebarTheme, UserCard } from "./navigation";

interface SidebarProps {
  navigation: NavItem[];
  theme: SidebarTheme;
  userCard: UserCard;
  onLogout: () => void;
  /** Mobile drawer open state. Ignored on desktop (md+). */
  isOpen: boolean;
  /** Called when a nav link is clicked (to close the mobile drawer). */
  onClose: () => void;
}

export function Sidebar({
  navigation,
  theme,
  userCard,
  onLogout,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 flex flex-col",
        "transform transition-transform duration-200 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <Image src="/logo.png" alt="SIGIZI" width={140} height={32} priority />
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = item.matchPrefix
              ? pathname === item.href || pathname.startsWith(item.href + "/")
              : pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? theme.activeItem
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? theme.activeIcon : "text-gray-400",
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info Card */}
      <div className="p-3 border-t border-gray-200">
        <div
          className={cn(
            "bg-gradient-to-r rounded-lg p-4 text-white",
            theme.cardGradient,
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="font-semibold">{userCard.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{userCard.name}</p>
              {userCard.subtitle && (
                <p className="text-xs text-white/80 truncate">
                  {userCard.subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onLogout}
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
