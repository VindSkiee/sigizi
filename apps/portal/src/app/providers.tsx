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
        shadow="0 0 10px #22c55e,0 0 5px #22c55e"
      />
      {children}
    </AuthProvider>
  );
}
