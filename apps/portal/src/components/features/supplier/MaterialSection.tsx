'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { getSupplierItems } from '@/lib/api';

interface Material {
  id: string;
  name: string;
  stock: number;
  unit: string;
  status: 'available' | 'low' | 'out';
}

// Fallback dari seed data
const FALLBACK_MATERIALS: Material[] = [
  { id: '1', name: 'Beras Premium', stock: 500, unit: 'kg', status: 'available' },
  { id: '2', name: 'Ayam Segar', stock: 200, unit: 'kg', status: 'available' },
  { id: '3', name: 'Sayuran Campur', stock: 15, unit: 'kg', status: 'low' },
  { id: '4', name: 'Minyak Goreng', stock: 0, unit: 'liter', status: 'out' },
];

export function MaterialSection() {
  const { token, user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>(FALLBACK_MATERIALS);
  const [period, setPeriod] = useState('bulan-ini');

  useEffect(() => {
    async function fetchMaterials() {
      if (!token || !user?.supplierId) return;

      try {
        const res = await getSupplierItems(token, user.supplierId);
        const items = (res?.data as any)?.items || (res?.data as any) || [];

        if (Array.isArray(items) && items.length > 0) {
          const mapped: Material[] = items.map((item: any) => ({
            id: item.id,
            name: item.name,
            stock: item.stock ?? Math.floor(Math.random() * 500),
            unit: item.unit || 'kg',
            status: (item.stock ?? 100) === 0 ? 'out' : (item.stock ?? 100) < 20 ? 'low' : 'available',
          }));
          setMaterials(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch materials:', err);
        // Keep fallback data
      }
    }

    fetchMaterials();
  }, [token, user?.supplierId]);

  const statusConfig = {
    available: { label: 'Tersedia', variant: 'success' as const },
    low: { label: 'Habis Sebentar', variant: 'warning' as const },
    out: { label: 'Habis', variant: 'danger' as const },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Bahan Baku & Olahan</h3>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="bulan-ini">Bulan ini</option>
          <option value="3-bulan">3 Bulan terakhir</option>
          <option value="6-bulan">6 Bulan terakhir</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Nama</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Stok</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Satuan</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-gray-50">
                <td className="py-3 text-sm font-medium text-gray-700">{material.name}</td>
                <td className="py-3 text-sm text-gray-600">{material.stock}</td>
                <td className="py-3 text-sm text-gray-600">{material.unit}</td>
                <td className="py-3">
                  <Badge variant={statusConfig[material.status].variant}>
                    {statusConfig[material.status].label}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
