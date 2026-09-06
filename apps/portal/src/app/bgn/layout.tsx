"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  bgnNavigation,
  bgnTheme,
  getInitials,
} from "@/components/layout/navigation";

interface BgnLayoutProps {
  children: ReactNode;
}

export default function BgnLayout({ children }: BgnLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isBgn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    } else if (!isLoading && !isBgn) {
      router.push("/unauthorized");
    }
  }, [isLoading, isAuthenticated, isBgn, router]);

  if (isLoading) return null;
  if (!isAuthenticated || !isBgn) return null;

  const name = user?.name || "Admin BGN";

  return (
    <DashboardShell
      navigation={bgnNavigation}
      theme={bgnTheme}
      userCard={{ name, initials: getInitials(name) }}
    >
      {children}
    </DashboardShell>
  );
}
