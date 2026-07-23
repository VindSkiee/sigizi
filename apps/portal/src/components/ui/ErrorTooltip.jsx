import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ErrorTooltip({ error, children }) {
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const [isMounted, setIsMounted] = useState(false);
  const [coords, setCoords] = useState({ top: -9999, left: -9999 });
  const [placement, setPlacement] = useState("top");
  const [arrowLeft, setArrowLeft] = useState("50%");

  // Hindari error Hydration di Next.js/SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!error || !triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const GAP = 8; // Jarak tooltip ke input

      // Kalkulasi posisi default (Top Center)
      let top = trigger.top - tooltip.height - GAP;
      let left = trigger.left + trigger.width / 2 - tooltip.width / 2;
      let currentPlacement = "top";

      // 1. EDGE CASE: Terpotong di atas viewport -> Pindah ke bawah input
      if (top < 10) {
        top = trigger.bottom + GAP;
        currentPlacement = "bottom";
      }

      // 2. EDGE CASE: Terpotong di kiri viewport -> Geser ke kanan
      if (left < 10) {
        left = 10;
      }
      // 3. EDGE CASE: Terpotong di kanan viewport -> Geser ke kiri
      else if (left + tooltip.width > window.innerWidth - 10) {
        left = window.innerWidth - tooltip.width - 10;
      }

      // 4. Kalkulasi posisi panah (arrow) agar selalu menunjuk titik tengah input
      const arrowX = trigger.left + trigger.width / 2 - left;

      // Cegah panah keluar dari batas rounded corner tooltip
      const clampedArrowX = Math.max(12, Math.min(tooltip.width - 12, arrowX));

      setCoords({ top, left });
      setPlacement(currentPlacement);
      setArrowLeft(`${clampedArrowX}px`);
    };

    // Panggil saat pertama muncul
    updatePosition();

    // Panggil saat scroll atau resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [error, isMounted]);

  return (
    <>
      {/* Wrapper Input */}
      <div ref={triggerRef} className="relative w-full">
        {children}
      </div>

      {/* Portal ke document.body */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {error && (
              <motion.div
                ref={tooltipRef}
                // Konfigurasi animasi Framer Motion
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  y: placement === "top" ? 10 : -10,
                }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  transition: { duration: 0.1 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}

                style={{
                  top: coords.top,
                  left: coords.left,
                }}
                className="fixed z-[9999] px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-lg shadow-xl pointer-events-none w-max max-w-xs origin-center"
              >
                {error}

                {/* Segitiga / Panah Tooltip */}
                <div
                  className={`absolute w-2.5 h-2.5 bg-red-600 transform rounded-sm ${
                    placement === "top" ? "-bottom-1" : "-top-1"
                  }`}
                  style={{
                    left: arrowLeft,
                    transform: "translateX(-50%) rotate(45deg)",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
