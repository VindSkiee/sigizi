"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMarketItemDetail } from "@/lib/api";
import { addDraftItem } from "@/lib/draft";
import { formatCurrency } from "@/lib/utils";
import { OrderQuantityModal } from "@/components/features/admin/market/OrderQuantityModal";
import { MarketSupplierItem } from "@/components/features/admin/market/types";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ArrowLeft,
  Box,
  CheckCircle,
  Clock,
  MapPin,
  Navigation,
  Package,
  Phone,
  ShoppingCart,
  Store,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

interface ItemDetail {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
  description?: string;
  minOrderQty?: number;
  orderStep?: number;
  isAvailable: boolean;
  image?: string;
  stock?: number;
  priceUpdatedAt?: string;
  stockUpdatedAt?: string;
  commodityId?: string;
  commodity?: {
    id: string;
    name: string;
    referencePrice?: number;
    category?: {
      id: string;
      name: string;
    };
  };
}

interface SupplierDetail {
  id: string;
  name: string;
  phone?: string;
  profileImage?: string;
  address?: string;
  province?: string;
  regency?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  openStatus?: boolean;
  isMarketSeller?: boolean;
  marketName?: string;
}

interface ItemDetailResponse {
  item: ItemDetail;
  supplier: SupplierDetail;
}

function timeAgo(dateStr?: string): string | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ItemDetailResponse | null>(null);
  const [showQtyModal, setShowQtyModal] = useState(false);

  useEffect(() => {
    if (!token || !params.itemId) return;

    async function fetchDetail() {
      try {
        const res = await getMarketItemDetail(token!, params.itemId as string);
        if (res.success) {
          setData(res.data as ItemDetailResponse);
        } else {
          setError("Item tidak ditemukan");
        }
      } catch (err: any) {
        setError(err.message || "Gagal memuat detail item");
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [token, params.itemId]);

  const handleConfirmOrder = useCallback(
    (quantity: number) => {
      if (!data) return;

      addDraftItem({
        itemId: data.item.id,
        supplierId: data.supplier.id,
        supplierName: data.supplier.name,
        itemName: data.item.name,
        unitPrice: data.item.basePrice,
        quantity,
        unit: data.item.unit,
        minOrderQty: data.item.minOrderQty,
        orderStep: data.item.orderStep,
      });

      setShowQtyModal(false);
      router.push("/admin/market");
    },
    [data, router],
  );

  const toSupplierItem = useCallback((): MarketSupplierItem | null => {
    if (!data) return null;
    return {
      id: data.item.id,
      itemId: data.item.id,
      supplierId: data.supplier.id,
      supplierName: data.supplier.name,
      itemName: data.item.name,
      unit: data.item.unit,
      price: data.item.basePrice,
      isAnomaly: false,
      description: data.item.description,
      minOrderQty: data.item.minOrderQty,
      orderStep: data.item.orderStep,
      address: data.supplier.address,
      province: data.supplier.province,
      regency: data.supplier.regency,
      district: data.supplier.district,
      latitude: data.supplier.latitude,
      longitude: data.supplier.longitude,
      isMarketSeller: data.supplier.isMarketSeller,
      marketName: data.supplier.marketName,
      stock: data.item.stock,
      openStatus: data.supplier.openStatus ? "OPEN" : "CLOSED",
      categoryName: data.item.commodity?.category?.name,
      commodityName: data.item.commodity?.name,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/market"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Pasar
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{error || "Item tidak ditemukan"}</p>
        </div>
      </div>
    );
  }

  const { item, supplier } = data;
  const locationParts = [supplier.district, supplier.regency].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/admin/market"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Pasar
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Image */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gray-50 flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-gray-300" />
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {item.commodity?.category?.name && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {item.commodity.category.name}
                </span>
              )}
              {item.commodity?.name && (
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  {item.commodity.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{supplier.name}</p>
          </div>

          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-0.5">Harga per {item.unit}</p>
            <p className="text-3xl font-bold text-primary-600">
              {formatCurrency(item.basePrice)}
            </p>
            {item.commodity?.referencePrice && (
              <p className="text-xs text-gray-500 mt-1">
                HET Nasional: {formatCurrency(item.commodity.referencePrice)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Box className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">Stok</span>
              </div>
              <p className={`text-lg font-bold ${
                (item.stock ?? 0) === 0
                  ? "text-red-600"
                  : (item.stock ?? 0) < 10
                    ? "text-amber-600"
                    : "text-green-600"
              }`}>
                {item.stock != null ? `${item.stock} ${item.unit}` : "N/A"}
              </p>
              {item.stockUpdatedAt && (
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {timeAgo(item.stockUpdatedAt)}
                </p>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">Min. Order</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {item.minOrderQty ?? 1} {item.unit}
              </p>
              {item.orderStep && item.orderStep > 1 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Kelipatan: {item.orderStep} {item.unit}
                </p>
              )}
            </div>
          </div>

          {item.priceUpdatedAt && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Harga diperbarui: {timeAgo(item.priceUpdatedAt)}
            </p>
          )}

          <button
            onClick={() => setShowQtyModal(true)}
            disabled={!item.isAvailable || (item.stock != null && item.stock === 0)}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {!item.isAvailable
              ? "Tidak Tersedia"
              : item.stock != null && item.stock === 0
                ? "Stok Habis"
                : "Pesan Sekarang"}
          </button>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profil Supplier</h2>
        <div className="flex items-start gap-4">
          {supplier.profileImage ? (
            <img
              src={supplier.profileImage}
              alt={supplier.name}
              className="w-14 h-14 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Store className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">{supplier.name}</h3>
              {supplier.openStatus ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  🟢 Buka
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  🔴 Tutup
                </span>
              )}
            </div>

            {supplier.isMarketSeller && supplier.marketName && (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <Store className="w-3 h-3" />
                {supplier.marketName}
              </p>
            )}

            {(supplier.address || locationParts.length > 0) && (
              <a
                href={
                  supplier.latitude != null && supplier.longitude != null
                    ? `https://www.google.com/maps?q=${supplier.latitude},${supplier.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        (supplier.address ? supplier.address + ", " : "") +
                          locationParts.join(", "),
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-1.5 group"
              >
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0 group-hover:text-primary-500" />
                <p className="text-sm text-gray-600 group-hover:text-primary-600 underline decoration-dotted underline-offset-2">
                  {supplier.address}
                  {supplier.address && locationParts.length > 0 && (
                    <span className="text-gray-400">, {locationParts.join(", ")}</span>
                  )}
                  {!supplier.address && locationParts.length > 0 && (
                    <span>{locationParts.join(", ")}</span>
                  )}
                </p>
              </a>
            )}

            {supplier.phone && (
              <a
                href={`tel:${supplier.phone}`}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary-600"
              >
                <Phone className="w-3.5 h-3.5" />
                {supplier.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Deskripsi</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
        </div>
      )}

      {/* Order Quantity Modal */}
      {data && (
        <OrderQuantityModal
          isOpen={showQtyModal}
          onClose={() => setShowQtyModal(false)}
          item={toSupplierItem()}
          onConfirm={handleConfirmOrder}
        />
      )}
    </div>
  );
}
