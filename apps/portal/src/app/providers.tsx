"use client";

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
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
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
      {children}
    </AuthProvider>
  );
}
