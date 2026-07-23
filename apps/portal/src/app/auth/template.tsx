"use client";

import { useLayoutEffect, useRef } from "react";

export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const dir = sessionStorage.getItem("auth-slide");
    sessionStorage.removeItem("auth-slide");

    if (!dir) return;

    if (dir === "left") {
      ref.current?.classList.add("animate-slide-from-right");
    } else if (dir === "right") {
      ref.current?.classList.add("animate-slide-from-left");
    }

    const timer = setTimeout(() => {
      document.body.classList.remove("hide-toploader");
    }, 350);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("hide-toploader");
    };
  }, []);

  return (
    <div ref={ref} className="min-h-screen">
      {children}
    </div>
  );
}
