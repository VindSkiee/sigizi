'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const contracts = [
  { id: 'MOU-001', name: 'Kontrak Pengiriman Q3 2026', partner: 'SPPG Purwakarta', status: 'active', startDate: '2026-07-01', endDate: '2026-09-30', value: 50000000 },
  { id: 'MOU-002', name: 'MoU Bahan Baku', partner: 'SPPG Bandung', status: 'active', startDate: '2026-06-15', endDate: '2026-12-31', value: 120000000 },
  { id: 'MOU-003', name: 'Kontrak Ayam Segar', partner: 'SPPG Jakarta', status: 'pending', startDate: '2026-07-15', endDate: '2026-10-15', value: 75000000 },
  { id: 'MOU-004', name: 'MoU Sayuran Organik', partner: 'SPPG Bogor', status: 'expired', startDate: '2026-01-01', endDate: '2026-06-30', value: 30000000 },
];

export default function MoUPage() {
  const statusConfig = {
    active: { label: 'Aktif', variant: 'success' as const },
    pending: { label: 'Menunggu Konfirmasi', variant: 'warning' as const },
    expired: { label: 'Berakhir', variant: 'danger' as const },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">MoU Aktif</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola perjanjian kerja sama dengan SPPG</p>
      </div>

      <div className="space-y-4">
        {contracts.map((contract) => (
          <div key={contract.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{contract.id}</span>
                  <Badge variant={statusConfig[contract.status as keyof typeof statusConfig].variant}>
                    {statusConfig[contract.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mt-2">{contract.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{contract.partner}</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span>Mulai: {contract.startDate}</span>
                  <span>Selesai: {contract.endDate}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">Rp {contract.value.toLocaleString()}</p>
                {contract.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" size="sm">Konfirmasi</Button>
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
