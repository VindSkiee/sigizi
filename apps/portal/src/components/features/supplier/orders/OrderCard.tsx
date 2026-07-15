import { OrderViewModel } from "./types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderActionButtons } from "./OrderActionButtons";
import { Calendar, MapPin } from "lucide-react";
import { haversineDistance } from "@/lib/geo";

interface OrderCardProps {
  order: OrderViewModel;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onMarkDelivered: (orderId: string) => void;
  onViewDetail: (order: OrderViewModel) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatItemsHorizontal(items: OrderViewModel["items"]): string {
  return items
    .map((item) => `${item.name} ${item.quantity} ${item.unit}`)
    .join(", ");
}

function getDistanceKm(order: OrderViewModel): number | null {
  if (
    order.supplierLat == null ||
    order.supplierLng == null ||
    order.sppgLat == null ||
    order.sppgLng == null
  )
    return null;
  return haversineDistance(
    order.supplierLat,
    order.supplierLng,
    order.sppgLat,
    order.sppgLng,
  );
}

export function OrderCard({
  order,
  onAccept,
  onReject,
  onMarkDelivered,
  onViewDetail,
}: OrderCardProps) {
  const distance = getDistanceKm(order);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col relative">
      <div className="flex items-center relative -top-5 right-5">
        <OrderStatusBadge status={order.status} />
        {order.paidAt && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            ✓ Dibayar
          </span>
        )}
      </div>
      <p className="text-sm text-gray-900 font-semibold">{order.sppgName}</p>
      <p className="text-sm text-gray-600 mt-1">
        {formatItemsHorizontal(order.items)}
      </p>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{formatDate(order.createdAt)}</span>
        </div>

        {distance != null && (
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{distance.toFixed(1)} km</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-5 right-5">
        <OrderActionButtons
          order={order}
          onAccept={onAccept}
          onReject={onReject}
          onMarkDelivered={onMarkDelivered}
          onViewDetail={onViewDetail}
        />
      </div>
    </div>
  );
}
