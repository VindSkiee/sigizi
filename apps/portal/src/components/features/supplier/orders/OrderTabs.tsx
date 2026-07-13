import { FilterType, OrderStatusWithCancel } from "./types";
import { OrderViewModel } from "./types";

interface OrderTabsProps {
  activeFilter: FilterType;
  orders: OrderViewModel[];
  onFilterChange: (filter: FilterType) => void;
}

const TAB_CONFIG: { key: FilterType; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "PENDING", label: "Baru" },
  { key: "CONFIRMED", label: "Diproses" },
  { key: "DELIVERED", label: "Dikirim" },
  { key: "COMPLETED", label: "Selesai" },
  { key: "CANCELLED", label: "Batal" },
];

export function OrderTabs({ activeFilter, orders, onFilterChange }: OrderTabsProps) {
  const getCounts = (filter: FilterType): number => {
    if (filter === "all") return orders.length;
    return orders.filter((o) => o.status === filter).length;
  };

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {TAB_CONFIG.map((tab) => {
        const count = getCounts(tab.key);
        const isActive = activeFilter === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              isActive
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs ${
                isActive
                  ? "bg-primary-500 text-primary-100"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
