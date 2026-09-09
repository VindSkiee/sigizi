"use client";

import { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Building2,
  Smartphone,
  Check,
  Copy,
  Clock,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertCircle,
  QrCode,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// ── Design Tokens ──────────────────────────────────────────
const C = {
  navy: "#0f1923",
  navyHover: "#1a2a38",
  accent: "#1b4fbe",
  accentHover: "#1648a3",
  accentLight: "#f0f4ff",
  surface: "#f8f9fb",
  border: "border-gray-200",
  borderLight: "border-gray-100",
  muted: "text-gray-500",
  body: "text-gray-600",
  strong: "text-gray-900",
  cardDark: "#1a1f2e",
  cardDarkLight: "#252b3b",
};

type PaymentMethod = "VA" | "CREDIT_CARD" | "EWALLET";
type CheckoutStep = "SUMMARY" | "METHOD" | "DETAILS" | "PROCESSING" | "RESULT";

interface PaymentGatewayMockProps {
  orderId: string;
  orderNumber: string;
  supplierName: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }>;
  onSuccess: () => void;
  onCancel: () => void;
}

const STEPS = [
  { key: "SUMMARY", label: "Ringkasan", num: 1 },
  { key: "METHOD", label: "Metode", num: 2 },
  { key: "DETAILS", label: "Pembayaran", num: 3 },
] as const;

const PAYMENT_METHODS = [
  {
    id: "VA" as PaymentMethod,
    label: "Virtual Account",
    description: "Transfer bank",
    icon: Building2,
  },
  {
    id: "CREDIT_CARD" as PaymentMethod,
    label: "Kartu Kredit",
    description: "Visa, Mastercard, JCB",
    icon: CreditCard,
  },
  {
    id: "EWALLET" as PaymentMethod,
    label: "E-Wallet",
    description: "GoPay, OVO, DANA, ShopeePay",
    icon: Smartphone,
  },
];

const BANKS = ["Bank BNI", "Bank BCA", "Bank Mandiri"];

const WALLETS = [
  { name: "GoPay", id: "gopay" },
  { name: "OVO", id: "ovo" },
  { name: "DANA", id: "dana" },
  { name: "ShopeePay", id: "shopeepay" },
];

// ── Helpers ────────────────────────────────────────────────
function generateVANumber(): string {
  const banks = ["8888", "8008", "3901"];
  const bank = banks[Math.floor(Math.random() * banks.length)];
  const acc = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  return `${bank} ${acc.slice(0, 4)} ${acc.slice(4, 8)} ${acc.slice(8)}`;
}

