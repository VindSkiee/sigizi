"use client";

import NextTopLoader from "nextjs-toploader";
import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NextTopLoader
        color="#22c55e"
        showSpinner={false}
        crawl={true}
        easing="ease"
      />
      {children}
    </AuthProvider>
  );
}
