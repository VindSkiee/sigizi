import { OrderViewModel } from "./types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderActionButtons } from "./OrderActionButtons";
import { Calendar } from "lucide-react";

interface OrderCardProps {
  order: OrderViewModel;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onMarkDelivered: (orderId: string) => void;
  onViewDetail: (order: OrderViewModel) => void;
  onViewPayment: (order: OrderViewModel) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatItems(items: OrderViewModel["items"]): string {
  return items.map((item) => `${item.name} ${item.quantity}${item.unit}`).join(", ");
}

function formatCurrency(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function generateOrderNumber(id: string): string {
  // Generate order number from id (last 3 characters)
  const num = id.slice(-3).replace(/\D/g, "0").padStart(3, "0");
  return `ORD-${num}`;
}

export function OrderCard({
  order,
  onAccept,
  onReject,
  onMarkDelivered,
  onViewDetail,
  onViewPayment,
}: OrderCardProps) {
  const orderNumber = generateOrderNumber(order.id);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Order Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-lg text-gray-800">{orderNumber}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-gray-700 font-medium">{order.sppgName}</p>
          <p className="text-sm text-gray-500 mt-1">Item: {formatItems(order.items)}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Calendar size={12} />
            <span>Dipesan: {formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <OrderActionButtons
          order={order}
          onAccept={onAccept}
          onReject={onReject}
          onMarkDelivered={onMarkDelivered}
          onViewDetail={onViewDetail}
          onViewPayment={onViewPayment}
        />
      </div>
    </div>
  );
}
