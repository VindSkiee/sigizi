"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupplierById, updateSupplierProfile } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Building2,
  ArrowLeft,
  Save,
  Navigation,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const NOMINATIM_HEADERS = { "User-Agent": "SIGIZI-App/1.0" };

function reverseGeocode(
  lat: number,
  lng: number,
): Promise<{
  province: string;
  regency: string;
  district: string;
  village: string;
  postalCode: string;
}> {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=id&addressdetails=1`,
    { headers: NOMINATIM_HEADERS },
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

function forwardGeocode(
  query: string,
): Promise<{ latitude: number; longitude: number } | null> {
  return fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=id`,
    { headers: NOMINATIM_HEADERS },
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      return null;
    })
    .catch(() => null);
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export default function ProfilPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [nib, setNib] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [regency, setRegency] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token || !user?.supplierId) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const response = await getSupplierById(token!, user!.supplierId!);
        if (response.success) {
          const data = response.data as any;
          setName(data.name || "");
          setNib(data.npwp || "");
          setEmail(user?.email || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setProvince(data.province || "");
          setRegency(data.regency || "");
          setDistrict(data.district || "");
          setVillage(data.village || "");
          setPostalCode(data.postalCode || "");
          setLatitude(data.latitude ?? null);
          setLongitude(data.longitude ?? null);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [token, user]);

  const handleGeocodeFromAddress = useCallback(
    (prov: string, reg: string, dis: string, vil?: string) => {
      const parts = [dis, reg, prov].filter(Boolean);
      const query = parts.join(", ");
      if (query.length < 5) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const result = await forwardGeocode(query);
        if (result) {
          setLatitude(result.latitude);
          setLongitude(result.longitude);
        }
      }, 1000);
    },
    [],
  );

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

  const handleAddressChange = (
    field: "province" | "regency" | "district" | "village",
    value: string,
  ) => {
    const next = { province, regency, district, village };
    next[field] = value;
    setProvince(next.province);
    setRegency(next.regency);
    setDistrict(next.district);
    setVillage(next.village);
    handleGeocodeFromAddress(
      next.province,
      next.regency,
      next.district,
      next.village,
    );
  };

  const handleSave = async () => {
    if (!user?.supplierId) return;

    if (!name.trim()) {
      setError("Nama perusahaan wajib diisi.");
      return;
    }
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

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateSupplierProfile(token!, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        province: province.trim(),
        regency: regency.trim(),
        district: district.trim(),
        village: village.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
      });

      if (!response.success) {
        throw new Error("Gagal menyimpan profil");
      }

      setSuccess("Profil berhasil disimpan!");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan profil. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <SkeletonLine className="w-48 h-4" />
        <div className="flex items-center gap-3">
          <SkeletonLine className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <SkeletonLine className="w-48 h-6" />
            <SkeletonLine className="w-64 h-4" />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <SkeletonLine className="w-36 h-5" />
          <SkeletonLine className="w-full h-10" />
          <SkeletonLine className="w-full h-10" />
          <SkeletonLine className="w-1/2 h-10" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <SkeletonLine className="w-36 h-5" />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonLine className="w-full h-10" />
            <SkeletonLine className="w-full h-10" />
            <SkeletonLine className="w-full h-10" />
            <SkeletonLine className="w-full h-10" />
          </div>
          <SkeletonLine className="w-32 h-10" />
          <SkeletonLine className="w-full h-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/supplier"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Profil Perusahaan
            </h1>
            <p className="text-sm text-gray-500">
              Kelola informasi perusahaan dan lokasi Anda
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          {success}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Data Perusahaan
          </h2>
          <div className="space-y-4">
            <Input
              id="name"
              type="text"
              label="Nama Perusahaan"
              placeholder="contoh: UD. Sumber Rejeki"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              id="nib"
              type="text"
              label="NIB (Nomor Induk Berusaha)"
              value={nib}
              readOnly
              className="bg-gray-50"
            />
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              readOnly
              className="bg-gray-50"
            />
            <Input
              id="phone"
              type="tel"
              label="Telepon"
              placeholder="contoh: 08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Alamat & Lokasi
            </h2>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 disabled:opacity-50 transition-colors"
            >
              {isDetecting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Navigation className="w-3 h-3" />
              )}
              {isDetecting ? "Mendeteksi..." : "Deteksi Lokasi"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Isi manual atau klik deteksi untuk mengisi otomatis dari GPS.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="province"
              type="text"
              label="Provinsi"
              placeholder="contoh: Jawa Barat"
              value={province}
              onChange={(e) => handleAddressChange("province", e.target.value)}
              required
            />
            <Input
              id="regency"
              type="text"
              label="Kabupaten/Kota"
              placeholder="contoh: Purwakarta"
              value={regency}
              onChange={(e) => handleAddressChange("regency", e.target.value)}
              required
            />
            <Input
              id="district"
              type="text"
              label="Kecamatan"
              placeholder="contoh: Wanayasa"
              value={district}
              onChange={(e) => handleAddressChange("district", e.target.value)}
              required
            />
            <Input
              id="village"
              type="text"
              label="Desa/Kelurahan"
              placeholder="contoh: Wanayasa"
              value={village}
              onChange={(e) => handleAddressChange("village", e.target.value)}
            />
          </div>
          <div className="mt-4 max-w-xs">
            <Input
              id="postalCode"
              type="text"
              label="Kode Pos"
              placeholder="contoh: 41175"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Alamat Lengkap
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat lengkap (opsional)"
              rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-none"
            />
          </div>
          {latitude != null && longitude != null && (
            <p className="mt-3 text-xs text-gray-400 font-mono">
              Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Link href="/supplier" className="flex-1">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
            >
              Batal
            </Button>
          </Link>
          <Button
            type="button"
            variant="primary"
            size="lg"
            isLoading={saving}
            onClick={handleSave}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
}