function generateTxnRef(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${date}-${rand}`;
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ── Animation Variants ─────────────────────────────────────
const STEP_MOTION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.15 },
};

const RESULT_MOTION = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2 },
};

// ── Countdown Timer (isolated state) ──────────────────────
const CountdownTimer = memo(function CountdownTimer({
  initialSeconds,
  onExpire,
}: {
  initialSeconds: number;
  onExpire?: () => void;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const isUrgent = seconds < 300;
  const isCritical = seconds < 60;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock
        className={`w-4 h-4 flex-shrink-0 ${
          isCritical
            ? "text-red-500"
            : isUrgent
              ? "text-amber-500"
              : "text-gray-400"
        }`}
      />
      <span
        className={`font-['JetBrains_Mono',monospace] font-medium tabular-nums ${
          isCritical
            ? "text-red-600"
            : isUrgent
              ? "text-amber-600"
              : "text-gray-600"
        }`}
      >
        {formatCountdown(seconds)}
      </span>
      {!isCritical && <span className="text-gray-400 text-xs">tersisa</span>}
      {isCritical && seconds > 0 && (
        <span className="text-red-500 text-xs">segera berakhir</span>
      )}
    </div>
  );
});

// ── Step Progress Indicator ────────────────────────────────
const StepProgress = memo(function StepProgress({
  currentStep,
}: {
  currentStep: CheckoutStep;
}) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);
  if (currentIdx < 0) return null;

  return (
    <div className="px-5 pr-12 pt-4 pb-2 flex-shrink-0">
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isUpcoming = i > currentIdx;

          return (
            <div
              key={step.key}
              className="flex items-center flex-1 last:flex-initial"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                        ? `${C.navy} text-white`
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    isCurrent
                      ? C.strong
                      : isCompleted
                        ? "text-gray-600"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${
                    i < currentIdx ? "bg-[#0f1923]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ── Step: Order Summary ────────────────────────────────────
const StepSummary = memo(function StepSummary({
  orderNumber,
  supplierName,
  totalAmount,
  items,
  onNext,
}: {
  orderNumber: string;
  supplierName: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    subtotal: number;
  }>;
  onNext: () => void;
}) {
  return (
    <motion.div {...STEP_MOTION} className="flex flex-col">
      <div className="px-5 py-4">
        <h2 className="text-base font-['DM_Sans',sans-serif] font-semibold text-gray-900">
          Ringkasan Pesanan
        </h2>
        <p className="text-xs text-gray-500 mt-0.5 font-['JetBrains_Mono',monospace]">
          {orderNumber}
        </p>
      </div>

      <div className="px-5 pb-4 space-y-4">
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            Supplier
          </p>
          <p className="text-sm font-medium text-gray-900">{supplierName}</p>
        </div>

        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
            Item Pesanan
          </p>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2.5 bg-white"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 tabular-nums">
                    {item.quantity} {item.unit} &times;{" "}
                    {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900 tabular-nums ml-3">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Total Pembayaran</span>
          <span className="text-lg font-['DM_Sans',sans-serif] font-semibold text-gray-900 tabular-nums">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100">
        <button
          onClick={onNext}
          type="button"
          className="w-full h-11 bg-[#0f1923] text-white text-sm font-medium rounded-xl hover:bg-[#1a2a38] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe] focus-visible:ring-offset-2"
        >
          Pilih Metode Pembayaran
        </button>
      </div>
    </motion.div>
  );
});

// ── Step: Payment Method Selection ─────────────────────────
const StepMethod = memo(function StepMethod({
  totalAmount,
  selectedMethod,
  onSelect,
  onBack,
  onNext,
}: {
  totalAmount: number;
  selectedMethod: PaymentMethod | null;
  onSelect: (m: PaymentMethod) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <motion.div {...STEP_MOTION} className="flex flex-col">
      <div className="px-5 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          type="button"
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe]"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-['DM_Sans',sans-serif] font-semibold text-gray-900">
            Metode Pembayaran
          </h2>
          <p className="text-xs text-gray-500 tabular-nums">
            {formatCurrency(totalAmount)}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4 space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              type="button"
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe] focus-visible:ring-offset-1 ${
                isSelected
                  ? "border-[#1b4fbe] bg-[#f0f4ff]"
                  : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-[#1b4fbe]/10" : "bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isSelected ? "text-[#1b4fbe]" : "text-gray-500"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isSelected ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {method.label}
                </p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 bg-[#1b4fbe] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-5 py-4 border-t border-gray-100">
        <button
          onClick={onNext}
          type="button"
          disabled={!selectedMethod}
          className={`w-full h-11 text-sm font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe] focus-visible:ring-offset-2 ${
            selectedMethod
              ? "bg-[#0f1923] text-white hover:bg-[#1a2a38]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Lanjutkan
        </button>
      </div>
    </motion.div>
  );
});

// ── VA Detail ──────────────────────────────────────────────
const VADetail = memo(function VADetail({
  selectedBank,
  onSelectBank,
  vaNumber,
  copied,
  onCopyVA,
  bankError,
}: {
  selectedBank: string;
  onSelectBank: (bank: string) => void;
  vaNumber: string;
  copied: boolean;
  onCopyVA: () => void;
  bankError: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
          Pilih Bank
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BANKS.map((bank) => (
            <button
              key={bank}
              onClick={() => onSelectBank(bank)}
              type="button"
              className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe] ${
                selectedBank === bank
                  ? "border-[#1b4fbe] bg-[#f0f4ff] text-[#1b4fbe]"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {bank}
            </button>
          ))}
        </div>
        {bankError && (
          <p className="text-xs text-red-500 mt-1.5">{bankError}</p>
        )}
      </div>

      {vaNumber && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">
            Nomor Virtual Account
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-['JetBrains_Mono',monospace] font-semibold text-gray-900 tracking-wide tabular-nums">
              {vaNumber}
            </p>
            <button
              onClick={onCopyVA}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe] ${
                copied
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Salin
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {selectedBank} &middot; a.n. PT SIGIZI Nusantara
          </p>
        </div>
      )}

      {vaNumber && (
        <div className="flex items-center justify-between">
          <CountdownTimer initialSeconds={900} />
          <span className="text-[11px] text-gray-400">
            Bayar sebelum waktu habis
          </span>
        </div>
      )}

      <div>
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
          Cara Bayar
        </p>
        <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
          <li>Buka aplikasi mobile {selectedBank}</li>
          <li>Pilih menu Transfer atau Virtual Account</li>
          <li>Masukkan nomor VA di atas</li>
          <li>Bayar sesuai nominal yang tertera</li>
        </ol>
      </div>
    </div>
  );
});

