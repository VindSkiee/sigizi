"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

export type ConfirmVariant = "success" | "danger" | "warning" | "info";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  {
    icon: typeof CheckCircle2;
    iconBg: string;
    iconColor: string;
    confirmBg: string;
    confirmHover: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    confirmBg: "bg-green-600",
    confirmHover: "hover:bg-green-700",
  },
  danger: {
    icon: XCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBg: "bg-red-600",
    confirmHover: "hover:bg-red-700",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    confirmBg: "bg-orange-600",
    confirmHover: "hover:bg-orange-700",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmBg: "bg-blue-600",
    confirmHover: "hover:bg-blue-700",
  },
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Ya, Konfirmasi",
  cancelLabel = "Batal",
  variant = "success",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-5">
          <div
            className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${config.confirmBg} text-white text-sm font-medium rounded-lg ${config.confirmHover} transition-colors disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
