"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, Loader2 } from "lucide-react";

const DEFAULT_CENTER: [number, number] = [-6.5569, 107.4448];

interface ReverseGeocodeResult {
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode: string;
  fullAddress: string;
}

interface MapPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  radius?: number;
  onLocationSelect: (data: {
    latitude: number;
    longitude: number;
    province: string;
    regency: string;
    district: string;
    village: string;
    postalCode: string;
    fullAddress: string;
  }) => void;
  showDetectButton?: boolean;
  height?: string;
}

function createDraggableIcon() {
  return L.divIcon({
    className: "map-picker-marker",
    html: `<div style="
      width: 32px; height: 32px;
      background: #1E40AF;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "><div style="
      width: 10px; height: 10px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    "></div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

const draggableIcon = createDraggableIcon();

function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult> {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id&addressdetails=1`,
    { headers: { "User-Agent": "SIGIZI-App/1.0" } },
  )
    .then((res) => res.json())
    .then((data) => {
      const addr = data.address || {};
      return {
        province: addr.state || addr.region || "",
        regency: addr.city || addr.county || addr.state_district || "",
        district: addr.suburb || addr.village || addr.neighbourhood || "",
        village: addr.village || addr.hamlet || "",
        postalCode: addr.postcode || "",
        fullAddress: data.display_name || "",
      };
    })
    .catch(() => ({
      province: "",
      regency: "",
      district: "",
      village: "",
      postalCode: "",
      fullAddress: "",
    }));
}

function MapEvents({
  onMarkerDrag,
}: {
  onMarkerDrag: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMarkerDrag(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMarkerDrag]);

  return null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenterRef = useRef<[number, number]>(center);

  useEffect(() => {
    const [prevLat, prevLng] = prevCenterRef.current;
    const [lat, lng] = center;
    if (prevLat !== lat || prevLng !== lng) {
      map.setView(center, map.getZoom());
      prevCenterRef.current = center;
    }
  }, [center, map]);

  return null;
}

export function MapPicker({
  latitude,
  longitude,
  radius = 25,
  onLocationSelect,
  showDetectButton = true,
  height = "400px",
}: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    latitude != null && longitude != null ? [latitude, longitude] : null,
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsGeocoding(true);
      try {
        const result = await reverseGeocode(lat, lng);
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          province: result.province,
          regency: result.regency,
          district: result.district,
          village: result.village,
          postalCode: result.postalCode,
          fullAddress: result.fullAddress,
        });
      } finally {
        setIsGeocoding(false);
      }
    },
    [onLocationSelect],
  );

  const handleMarkerDrag = useCallback(
    (lat: number, lng: number) => {
      setPosition([lat, lng]);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        handleReverseGeocode(lat, lng);
      }, 800);
    },
    [handleReverseGeocode],
  );

  const handleDetectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Browser tidak mendukung geolokasi");
      return;
    }
    setIsDetecting(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPosition([lat, lng]);
        setIsDetecting(false);
        handleReverseGeocode(lat, lng);
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === 1) {
          setGeoError(
            "Akses lokasi ditolak. Geser pin pada peta untuk menentukan lokasi.",
          );
        } else {
          setGeoError("Gagal mendeteksi lokasi. Geser pin pada peta manual.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [handleReverseGeocode]);

  const marker = position ? (
    <Marker
      position={position}
      icon={draggableIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e: L.LeafletEvent) => {
          const marker = e.target as L.Marker;
          const { lat, lng } = marker.getLatLng();
          handleMarkerDrag(lat, lng);
        },
      }}
    />
  ) : null;

  return (
    <div className="w-full">
      <div
        className="relative w-full rounded-xl overflow-hidden border border-gray-200"
        style={{ height }}
      >
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={position ? 14 : 11}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onMarkerDrag={handleMarkerDrag} />
          {position && <RecenterMap center={position} />}
          {marker}
          {position && radius > 0 && (
            <Circle
              center={position}
              radius={radius * 1000}
              pathOptions={{
                color: "#1E40AF",
                fillColor: "#1E40AF",
                fillOpacity: 0.08,
                weight: 1.5,
              }}
            />
          )}
        </MapContainer>

        {isGeocoding && (
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm text-xs text-gray-600">
            <Loader2 className="w-3 h-3 animate-spin" />
            Mendeteksi alamat...
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {showDetectButton && (
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:bg-primary-300 transition-colors"
          >
            {isDetecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            {isDetecting ? "Mendeteksi..." : "Deteksi Lokasi Saya"}
          </button>
        )}

        {position && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span className="font-mono text-xs">
              {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </span>
          </div>
        )}
      </div>

      {geoError && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          {geoError}
        </div>
      )}

      {!position && (
        <p className="mt-2 text-xs text-gray-400">
          Klik peta atau tekan &quot;Deteksi Lokasi Saya&quot; untuk menentukan
          posisi
        </p>
      )}
    </div>
  );
}

export default MapPicker;
