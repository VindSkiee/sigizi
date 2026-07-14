import { OrderStatusWithCancel, OrderViewModel } from "./types";
import { CheckCircle, XCircle, Truck } from "lucide-react";

interface OrderActionButtonsProps {
  order: OrderViewModel;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onMarkDelivered: (orderId: string) => void;
  onViewDetail: (order: OrderViewModel) => void;
}

export function OrderActionButtons({
  order,
  onAccept,
  onReject,
  onMarkDelivered,
  onViewDetail,
}: OrderActionButtonsProps) {
  const status = order.status;

  if (status === "PENDING") {
    return (
      <div className="flex flex-wrap gap-2 md:items-end">
        <button
          onClick={() => onAccept(order.id)}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <CheckCircle size={16} />
          Konfirmasi
        </button>
        <button
          onClick={() => onReject(order.id)}
          className="px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <XCircle size={16} />
          Tolak
        </button>
        <button
          onClick={() => onViewDetail(order)}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto"
        >
          Rincian Pesanan
        </button>
      </div>
    );
  }

  if (status === "CONFIRMED") {
    return (
      <div className="flex flex-wrap gap-2 md:items-end">
        <button
          onClick={() => onMarkDelivered(order.id)}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Truck size={16} />
          Tandai Dikirim
        </button>
        <button
          onClick={() => onViewDetail(order)}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto"
        >
          Rincian Pesanan
        </button>
      </div>
    );
  }

  if (
    status === "DELIVERED" ||
    status === "COMPLETED" ||
    status === "CANCELLED"
  ) {
    return (
      <div className="flex flex-wrap gap-2 md:items-end">
        <button
          onClick={() => onViewDetail(order)}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto"
        >
          Rincian Pesanan
        </button>
      </div>
    );
  }

  return null;
}
