"use client";

import { OrderFilterTab } from "./types";
import { OrderStatus } from "@sigizi/shared";

interface SupplierOrderTabsProps {
  activeTab: OrderFilterTab;
  onTabChange: (tab: OrderFilterTab) => void;
  counts: {
    all: number;
    pending: number;
    delivered: number;
    completed: number;
  };
}

const TABS: { key: OrderFilterTab; label: string }[] = [
  { key: "ALL", label: "Semua Pesanan" },
  { key: OrderStatus.PENDING, label: "Menunggu Konfirmasi" },
  { key: OrderStatus.DELIVERED, label: "Dikirim" },
  { key: OrderStatus.COMPLETED, label: "Selesai" },
];

export function SupplierOrderTabs({
  activeTab,
  onTabChange,
  counts,
}: SupplierOrderTabsProps) {
  const getCount = (key: OrderFilterTab) => {
    switch (key) {
      case "ALL":
        return counts.all;
      case OrderStatus.PENDING:
        return counts.pending;
      case OrderStatus.DELIVERED:
        return counts.delivered;
      case OrderStatus.COMPLETED:
        return counts.completed;
      default:
        return 0;
    }
  };

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-0 -mb-px">
        {TABS.map((tab) => {
          const count = getCount(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
