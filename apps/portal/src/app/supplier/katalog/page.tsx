"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Plus, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupplierItems, addSupplierItem } from "@/lib/api";
import { ProductCreateModal } from "@/components/features/supplier/katalog";

interface Product {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
  description?: string;
  minOrderQty?: number;
  orderStep?: number;
}

export default function KatalogPage() {
  const { token, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!token || !user?.supplierId) return;

    try {
      const response = await getSupplierItems(token, user.supplierId);
      if (response.success) {
        setProducts((response.data as any) || []);
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
    const response = await addSupplierItem(token!, user!.supplierId!, data);
    if (!response.success) {
      throw new Error("Gagal menyimpan produk");
    }
    await fetchProducts();
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
                  Satuan
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Harga
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Min. Order
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700 block">
                          {product.name}
                        </span>
                        {product.description && (
                          <span className="text-xs text-gray-400">
                            {product.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    Rp {product.basePrice.toLocaleString("id-ID")}/
                    {product.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.minOrderQty || 1} {product.unit}
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
    </div>
  );
}
