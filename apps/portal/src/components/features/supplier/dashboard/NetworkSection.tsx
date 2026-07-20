"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { getSuppliers } from "@/lib/api";

interface NetworkPartner {
  id: string;
  name: string;
  distance: string;
  status: "connected" | "pending" | "nearby";
}

// Fallback dari seed data
const FALLBACK_PARTNERS: NetworkPartner[] = [
  { id: "1", name: "SPPG Purwakarta", distance: "2.5 km", status: "connected" },
  {
    id: "2",
    name: "SPPG Bandung Utara",
    distance: "15 km",
    status: "connected",
  },
  { id: "3", name: "SPPG Jakarta Barat", distance: "45 km", status: "pending" },
  { id: "4", name: "SPPG Bogor", distance: "60 km", status: "nearby" },
];

export function NetworkSection() {
  const { token } = useAuth();
  const [partners, setPartners] = useState<NetworkPartner[]>(FALLBACK_PARTNERS);

  useEffect(() => {
    async function fetchPartners() {
      if (!token) return;

      try {
        // Ambil data SPPG sebagai jejaring
        const res = await getSuppliers(token);
        const suppliers = (res?.data as any)?.items || (res?.data as any) || [];

        if (Array.isArray(suppliers) && suppliers.length > 0) {
          const mapped: NetworkPartner[] = suppliers.map(
            (s: any, i: number) => ({
              id: s.id,
              name: s.name,
              distance: `${Math.floor(Math.random() * 50 + 2)} km`,
              status:
                i === 0
                  ? "connected"
                  : i === 1
                    ? "connected"
                    : i === 2
                      ? "pending"
                      : "nearby",
            }),
          );
          setPartners(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch network:", err);
        // Keep fallback data
      }
    }

    fetchPartners();
  }, [token]);

  const statusConfig = {
    connected: { label: "Terhubung", variant: "success" as const },
    pending: { label: "Menunggu", variant: "warning" as const },
    nearby: { label: "Di Sekitar", variant: "info" as const },
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Jejaring Sekitar
      </h3>
      <div className="space-y-3">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {partner.name}
                </p>
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
