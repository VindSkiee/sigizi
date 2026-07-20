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

const PUBLIC_ADMIN_ROUTES = ["/admin/setup-location"];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isAdmin, isLoading, hasLocation } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ADMIN_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    } else if (!isLoading && !isAdmin) {
      router.push("/unauthorized");
    } else if (!isLoading && isAdmin && !hasLocation && !isPublicRoute) {
      router.push("/admin/setup-location");
    }
  }, [isLoading, isAuthenticated, isAdmin, hasLocation, isPublicRoute, router]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  if (!hasLocation && !isPublicRoute) {
    return null;
  }

  if (isPublicRoute) {
    return <>{children}</>;
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
