'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const orders = [
  { id: 'ORD-001', sppg: 'SPPG Purwakarta', items: 'Beras Premium (100kg)', total: 1200000, status: 'pending', date: '2026-07-09' },
  { id: 'ORD-002', sppg: 'SPPG Bandung', items: 'Ayam Segar (50kg)', total: 1750000, status: 'pending', date: '2026-07-08' },
  { id: 'ORD-003', sppg: 'SPPG Jakarta', items: 'Sayuran Campur (30kg)', total: 450000, status: 'confirmed', date: '2026-07-07' },
  { id: 'ORD-004', sppg: 'SPPG Purwakarta', items: 'Telur Ayam (20kg)', total: 440000, status: 'delivered', date: '2026-07-06' },
];

export default function PesananPage() {
  const [filter, setFilter] = useState('all');

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const statusConfig = {
    pending: { label: 'Menunggu', variant: 'warning' as const },
    confirmed: { label: 'Dikonfirmasi', variant: 'info' as const },
    delivered: { label: 'Selesai', variant: 'success' as const },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pesanan Baru</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola pesanan masuk dari SPPG</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'confirmed', 'delivered'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'Semua' : statusConfig[f as keyof typeof statusConfig].label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{order.id}</span>
                  <Badge variant={statusConfig[order.status as keyof typeof statusConfig].variant}>
                    {statusConfig[order.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{order.sppg}</p>
                <p className="text-sm text-gray-500 mt-1">{order.items}</p>
                <p className="text-xs text-gray-400 mt-2">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">Rp {order.total.toLocaleString()}</p>
                {order.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" size="sm">Terima</Button>
                    <Button variant="outline" size="sm">Tolak</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
