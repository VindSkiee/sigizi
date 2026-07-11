import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface NetworkPartner {
  id: string;
  name: string;
  distance: string;
  status: 'connected' | 'pending' | 'nearby';
}

interface NetworkSectionProps {
  partners?: NetworkPartner[];
}

export function NetworkSection({
  partners = [
    { id: '1', name: 'SPPG Purwakarta', distance: '2.5 km', status: 'connected' },
    { id: '2', name: 'SPPG Bandung Utara', distance: '15 km', status: 'connected' },
    { id: '3', name: 'SPPG Jakarta Barat', distance: '45 km', status: 'pending' },
    { id: '4', name: 'SPPG Bogor', distance: '60 km', status: 'nearby' },
  ],
}: NetworkSectionProps) {
  const statusConfig = {
    connected: { label: 'Terhubung', variant: 'success' as const },
    pending: { label: 'Menunggu', variant: 'warning' as const },
    nearby: { label: 'Di Sekitar', variant: 'info' as const },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Jejaring Sekitar</h3>
      <div className="space-y-3">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{partner.name}</p>
                <p className="text-xs text-gray-500">{partner.distance}</p>
              </div>
            </div>
            <Badge variant={statusConfig[partner.status].variant}>
              {statusConfig[partner.status].label}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}