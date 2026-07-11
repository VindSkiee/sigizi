"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { TopProgressBar } from "@/components/ui/TopProgressBar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TopProgressBar />
      {children}
    </AuthProvider>
  );
}
