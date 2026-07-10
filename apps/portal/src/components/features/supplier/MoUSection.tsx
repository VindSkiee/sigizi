import { Badge } from '@/components/ui/Badge';

interface MoU {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'expired';
  partner: string;
  date: string;
}

interface MoUSectionProps {
  pendingMoUs?: MoU[];
  activeMoUs?: MoU[];
}

export function MoUSection({
  pendingMoUs = [
    { id: '1', name: 'Kontrak Pengiriman Q3', status: 'pending', partner: 'SPPG Purwakarta', date: '2026-07-15' },
    { id: '2', name: 'MoU Bahan Baku', status: 'pending', partner: 'SPPG Bandung', date: '2026-07-20' },
  ],
  activeMoUs = [
    { id: '3', name: 'Kontrak Beras Premium', status: 'active', partner: 'SPPG Purwakarta', date: '2026-01-01' },
    { id: '4', name: 'MoU Ayam Segar', status: 'active', partner: 'SPPG Jakarta', date: '2026-03-15' },
    { id: '5', name: 'Kontrak Sayuran', status: 'active', partner: 'SPPG Bandung', date: '2026-06-01' },
  ],
}: MoUSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">MoU & Kontrak</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Butuh Konfirmasi */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Butuh Konfirmasi</span>
            <Badge variant="warning">{pendingMoUs.length}</Badge>
          </div>
          <div className="space-y-2">
            {pendingMoUs.map((mou) => (
              <div key={mou.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">{mou.name}</p>
                  <p className="text-xs text-gray-500">{mou.partner}</p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Terintegrasi SPPG */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Terintegrasi SPPG</span>
            <Badge variant="success">{activeMoUs.length}</Badge>
          </div>
          <div className="space-y-2">
            {activeMoUs.map((mou) => (
              <div key={mou.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div>
                  <p className="text-sm font-medium text-gray-700">{mou.name}</p>
                  <p className="text-xs text-gray-500">{mou.partner}</p>
                </div>
                <Badge variant="success">Aktif</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
