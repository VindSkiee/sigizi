"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({ message, isVisible, onClose, action }: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        /* 
          pointer-events-none pada container memastikan klik di luar toast 
          tetap tembus ke elemen halaman di bawahnya. 
        */
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 400,
              mass: 0.8
            }}
            className="pointer-events-auto"
          >
            {/* Pill shaped container with Glassmorphism */}
            <div className="flex items-center gap-3 bg-white/85 backdrop-blur-xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full pl-3 pr-2 py-2 min-w-[320px] max-w-md">
              
              {/* Minimalist Icon */}
              <div className="flex-shrink-0 flex items-center justify-center p-1">
                <CheckCircle2 className="w-5 h-5 text-green-500" strokeWidth={2.5} />
              </div>
              
              {/* Message */}
              <p className="text-[14px] font-medium text-gray-700 flex-1 leading-snug truncate">
                {message}
              </p>
              
              {/* Action Button */}
              {action && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Mencegah bubbling jika diperlukan
                      action.onClick();
                    }}
                    className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {action.label}
                  </button>
                  {/* Subtle Separator */}
                  <div className="w-[1px] h-4 bg-gray-200" />
                </>
              )}
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label="Tutup notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
              
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}