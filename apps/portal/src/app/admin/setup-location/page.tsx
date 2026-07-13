"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { updateSppg } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MapPin, ArrowLeft, Save, Navigation, Loader2 } from "lucide-react";

interface ReverseGeocodeResult {
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode: string;
}

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
      };
    })
    .catch(() => ({
      province: "",
      regency: "",
      district: "",
      village: "",
      postalCode: "",
    }));
}

export default function SetupLocationPage() {
  const router = useRouter();
  const { user, token, updateSppgLocation, logout } = useAuth();

  const [latitude, setLatitude] = useState<number | null>(
    user?.sppg?.latitude ?? null,
  );
  const [longitude, setLongitude] = useState<number | null>(
    user?.sppg?.longitude ?? null,
  );
  const [province, setProvince] = useState(user?.sppg?.province || "");
  const [regency, setRegency] = useState(user?.sppg?.regency || "");
  const [district, setDistrict] = useState(user?.sppg?.district || "");
  const [village, setVillage] = useState(user?.sppg?.village || "");
  const [postalCode, setPostalCode] = useState(user?.sppg?.postalCode || "");

  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolokasi.");
      return;
    }

    setIsDetecting(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        try {
          const addr = await reverseGeocode(lat, lng);
          if (addr.province) setProvince(addr.province);
          if (addr.regency) setRegency(addr.regency);
          if (addr.district) setDistrict(addr.district);
          if (addr.village) setVillage(addr.village);
          if (addr.postalCode) setPostalCode(addr.postalCode);
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        setIsDetecting(false);
        setError(
          "Gagal mendeteksi lokasi. Silakan isi alamat secara manual.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleSave = async () => {
    if (!province.trim()) {
      setError("Provinsi wajib diisi.");
      return;
    }
    if (!regency.trim()) {
      setError("Kabupaten/Kota wajib diisi.");
      return;
    }
    if (!district.trim()) {
      setError("Kecamatan wajib diisi.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (token && user?.sppgId) {
        const response = await updateSppg(token, user.sppgId, {
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          province: province.trim(),
          regency: regency.trim(),
          district: district.trim(),
          village: village.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
        });
        if (!response.success) {
          throw new Error("Gagal menyimpan lokasi");
        }
      }

      if (latitude != null && longitude != null) {
        updateSppgLocation(
          latitude,
          longitude,
          province.trim(),
          regency.trim(),
          district.trim(),
          village.trim(),
          postalCode.trim(),
        );
      }

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan lokasi. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="mb-6">
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Keluar
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Atur Lokasi SPPG
              </h1>
              <p className="text-sm text-gray-500">
                {user?.sppg?.name || "SPPG Anda"}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6 ml-13">
            Tentukan lokasi pusat untuk pencarian supplier terdekat.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-6">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 disabled:bg-primary-300 transition-colors"
            >
              {isDetecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              {isDetecting ? "Mendeteksi lokasi..." : "Deteksi Lokasi Saya"}
            </button>

            {latitude != null && longitude != null && (
              <p className="mt-2 text-xs text-gray-400 text-center font-mono">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Alamat Terstruktur
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p className="text-xs text-gray-400 -mt-2 mb-4">
            Terisi otomatis dari GPS. Bisa diedit manual jika perlu.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="province"
                type="text"
                label="Provinsi"
                placeholder="contoh: Jawa Barat"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
              />
              <Input
                id="regency"
                type="text"
                label="Kabupaten/Kota"
                placeholder="contoh: Purwakarta"
                value={regency}
                onChange={(e) => setRegency(e.target.value)}
                required
              />
              <Input
                id="district"
                type="text"
                label="Kecamatan"
                placeholder="contoh: Wanayasa"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
              <Input
                id="village"
                type="text"
                label="Desa/Kelurahan"
                placeholder="contoh: Wanayasa"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
            </div>

            <div className="max-w-xs">
              <Input
                id="postalCode"
                type="text"
                label="Kode Pos"
                placeholder="contoh: 41175"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={logout}
              className="sm:flex-1"
            >
              Keluar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              onClick={handleSave}
              className="sm:flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Lokasi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
