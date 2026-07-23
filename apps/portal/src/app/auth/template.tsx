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

    const wrapper = document.getElementById("toploader-wrapper");

    if (dir === "left") {
      ref.current?.classList.add("animate-slide-from-right");
    } else if (dir === "right") {
      ref.current?.classList.add("animate-slide-from-left");
    }

    if (!wrapper) return;

    wrapper.style.visibility = "hidden";
    const timer = setTimeout(() => {
      wrapper.style.visibility = "";
    }, 350);

    return () => {
      clearTimeout(timer);
      wrapper.style.visibility = "";
    };
  }, []);

  return (
    <div ref={ref} className="min-h-screen">
      {children}
    </div>
  );
}
