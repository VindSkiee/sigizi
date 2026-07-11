"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TopProgressBar() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    function handleStart() {
      setLoading(true);
    }
    function handleComplete() {
      setLoading(false);
    }

    window.addEventListener("beforeunload", handleStart);
    window.addEventListener("load", handleComplete);

    return () => {
      window.removeEventListener("beforeunload", handleStart);
      window.removeEventListener("load", handleComplete);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600"
        style={{
          animation: "progress-bar 1.5s ease-in-out infinite",
          width: "40%",
        }}
      />
      <style jsx>{`
        @keyframes progress-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(150%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}

export function useLoading() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  return { loading, setLoading };
}
