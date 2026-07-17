"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

interface DemoAccount {
  name: string;
  email: string;
  password: string;
}

interface DemoAccountCardProps {
  onSelectAccount: (email: string, password: string) => void;
}

const PASSWORD = "password123";

const sppgAccounts: DemoAccount[] = [
  {
    name: "Ahmad Hidayat",
    email: "admin-cirebon-utara@sigizi.go.id",
    password: PASSWORD,
  },
  {
    name: "Siti Nurhaliza",
    email: "admin-cirebon-selatan@sigizi.go.id",
    password: PASSWORD,
  },
  {
    name: "Dedi Mulyadi",
    email: "admin-cirebon-barat@sigizi.go.id",
    password: PASSWORD,
  },
];

const supplierAccounts: DemoAccount[] = [
  {
    name: "Toko Berkah",
    email: "supplier-01@sigizi.go.id",
    password: PASSWORD,
  },
  {
    name: "UD. Segar Makmur",
    email: "supplier-02@sigizi.go.id",
    password: PASSWORD,
  },
  {
    name: "Sumber Rejeki",
    email: "supplier-03@sigizi.go.id",
    password: PASSWORD,
  },
  { name: "Tani Jaya", email: "supplier-04@sigizi.go.id", password: PASSWORD },
  {
    name: "Berkah Tani",
    email: "supplier-05@sigizi.go.id",
    password: PASSWORD,
  },
];

function AccountItem({
  account,
  onSelect,
}: {
  account: DemoAccount;
  onSelect: (a: DemoAccount) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(account)}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 transition-colors group"
    >
      <p className="text-sm font-medium text-gray-800 group-hover:text-green-700 truncate">
        {account.name}
      </p>
      <p className="text-[11px] text-gray-400 group-hover:text-green-500 truncate">
        {account.email}
      </p>
    </button>
  );
}

export function DemoAccountCard({ onSelectAccount }: DemoAccountCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isDemo) return null;

  function handleSelect(account: DemoAccount) {
    onSelectAccount(account.email, account.password);
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/10 md:bg-transparent"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed left-0 z-40 transition-all duration-300 ease-in-out",
          "top-1/2 -translate-y-1/2",
          isOpen ? "w-60" : "w-10",
        )}
      >
        <div
          className={cn(
            "bg-white shadow-lg border border-gray-200 overflow-hidden",
            "transition-all duration-300 ease-in-out",
            isOpen ? "rounded-r-xl" : "rounded-r-lg",
          )}
        >
          {!isOpen ? (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-center w-10 h-24 hover:bg-green-50 transition-colors cursor-pointer"
              title="Buka daftar akun demo"
            >
              <span className="text-lg">👤</span>
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800">
                  Demo Akun
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto py-2">
                <div className="px-3 mb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600">
                    SPPG Admin
                  </p>
                </div>
                <div className="space-y-0.5 mb-3">
                  {sppgAccounts.map((acc) => (
                    <AccountItem
                      key={acc.email}
                      account={acc}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>

                <div className="border-t border-gray-50 pt-2 mt-1">
                  <div className="px-3 mb-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                      Supplier
                    </p>
                  </div>
                  <div className="space-y-0.5 mb-1">
                    {supplierAccounts.map((acc) => (
                      <AccountItem
                        key={acc.email}
                        account={acc}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <p className="text-[10px] text-gray-400 text-center">
                  Password:{" "}
                  <span className="font-mono text-gray-500">{PASSWORD}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
