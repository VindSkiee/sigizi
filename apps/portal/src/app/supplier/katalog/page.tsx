"use client";

import { getImageUrl } from "@/lib/utils";

import { useState, useEffect, useCallback } from "react";
import { Package, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMediaUrl,
  getSupplierItems,
  addSupplierItem,
  updateSupplierItem,
  removeSupplierItem,
} from "@/lib/api";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import {
  ProductCreateModal,
  ProductEditModal,
  ProductData,
} from "@/components/features/supplier/katalog";

interface Product {
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
  commodityName?: string;
  categoryId?: string;
  categoryName?: string;
  referencePrice?: number;
}

export default function KatalogPage() {
  const { token, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "danger";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "danger",
    onConfirm: () => {},
  });

  const fetchProducts = useCallback(async () => {
    if (!token || !user?.supplierId) return;

    try {
      const response = await getSupplierItems(token, user.supplierId);
      if (response.success) {
        const rawItems = (response.data as any) || [];
        const mapped = rawItems.map((item: any) => ({
          ...item,
          image: getMediaUrl(item.image),
          commodityName: item.commodity?.name ?? null,
          categoryId: item.commodity?.category?.id ?? null,
          categoryName: item.commodity?.category?.name ?? null,
          referencePrice: item.commodity?.referencePrice ?? null,
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateProduct = async (data: any) => {
    const { imageFile, ...rest } = data;
    const response = await addSupplierItem(token!, user!.supplierId!, rest, imageFile);
    if (!response.success) {
      throw new Error("Gagal menyimpan produk");
    }
    await fetchProducts();
  };

  const handleEditProduct = async (data: any) => {
    if (!editingProduct) return;
    const { imageFile, ...rest } = data;
    const response = await updateSupplierItem(
      token!,
      user!.supplierId!,
      editingProduct.id,
      rest,
      imageFile,
    );
    if (!response.success) {
      throw new Error("Gagal mengupdate produk");
    }
    await fetchProducts();
  };

  const handleDeleteProduct = (productId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Produk",
      message:
        "Jika produk masih terkait pesanan, produk akan dinonaktifkan (sembunyi dari katalog). Jika tidak ada referensi, produk akan dihapus permanen.",
      variant: "danger",
      onConfirm: () => confirmDeleteProduct(productId),
    });
  };

  const confirmDeleteProduct = async (productId: string) => {
    try {
      const response = await removeSupplierItem(token!, productId);
      if (!response.success) {
        throw new Error("Gagal menghapus produk");
      }
      await fetchProducts();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus produk");
    } finally {
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      unit: product.unit,
      basePrice: product.basePrice,
      description: product.description,
      minOrderQty: product.minOrderQty,
      orderStep: product.orderStep,
      isAvailable: product.isAvailable,
      stock: product.stock,
      image: product.image,
      commodityId: product.commodityId,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      referencePrice: product.referencePrice,
    });
    setShowEditModal(true);
  };

  const filteredProducts = products
    .filter((p) => !(p as any).deletedAt)
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="animate-pulse bg-gray-200 rounded w-48 h-7" />
            <div className="animate-pulse bg-gray-200 rounded w-64 h-4" />
          </div>
          <div className="animate-pulse bg-gray-200 rounded w-36 h-10" />
        </div>
        <div className="animate-pulse bg-gray-200 rounded w-full h-10" />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-12 text-center">
            <div className="animate-pulse bg-gray-200 rounded w-12 h-12 mx-auto mb-3" />
            <div className="animate-pulse bg-gray-200 rounded w-32 h-4 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Katalog Produk</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola produk yang Anda jual
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Cari produk..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? "Produk tidak ditemukan" : "Belum ada produk"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Produk
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Komoditas
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Kategori
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Satuan
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Harga
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Stok
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Min. Order
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img
                          src={getImageUrl(product.image)}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-gray-700 block">
                          {product.name}
                        </span>
                        {product.description && (
                          <span className="text-xs text-gray-400 line-clamp-1">
                            {product.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.commodityName || (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.categoryName || (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Rp {product.basePrice.toLocaleString("id-ID")}/
                    {product.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.stock != null ? (
                      <span
                        className={
                          product.stock <= 0
                            ? "text-red-600 font-medium"
                            : product.stock <= 10
                              ? "text-amber-600"
                              : "text-gray-600"
                        }
                      >
                        {product.stock}
                      </span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.minOrderQty || 1} {product.unit}
                  </td>
                  <td className="px-6 py-4">
                    {product.isAvailable ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Tersedia
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        Habis
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit produk"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ProductCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProduct}
      />

      <ProductEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        onSubmit={handleEditProduct}
        product={editingProduct}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmLabel="Ya, Hapus"
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
