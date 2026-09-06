"use client";

import { getImageUrl } from "@/lib/utils";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMediaUrl,
  getSupplierById,
  updateSupplierProfile,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  Save,
  Navigation,
  Loader2,
  Camera,
  X,
  Lock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

import { reverseGeocode, forwardGeocode } from "@/lib/geocoding";
import { cn } from "@/lib/utils";

function validCoordinate(value: unknown, min: number, max: number) {
  const coordinate = typeof value === "number" ? value : Number(value);
  return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max
    ? coordinate
    : null;
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
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
  const [openStatus, setOpenStatus] = useState(true);
  const [existingProfileImage, setExistingProfileImage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

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
          setLatitude(validCoordinate(data.latitude, -90, 90));
          setLongitude(validCoordinate(data.longitude, -180, 180));
          setOpenStatus(data.openStatus ?? true);
          setExistingProfileImage(getMediaUrl(data.profileImage));
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
        setError("Gagal mendeteksi lokasi. Silakan isi alamat secara manual.");
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
    if (
      latitude != null &&
      validCoordinate(latitude, -90, 90) == null
    ) {
      setError("Latitude harus berada di antara -90 dan 90.");
      return;
    }
    if (
      longitude != null &&
      validCoordinate(longitude, -180, 180) == null
    ) {
      setError("Longitude harus berada di antara -180 dan 180.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateSupplierProfile(
        token!,
        {
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
          openStatus,
        },
        profileImageFile || undefined,
      );

      if (!response.success) {
        throw new Error("Gagal menyimpan profil");
      }

      setSuccess("Profil berhasil disimpan!");
      window.dispatchEvent(new Event("supplier-profile-updated"));
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
        <SkeletonLine className="w-full h-40 rounded-xl" />
        <SkeletonLine className="w-full h-64 rounded-xl" />
        <SkeletonLine className="w-full h-20 rounded-xl" />
        <SkeletonLine className="w-full h-80 rounded-xl" />
        <SkeletonLine className="w-full h-12 rounded-lg" />
      </div>
    );
  }

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

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
        <h1 className="text-2xl font-bold text-gray-900">
          Profil Perusahaan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola informasi perusahaan dan lokasi Anda
        </p>
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
        {/* ── Card Profil Toko ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <input
            ref={profileImageInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setProfileImageFile(file);
            }}
          />

          <div className="flex flex-col items-center">
            {profileImageFile ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(profileImageFile)}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-green-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setProfileImageFile(null);
                    if (profileImageInputRef.current)
                      profileImageInputRef.current.value = "";
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : existingProfileImage ? (
              <img
                src={getImageUrl(existingProfileImage)}
                alt="Profil"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                {initials ? (
                  <span className="text-2xl font-bold text-gray-400">
                    {initials}
                  </span>
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => profileImageInputRef.current?.click()}
              className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Ganti foto
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {name || "Nama Toko"}
            </h2>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                openStatus
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500",
              )}
            >
              {openStatus ? "Aktif" : "Nonaktif"}
            </span>
          </div>
        </div>

        {/* ── Card Data Perusahaan ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Data perusahaan
          </h2>
          <div className="space-y-4">
            <Input
              id="name"
              type="text"
              label="Nama perusahaan"
              placeholder="contoh: Toko Berkah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <Input
                id="nib"
                type="text"
                label="NIB (nomor induk berusaha)"
                value={nib}
                readOnly
                placeholder="Masukkan nomor NIB"
                className={cn(
                  "bg-white",
                  !nib &&
                    "border-amber-400 focus:ring-amber-400 focus:border-amber-400",
                )}
              />
              {!nib && (
                <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Belum diisi, lengkapi untuk verifikasi toko
                </p>
              )}
            </div>

            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              readOnly
              suffix={<Lock className="w-4 h-4" />}
              className="bg-gray-50 cursor-not-allowed"
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

        {/* ── Card Status Toko ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Status toko</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {openStatus
                  ? "Toko terlihat oleh pembeli"
                  : "Sembunyikan dari pencarian"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpenStatus(!openStatus)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                openStatus ? "bg-green-600" : "bg-gray-300",
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  openStatus ? "translate-x-6" : "translate-x-1",
                )}
              />
            </button>
          </div>
        </div>

        {/* ── Card Alamat & Lokasi ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Alamat & Lokasi
            </h2>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
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
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none"
            />
          </div>
          {latitude != null && longitude != null && (
            <p className="mt-3 text-xs text-gray-400 font-mono">
              Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}
        </div>

        {/* ── Tombol Simpan ── */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          isLoading={saving}
          onClick={handleSave}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          Simpan perubahan
        </Button>
      </div>
    </div>
  );
}