// ── Credit Card Detail ─────────────────────────────────────
const CreditCardDetail = memo(function CreditCardDetail({
  cardNumber,
  onCardNumberChange,
  cardExpiry,
  onCardExpiryChange,
  cardCvv,
  onCardCvvChange,
  cardName,
  onCardNameChange,
  errors,
}: {
  cardNumber: string;
  onCardNumberChange: (v: string) => void;
  cardExpiry: string;
  onCardExpiryChange: (v: string) => void;
  cardCvv: string;
  onCardCvvChange: (v: string) => void;
  cardName: string;
  onCardNameChange: (v: string) => void;
  errors: {
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
    cardName?: string;
  };
}) {
  return (
    <div className="space-y-4">
      {/* Card Preview */}
      <div className="bg-gradient-to-br from-[#1a1f2e] to-[#252b3b] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-6">
          <CreditCard className="w-7 h-7 text-white/40" />
          <div className="flex gap-1">
            <div className="w-7 h-4 bg-amber-400/60 rounded" />
            <div className="w-7 h-4 bg-amber-400/40 rounded" />
          </div>
        </div>
        <p className="font-['JetBrains_Mono',monospace] text-base tracking-[0.15em] mb-5 text-white/90">
          {cardNumber ||
            "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022"}
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">
              Card Holder
            </p>
            <p className="text-xs font-medium text-white/80">
              {cardName || "NAMA PEMEGANG"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">
              Expires
            </p>
            <p className="text-xs font-['JetBrains_Mono',monospace] font-medium text-white/80">
              {cardExpiry || "MM/YY"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Nomor Kartu
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 16);
              onCardNumberChange(v.replace(/(.{4})/g, "$1 ").trim());
            }}
            placeholder="4111 1111 1111 1111"
            maxLength={19}
            aria-invalid={!!errors.cardNumber}
            className={`w-full h-11 px-3 border rounded-lg text-sm font-['JetBrains_Mono',monospace] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b4fbe]/20 focus:border-[#1b4fbe] transition-colors ${
              errors.cardNumber ? "border-red-300" : "border-gray-200"
            }`}
          />
          {errors.cardNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Masa Berlaku
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={cardExpiry}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                onCardExpiryChange(
                  v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2)}` : v,
                );
              }}
              placeholder="MM/YY"
              maxLength={5}
              aria-invalid={!!errors.cardExpiry}
              className={`w-full h-11 px-3 border rounded-lg text-sm font-['JetBrains_Mono',monospace] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b4fbe]/20 focus:border-[#1b4fbe] transition-colors ${
                errors.cardExpiry ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.cardExpiry && (
              <p className="text-xs text-red-500 mt-1">{errors.cardExpiry}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              CVV
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={cardCvv}
              onChange={(e) =>
                onCardCvvChange(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="\u2022\u2022\u2022"
              maxLength={4}
              aria-invalid={!!errors.cardCvv}
              className={`w-full h-11 px-3 border rounded-lg text-sm font-['JetBrains_Mono',monospace] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b4fbe]/20 focus:border-[#1b4fbe] transition-colors ${
                errors.cardCvv ? "border-red-300" : "border-gray-200"
              }`}
            />
            {errors.cardCvv && (
              <p className="text-xs text-red-500 mt-1">{errors.cardCvv}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Nama Pada Kartu
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => onCardNameChange(e.target.value.toUpperCase())}
            placeholder="BUDI SANTOSO"
            aria-invalid={!!errors.cardName}
            className={`w-full h-11 px-3 border rounded-lg text-sm uppercase text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b4fbe]/20 focus:border-[#1b4fbe] transition-colors ${
              errors.cardName ? "border-red-300" : "border-gray-200"
            }`}
          />
          {errors.cardName && (
            <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Demo Mode:</span> Gunakan kartu test
          4111 1111 1111 1111, expiry 12/28, CVV 123
        </p>
      </div>
    </div>
  );
});

// ── E-Wallet Detail ────────────────────────────────────────
const EWalletDetail = memo(function EWalletDetail({
  ewalletPhone,
  onEwalletPhoneChange,
  selectedWallet,
  onSelectWallet,
  phoneError,
}: {
  ewalletPhone: string;
  onEwalletPhoneChange: (v: string) => void;
  selectedWallet: string;
  onSelectWallet: (w: string) => void;
  phoneError: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
          Pilih E-Wallet
        </label>
        <div className="grid grid-cols-2 gap-2">
          {WALLETS.map((w) => (
            <button
              key={w.id}
              onClick={() => onSelectWallet(w.name)}
              type="button"
              className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all border text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe] ${
                selectedWallet === w.name
                  ? "border-[#1b4fbe] bg-[#f0f4ff] text-[#1b4fbe]"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Nomor Handphone
        </label>
        <div className="flex">
          <span className="inline-flex items-center px-3 h-11 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500 font-['JetBrains_Mono',monospace]">
            +62
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={ewalletPhone}
            onChange={(e) =>
              onEwalletPhoneChange(
                e.target.value.replace(/\D/g, "").slice(0, 13),
              )
            }
            placeholder="8123456789"
            aria-invalid={!!phoneError}
            className={`flex-1 h-11 px-3 border rounded-r-lg text-sm font-['JetBrains_Mono',monospace] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1b4fbe]/20 focus:border-[#1b4fbe] transition-colors ${
              phoneError ? "border-red-300" : "border-gray-200"
            }`}
          />
        </div>
        {phoneError && (
          <p className="text-xs text-red-500 mt-1.5">{phoneError}</p>
        )}
      </div>

      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center">
        <div className="w-32 h-32 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-3">
          <div className="text-center">
            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-1.5" />
            <p className="text-[10px] text-gray-400">
              QR muncul setelah input nomor
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Scan menggunakan {selectedWallet}
        </p>
      </div>

      <div>
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
          Cara Bayar
        </p>
        <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
          <li>Buka aplikasi {selectedWallet}</li>
          <li>Pilih menu Scan QR</li>
          <li>Scan QR code di atas</li>
          <li>Konfirmasi pembayaran</li>
        </ol>
      </div>
    </div>
  );
});

// ── Step: Payment Details ──────────────────────────────────
const StepDetails = memo(function StepDetails({
  selectedMethod,
  totalAmount,
  selectedBank,
  onSelectBank,
  vaNumber,
  copied,
  onCopyVA,
  cardNumber,
  onCardNumberChange,
  cardExpiry,
  onCardExpiryChange,
  cardCvv,
  onCardCvvChange,
  cardName,
  onCardNameChange,
  ewalletPhone,
  onEwalletPhoneChange,
  selectedWallet,
  onSelectWallet,
  isValid,
  errors,
  onBack,
  onPay,
  isProcessing,
}: {
  selectedMethod: PaymentMethod;
  totalAmount: number;
  selectedBank: string;
  onSelectBank: (bank: string) => void;
  vaNumber: string;
  copied: boolean;
  onCopyVA: () => void;
  cardNumber: string;
  onCardNumberChange: (v: string) => void;
  cardExpiry: string;
  onCardExpiryChange: (v: string) => void;
  cardCvv: string;
  onCardCvvChange: (v: string) => void;
  cardName: string;
  onCardNameChange: (v: string) => void;
  ewalletPhone: string;
  onEwalletPhoneChange: (v: string) => void;
  selectedWallet: string;
  onSelectWallet: (w: string) => void;
  isValid: boolean;
  errors: Record<string, string>;
  onBack: () => void;
  onPay: () => void;
  isProcessing: boolean;
}) {
  const title =
    selectedMethod === "VA"
      ? "Virtual Account"
      : selectedMethod === "CREDIT_CARD"
        ? "Kartu Kredit"
        : "E-Wallet";

  return (
    <motion.div {...STEP_MOTION} className="flex flex-col">
      <div className="px-5 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          type="button"
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe]"
          aria-label="Kembali ke pemilihan metode"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-['DM_Sans',sans-serif] font-semibold text-gray-900">
            {title}
          </h2>
          <p className="text-xs text-gray-500 tabular-nums">
            {formatCurrency(totalAmount)}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4">
        {selectedMethod === "VA" && (
          <VADetail
            selectedBank={selectedBank}
            onSelectBank={onSelectBank}
            vaNumber={vaNumber}
            copied={copied}
            onCopyVA={onCopyVA}
            bankError={errors.bank || ""}
          />
        )}
        {selectedMethod === "CREDIT_CARD" && (
          <CreditCardDetail
            cardNumber={cardNumber}
            onCardNumberChange={onCardNumberChange}
            cardExpiry={cardExpiry}
            onCardExpiryChange={onCardExpiryChange}
            cardCvv={cardCvv}
            onCardCvvChange={onCardCvvChange}
            cardName={cardName}
            onCardNameChange={onCardNameChange}
            errors={{
              cardNumber: errors.cardNumber,
              cardExpiry: errors.cardExpiry,
              cardCvv: errors.cardCvv,
              cardName: errors.cardName,
            }}
          />
        )}
        {selectedMethod === "EWALLET" && (
          <EWalletDetail
            ewalletPhone={ewalletPhone}
            onEwalletPhoneChange={onEwalletPhoneChange}
            selectedWallet={selectedWallet}
            onSelectWallet={onSelectWallet}
            phoneError={errors.phone || ""}
          />
        )}
      </div>

      <div className="px-5 py-4 border-t border-gray-100">
        <button
          onClick={onPay}
          type="button"
          disabled={!isValid || isProcessing}
          className={`w-full h-11 text-sm font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe] focus-visible:ring-offset-2 ${
            isValid && !isProcessing
              ? "bg-[#0f1923] text-white hover:bg-[#1a2a38]"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses...
            </span>
          ) : (
            "Bayar Sekarang"
          )}
        </button>
      </div>
    </motion.div>
  );
});

// ── Step: Processing ───────────────────────────────────────
const StepProcessing = memo(function StepProcessing() {
  return (
    <motion.div
      {...RESULT_MOTION}
      className="flex flex-col items-center justify-center py-14 px-5"
      aria-live="polite"
    >
      <Loader2 className="w-8 h-8 text-[#0f1923] animate-spin mb-5" />
      <h3 className="text-base font-['DM_Sans',sans-serif] font-semibold text-gray-900 mb-1.5">
        Memproses Pembayaran
      </h3>
      <p className="text-sm text-gray-500 text-center">Mohon tunggu sebentar</p>
      <div className="mt-5 flex items-center gap-1.5 text-xs text-gray-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Pembayaran terenkripsi dan aman</span>
      </div>
    </motion.div>
  );
});

// ── Step: Result ───────────────────────────────────────────
const StepResult = memo(function StepResult({
  success,
  totalAmount,
  selectedMethod,
  selectedBank,
  supplierName,
  txnRef,
  onSuccess,
  onRetry,
  onCancel,
}: {
  success: boolean;
  totalAmount: number;
  selectedMethod: PaymentMethod | null;
  selectedBank: string;
  supplierName: string;
  txnRef: string;
  onSuccess: () => void;
  onRetry: () => void;
  onCancel: () => void;
}) {
  const methodLabel =
    selectedMethod === "VA"
      ? `VA ${selectedBank}`
      : selectedMethod === "CREDIT_CARD"
        ? "Kartu Kredit"
        : "E-Wallet";

  const successBtnRef = useRef<HTMLButtonElement>(null);
  const retryBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (success) successBtnRef.current?.focus();
      else retryBtnRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [success]);

  return (
    <motion.div
      {...RESULT_MOTION}
      className="flex flex-col items-center py-10 px-5"
      aria-live="polite"
    >
      {success ? (
        <>
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-['DM_Sans',sans-serif] font-semibold text-gray-900 mb-1">
            Pembayaran Berhasil
          </h3>
          <p className="text-sm text-gray-500 text-center mb-1">
            {formatCurrency(totalAmount)} telah dibayar
          </p>
          <p className="text-xs text-gray-400 font-['JetBrains_Mono',monospace] mb-5">
            {txnRef}
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full max-w-xs mb-5">
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-emerald-600">Berhasil</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Metode</span>
                <span className="font-medium text-gray-900">{methodLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Supplier</span>
                <span className="font-medium text-gray-900 truncate ml-4">
                  {supplierName}
                </span>
              </div>
            </div>
          </div>

          <button
            ref={successBtnRef}
            onClick={onSuccess}
            type="button"
            className="w-full max-w-xs h-11 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Selesai
          </button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-['DM_Sans',sans-serif] font-semibold text-gray-900 mb-1">
            Pembayaran Gagal
          </h3>
          <p className="text-sm text-gray-500 text-center mb-5 max-w-xs">
            Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.
          </p>

          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={onCancel}
              type="button"
              className="flex-1 h-11 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe] focus-visible:ring-offset-2"
            >
              Batal
            </button>
            <button
              ref={retryBtnRef}
              onClick={onRetry}
              type="button"
              className="flex-1 h-11 text-sm font-medium text-white bg-[#0f1923] rounded-xl hover:bg-[#1a2a38] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe] focus-visible:ring-offset-2"
            >
              Coba Lagi
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
});

// ── Main Component ─────────────────────────────────────────
export function PaymentGatewayMock({
  orderId,
  orderNumber,
  supplierName,
  totalAmount,
  items,
  onSuccess,
  onCancel,
}: PaymentGatewayMockProps) {
  const [step, setStep] = useState<CheckoutStep>("SUMMARY");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [selectedBank, setSelectedBank] = useState("Bank BNI");
  const [vaNumber, setVaNnumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [txnRef, setTxnRef] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Credit card form
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  // E-wallet form
  const [ewalletPhone, setEwalletPhone] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("GoPay");

  // Inline validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Generate VA when entering details step
  useEffect(() => {
    if (step === "DETAILS" && selectedMethod === "VA" && !vaNumber) {
      setVaNnumber(generateVANumber());
    }
  }, [step, selectedMethod, vaNumber]);

  // Body scroll lock
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Focus trap + ESC
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && step !== "PROCESSING") {
        onCancel();
        return;
      }

      if (e.key === "Tab") {
        const focusable = Array.from(
          modal.querySelectorAll(focusableSelector),
        ) as HTMLElement[];
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [step, onCancel]);

  // Focus first element on step change
  useEffect(() => {
    if (step === "PROCESSING" || step === "RESULT") return;
    const timer = setTimeout(() => {
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = modal.querySelector(
        "button:not([disabled]), input:not([disabled])",
      ) as HTMLElement | null;
      focusable?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [step]);

  // Save/restore previous focus
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    return () => {
      previousFocusRef.current?.focus();
    };
  }, []);

  // Validation
  const validate = useCallback(
    (method: PaymentMethod): Record<string, string> => {
      const errs: Record<string, string> = {};

      if (method === "CREDIT_CARD") {
        const num = cardNumber.replace(/\s/g, "");
        if (num.length > 0 && num.length < 16) {
          errs.cardNumber = "Nomor kartu harus 16 digit";
        }
        if (cardExpiry.length > 0 && cardExpiry.length < 5) {
          errs.cardExpiry = "Format: MM/YY";
        }
        if (cardCvv.length > 0 && cardCvv.length < 3) {
          errs.cardCvv = "CVV harus 3-4 digit";
        }
        if (cardName.length > 0 && cardName.length < 2) {
          errs.cardName = "Nama harus minimal 2 karakter";
        }
      }

      if (method === "EWALLET") {
        const phone = ewalletPhone.replace(/\D/g, "");
        if (phone.length > 0 && phone.length < 10) {
          errs.phone = "Nomor HP minimal 10 digit";
        }
      }

      return errs;
    },
    [cardNumber, cardExpiry, cardCvv, cardName, ewalletPhone],
  );

  // Clear errors when inputs change
  useEffect(() => {
    if (step === "DETAILS" && selectedMethod) {
      const newErrors = validate(selectedMethod);
      setErrors(newErrors);
    }
  }, [step, selectedMethod, validate]);

  const handleCopyVA = async () => {
    try {
      await navigator.clipboard.writeText(vaNumber.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handlePay = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setStep("PROCESSING");
    const ref = generateTxnRef();
    setTxnRef(ref);

    const delay = 2000 + Math.random() * 1000;
    setTimeout(() => {
      const success = Math.random() < 0.85;
      setResultSuccess(success);
      setStep("RESULT");
      setIsProcessing(false);
    }, delay);
  };

  const handleRetry = () => {
    setStep("DETAILS");
    setResultSuccess(false);
    setIsProcessing(false);
  };

  const handleSelectBank = (bank: string) => {
    setSelectedBank(bank);
    setVaNnumber(generateVANumber());
    setCopied(false);
  };

  const isDetailsValid = useMemo(() => {
    if (selectedMethod === "VA") return true;
    if (selectedMethod === "CREDIT_CARD") {
      return (
        cardNumber.replace(/\s/g, "").length === 16 &&
        cardExpiry.length === 5 &&
        cardCvv.length >= 3 &&
        cardName.length > 0
      );
    }
    if (selectedMethod === "EWALLET") {
      return ewalletPhone.replace(/\D/g, "").length >= 10;
    }
    return false;
  }, [selectedMethod, cardNumber, cardExpiry, cardCvv, cardName, ewalletPhone]);

  const currentStepIdx = STEPS.findIndex((s) => s.key === step);

  const renderStep = () => {
    switch (step) {
      case "SUMMARY":
        return (
          <StepSummary
            key="summary"
            orderNumber={orderNumber}
            supplierName={supplierName}
            totalAmount={totalAmount}
            items={items}
            onNext={() => setStep("METHOD")}
          />
        );
      case "METHOD":
        return (
          <StepMethod
            key="method"
            totalAmount={totalAmount}
            selectedMethod={selectedMethod}
            onSelect={setSelectedMethod}
            onBack={() => setStep("SUMMARY")}
            onNext={() => setStep("DETAILS")}
          />
        );
      case "DETAILS":
        return (
          <StepDetails
            key="details"
            selectedMethod={selectedMethod!}
            totalAmount={totalAmount}
            selectedBank={selectedBank}
            onSelectBank={handleSelectBank}
            vaNumber={vaNumber}
            copied={copied}
            onCopyVA={handleCopyVA}
            cardNumber={cardNumber}
            onCardNumberChange={setCardNumber}
            cardExpiry={cardExpiry}
            onCardExpiryChange={setCardExpiry}
            cardCvv={cardCvv}
            onCardCvvChange={setCardCvv}
            cardName={cardName}
            onCardNameChange={setCardName}
            ewalletPhone={ewalletPhone}
            onEwalletPhoneChange={setEwalletPhone}
            selectedWallet={selectedWallet}
            onSelectWallet={setSelectedWallet}
            isValid={isDetailsValid}
            errors={errors}
            onBack={() => setStep("METHOD")}
            onPay={handlePay}
            isProcessing={isProcessing}
          />
        );
      case "PROCESSING":
        return <StepProcessing key="processing" />;
      case "RESULT":
        return (
          <StepResult
            key="result"
            success={resultSuccess}
            totalAmount={totalAmount}
            selectedMethod={selectedMethod}
            selectedBank={selectedBank}
            supplierName={supplierName}
            txnRef={txnRef}
            onSuccess={onSuccess}
            onRetry={handleRetry}
            onCancel={onCancel}
          />
        );
    }
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Pembayaran"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px]"
        onClick={step !== "PROCESSING" ? onCancel : undefined}
      />

      {/* Modal */}
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.98, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 4 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-200/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
        style={{ maxHeight: "min(90vh, 680px)" }}
      >
        {/* Close button */}
        {step !== "PROCESSING" && step !== "RESULT" && (
          <button
            onClick={onCancel}
            type="button"
            className="absolute top-3 right-3 z-10 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4fbe]"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Progress indicator */}
        {currentStepIdx >= 0 && currentStepIdx <= 2 && (
          <StepProgress currentStep={step} />
        )}

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
