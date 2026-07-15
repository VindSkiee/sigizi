"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center gap-3 bg-gray-900 rounded-xl shadow-2xl px-4 py-3 min-w-[320px]">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-white flex-1">{message}</p>
              {action && (
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium text-primary-300 hover:text-primary-200 underline whitespace-nowrap"
                >
                  {action.label} →
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
