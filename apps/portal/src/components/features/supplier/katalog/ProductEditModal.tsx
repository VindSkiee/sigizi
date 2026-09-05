"use client";

import { useState, useEffect } from "react";
import { X, Package, Loader2 } from "lucide-react";
import { UNIT_OPTIONS } from "@sigizi/shared";
import { useAuth } from "@/contexts/AuthContext";
import { getItemCategories, getItemCommodities } from "@/lib/api";
import { FileUpload } from "@/components/ui/FileUpload";

export interface ProductData {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
  description?: string;
  minOrderQty?: number;
  orderStep?: number;
  isAvailable: boolean;
  stock?: number;
  image?: string;
  commodityId?: string;
}

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditProductData) => Promise<void>;
  product: ProductData | null;
}

export interface EditProductData {
  name: string;
  unit: string;
  basePrice: number;
  description?: string;
  minOrderQty?: number;
  orderStep?: number;
  isAvailable: boolean;
  stock?: number;
  imageFile?: File;
  commodityId?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Commodity {
  id: string;
  name: string;
}

export function ProductEditModal({
  isOpen,
  onClose,
  onSubmit,
  product,
}: ProductEditModalProps) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [description, setDescription] = useState("");
  const [minOrderQty, setMinOrderQty] = useState("");
  const [orderStep, setOrderStep] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [commodityId, setCommodityId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && product) {
      setName(product.name);
      setUnit(product.unit);
      setBasePrice(String(product.basePrice));
      setDescription(product.description || "");
      setMinOrderQty(product.minOrderQty ? String(product.minOrderQty) : "");
      setOrderStep(product.orderStep ? String(product.orderStep) : "");
      setIsAvailable(product.isAvailable);
      setStock(product.stock != null ? String(product.stock) : "");
      setImageFile(null);
      setExistingImageUrl(product.image || "");
      setCommodityId(product.commodityId || "");
      setError("");
    }
  }, [isOpen, product]);

  useEffect(() => {
    if (!token || !isOpen) return;
    getItemCategories(token).then((res) => {
      if (res.success) setCategories((res.data as any) || []);
    }).catch(() => {});
  }, [token, isOpen]);

  useEffect(() => {
    if (!token || !categoryId) {
      setCommodities([]);
      return;
    }
    getItemCommodities(token, categoryId).then((res) => {
      if (res.success) setCommodities((res.data as any) || []);
    }).catch(() => {});
  }, [token, categoryId]);

  useEffect(() => {
    if (!categoryId || !commodityId) return;
    const found = commodities.find((c) => c.id === commodityId);
    if (!found) setCommodityId("");
  }, [categoryId, commodities, commodityId]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    if (!unit.trim()) {
      setError("Satuan wajib diisi.");
      return;
    }
    if (!basePrice || Number(basePrice) < 0) {
      setError("Harga per satuan wajib diisi dengan benar.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await onSubmit({
        name: name.trim(),
        unit: unit.trim(),
        basePrice: Number(basePrice),
        description: description.trim() || undefined,
        minOrderQty: minOrderQty ? Number(minOrderQty) : undefined,
        orderStep: orderStep ? Number(orderStep) : undefined,
        isAvailable,
        stock: stock ? Number(stock) : undefined,
        imageFile: imageFile || undefined,
        commodityId: commodityId || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Gagal mengupdate produk. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Produk
              </h2>
              <p className="text-xs text-gray-500">
                Perbarui informasi produk Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Existing Image Preview */}
          {existingImageUrl && !imageFile && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Gambar Saat Ini
              </label>
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={existingImageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Image Upload */}
          <FileUpload
            accept=".jpg,.jpeg,.png,.webp"
            maxSize={5}
            onFileSelect={(file) => setImageFile(file)}
            label={existingImageUrl ? "Ganti Gambar" : "Gambar Produk"}
            helperText={existingImageUrl ? "Upload gambar baru untuk mengganti" : "Seret atau klik untuk upload gambar produk"}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="contoh: Beras Premium"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Category + Commodity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kategori <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Komoditas <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <select
                value={commodityId}
                onChange={(e) => setCommodityId(e.target.value)}
                disabled={!categoryId}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
              >
                <option value="">Pilih komoditas</option>
                {commodities.map((com) => (
                  <option key={com.id} value={com.id}>{com.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Satuan <span className="text-red-500">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="" disabled>Pilih satuan</option>
                {UNIT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Harga per Satuan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Stok <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Jumlah stok tersedia"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi{" "}
              <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat produk..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Min. Order{" "}
                <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="number"
                min="1"
                value={minOrderQty}
                onChange={(e) => setMinOrderQty(e.target.value)}
                placeholder="contoh: 10"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Langkah Order{" "}
                <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="number"
                min="1"
                value={orderStep}
                onChange={(e) => setOrderStep(e.target.value)}
                placeholder="contoh: 5"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 -mt-2">
            Langkah Order: kelipatan qty yang bisa dipesan (contoh: 5 = pesanan
            harus 10, 15, 20, dst)
          </p>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <div>
              <span className="text-sm font-medium text-gray-700">
                Tersedia
              </span>
              <p className="text-xs text-gray-500">
                {isAvailable
                  ? "Produk ditampilkan di katalog"
                  : "Produk tersembunyi dari katalog"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
