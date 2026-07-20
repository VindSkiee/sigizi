"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardShell } from "./DashboardShell";
import {
  supplierNavigation,
  supplierTheme,
  getInitials,
} from "./navigation";

interface SupplierLayoutProps {
  children: ReactNode;
}

export default function SupplierLayout({ children }: SupplierLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isSupplier, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    } else if (!isLoading && !isSupplier) {
      router.push("/unauthorized");
    }
  }, [isLoading, isAuthenticated, isSupplier, router]);

  if (isLoading) return null;
  if (!isAuthenticated || !isSupplier) return null;

  const name = user?.name || "PT Sumber Makmur";

  return (
    <DashboardShell
      navigation={supplierNavigation}
      theme={supplierTheme}
      userCard={{ name, initials: getInitials(name) }}
    >
      {children}
    </DashboardShell>
  );
}
