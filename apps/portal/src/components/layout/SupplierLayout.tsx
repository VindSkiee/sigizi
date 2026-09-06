"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSupplierById } from "@/lib/api";
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
  const { user, token, isAuthenticated, isSupplier, isLoading } = useAuth();
  const [profileImage, setProfileImage] = useState(user?.supplier?.profileImage);

  useEffect(() => {
    if (!token || !user?.supplierId) return;

    const loadProfileImage = () => {
      getSupplierById(token, user.supplierId!)
        .then((response) => {
          if (response.success) {
            setProfileImage(
              (response.data as { profileImage?: string }).profileImage,
            );
          }
        })
        .catch(() => {
          setProfileImage(user.supplier?.profileImage);
        });
    };

    loadProfileImage();
    window.addEventListener("supplier-profile-updated", loadProfileImage);
    return () =>
      window.removeEventListener("supplier-profile-updated", loadProfileImage);
  }, [token, user?.supplierId, user?.supplier?.profileImage]);

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
      userCard={{
        name,
        initials: getInitials(name),
        profileImage,
      }}
    >
      {children}
    </DashboardShell>
  );
}
