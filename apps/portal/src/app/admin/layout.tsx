"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardShell } from "@/components/layout/DashboardShell";
import {
  adminNavigation,
  adminTheme,
  getInitials,
} from "@/components/layout/navigation";
import { PageErrorBoundary } from "@/components/features/common/PageErrorBoundary";
import { DemoNoticeModal } from "@/components/ui/DemoNoticeModal";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    } else if (!isLoading && !isAdmin) {
      router.push("/unauthorized");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <>
      <DemoNoticeModal />
      <DashboardShell
        navigation={adminNavigation}
        theme={adminTheme}
        userCard={{
          name: user?.name || "User",
          subtitle: user?.sppg?.name || "SPPG",
          initials: getInitials(user?.name || "User"),
        }}
      >
        <PageErrorBoundary pageName="Dashboard Admin">
          {children}
        </PageErrorBoundary>
      </DashboardShell>
    </>
  );
}
