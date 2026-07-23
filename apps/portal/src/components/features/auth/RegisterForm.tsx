"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  User,
  MapPin,
  Navigation,
  Loader2,
  Info,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { Logo } from "@/components/features/auth/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { registerSupplier } from "@/lib/api";
import { cn } from "@/lib/utils";
import ErrorTooltip from "@/components/ui/ErrorTooltip";

// ─── Geocoding helpers ────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────

const STEPS = [
  { label: "Akun", icon: User },
  { label: "Lokasi", icon: MapPin },
  { label: "Konfirmasi", icon: Check },
];

const provinces = [
  "ACEH",
  "SUMATERA_UTARA",
  "SUMATERA_BARAT",
  "RIAU",
  "JAMBI",
  "SUMATERA_SELATAN",
  "BENGKULU",
  "LAMPUNG",
  "KEPULAUAN_BANGKA_BELITUNG",
  "KEPULAUAN_RIAU",
  "DKI_JAKARTA",
  "JAWA_BARAT",
  "JAWA_TENGAH",
  "DI_YOGYAKARTA",
  "JAWA_TIMUR",
  "BANTEN",
  "BALI",
  "NUSA_TENGGARA_BARAT",
  "NUSA_TENGGARA_TIMUR",
  "KALIMANTAN_BARAT",
  "KALIMANTAN_TENGAH",
  "KALIMANTAN_SELATAN",
  "KALIMANTAN_TIMUR",
  "KALIMANTAN_UTARA",
  "SULAWESI_UTARA",
  "SULAWESI_TENGAH",
  "SULAWESI_SELATAN",
  "SULAWESI_TENGGARA",
  "GORONTALO",
  "SULAWESI_BARAT",
  "MALUKU",
  "MALUKU_UTARA",
  "PAPUA_BARAT",
  "PAPUA",
];

type FormErrors = Record<string, string>;

// ─── Component ────────────────────────────────────────────────

export function RegisterForm() {
  const [step, setStep] = useState(0);

  // Step 1 — Akun
  const [name, setName] = useState("");
  const [nib, setNib] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 — Lokasi
  const [isMarketSeller, setIsMarketSeller] = useState(false);
  const [marketName, setMarketName] = useState("");
  const [province, setProvince] = useState("");
  const [regency, setRegency] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Geocoding ────────────────────────────────────────────

  const handleGeocodeFromAddress = useCallback(
    (prov: string, reg: string, dis: string) => {
      const parts = [dis, reg, prov].filter(Boolean);
      const query = parts.join(", ");
      if (query.length < 5) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=id`,
            { headers: NOMINATIM_HEADERS },
          );
          const data = await res.json();
          if (data.length > 0) {
            setLatitude(parseFloat(data[0].lat));
            setLongitude(parseFloat(data[0].lon));
          }
        } catch {
          /* silent */
        }
      }, 1000);
    },
    [],
  );

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setApiError("Browser tidak mendukung geolokasi.");
      return;
    }

    setIsDetecting(true);
    setApiError("");

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
        setApiError(
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
    handleGeocodeFromAddress(next.province, next.regency, next.district);
  };

  // ─── Validation ───────────────────────────────────────────

  function validateStep(s: number): boolean {
    const e: FormErrors = {};

    if (s === 0) {
      if (!name.trim()) e.name = "Nama toko wajib diisi";
      else if (name.trim().length < 3) e.name = "Minimal 3 karakter";

      if (!nib.trim()) e.nib = "NIB wajib diisi";

      if (!email.trim()) e.email = "Email wajib diisi";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        e.email = "Format email tidak valid";

      if (!password) e.password = "Password wajib diisi";
      else if (password.length < 8) e.password = "Minimal 8 karakter";

      if (!confirmPassword) e.confirmPassword = "Wajib diisi";
      else if (password !== confirmPassword)
        e.confirmPassword = "Password tidak cocok";
    }

    if (s === 1) {
      if (!province) e.province = "Provinsi wajib dipilih";
      if (!regency.trim()) e.regency = "Kabupaten/Kota wajib diisi";
      if (isMarketSeller) {
        if (!marketName.trim()) e.marketName = "Nama pasar wajib diisi";
        else if (marketName.trim().length < 3)
          e.marketName = "Minimal 3 karakter";
      } else {
        if (!district.trim()) e.district = "Kecamatan wajib diisi";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  // ─── Navigation ───────────────────────────────────────────

  function handleNext() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 2));
      setApiError("");
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
    setApiError("");
    setErrors({});
  }

  // ─── Submit ───────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateStep(0) || !validateStep(1)) return;

    setIsLoading(true);
    setApiError("");

    try {
      const registerResponse = await registerSupplier({
        name: name.trim(),
        nib: nib.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        province,
        regency: regency.trim(),
        district: isMarketSeller ? undefined : district.trim(),
        isMarketSeller,
        marketName: isMarketSeller ? marketName.trim() : undefined,
      });

      if (registerResponse.success) {
        setSuccessMessage(
          "Registrasi berhasil! Anda akan dialihkan ke halaman login...",
        );
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 2000);
      }
    } catch (err: any) {
      if (err.details && Array.isArray(err.details)) {
        const fieldErrors: FormErrors = {};
        err.details.forEach((d: any) => {
          if (
            [
              "name",
              "nib",
              "email",
              "password",
              "phone",
              "province",
              "regency",
              "district",
            ].includes(d.field)
          ) {
            fieldErrors[d.field] = d.message;
          }
        });
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          setIsLoading(false);
          setStep(0);
          return;
        }
      }
      setApiError(err.message || "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Step Indicator ───────────────────────────────────────

  function StepIndicator() {
    return (
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((s, i) => {
          const isActive = i === step;
          const isDone = i < step;
          const Icon = s.icon;

          return (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-blue-700 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    isActive
                      ? "text-blue-700"
                      : isDone
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-12 sm:w-28 h-0.5 mx-2 mb-5 p-0.5 rounded ${
                    i < step ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────

  const provinceLabel = (p: string) => p.replace(/_/g, " ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 md:py-8">
      <div className="relative w-full max-w-2xl flex flex-col md:p-10 md:rounded-[2.5rem] md:bg-white/95 md:backdrop-blur-2xl md:border md:border-white md:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.05),_0_12px_24px_-8px_rgba(34,197,94,0.08)] md:ring-1 md:ring-gray-900/5">
        {/* Aksen Highlight Cahaya (Muncul di layar md ke atas) */}
        <div className="hidden md:block absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
        <Logo className="mb-6" />

        <div className="text-center mb-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Pusat Pendaftaran Supplier
          </h1>
          <p className="text-sm text-gray-500 mt-1 sm:mb-8">
            Lengkapi data untuk mulai menyuplai makanan bergizi
          </p>
        </div>

        <StepIndicator />

        {(apiError || successMessage) && (
          <div className="mb-6">
            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {apiError}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                {successMessage}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP 0 — INFORMASI AKUN
        ═══════════════════════════════════════════════════════ */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Informasi Akun
                </h2>
                <p className="text-xs text-gray-400">
                  Data akun untuk masuk ke sistem SIGIZI
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Input
                  id="name"
                  type="text"
                  label="Nama Toko"
                  placeholder="contoh: UD. Sumber Rejeki"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  error={errors.name}
                  required
                />

                <Input
                  id="email"
                  type="email"
                  label="Email"
                  placeholder="contoh: toko@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                  error={errors.email}
                  required
                />

                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                  error={errors.password}
                  required
                />

                <Input
                  id="confirmPassword"
                  type="password"
                  label="Konfirmasi Password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError("confirmPassword");
                  }}
                  error={errors.confirmPassword}
                  required
                />

                <Input
                  id="phone"
                  type="tel"
                  label="No. Telepon (Opsional)"
                  placeholder="contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Input
                  id="nib"
                  type="text"
                  label="NIB (Nomor Induk Berusaha) *"
                  placeholder="Masukkan NIB"
                  value={nib}
                  onChange={(e) => {
                    setNib(e.target.value);
                    clearError("nib");
                  }}
                  error={errors.nib}
                  required
                />
                <p className="mt-1 text-xs text-gray-400">
                  Nomor Induk Berusaha dari OSS
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP 1 — LOKASI & ALAMAT
        ═══════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">
                    Lokasi & Alamat
                  </h2>
                  <p className="text-xs text-gray-400">
                    Isi manual atau deteksi dari GPS
                  </p>
                </div>
              </div>
              {!isMarketSeller && (
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
                >
                  {isDetecting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Navigation className="w-3 h-3" />
                  )}
                  {isDetecting ? "Mendeteksi..." : "Deteksi Lokasi"}
                </button>
              )}
            </div>

            <label className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors">
              <input
                type="checkbox"
                checked={isMarketSeller}
                onChange={(e) => {
                  setIsMarketSeller(e.target.checked);
                  setErrors({});
                }}
                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-800">
                  Saya adalah penjual di pasar
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Centang jika Anda berjualan di pasar tradisional/modern
                </p>
              </div>
            </label>

            {isMarketSeller && (
              <div className="group">
                <label
                  className={cn(
                    "block text-sm font-medium mb-1.5 transition-colors duration-200",
                    errors.marketName
                      ? "text-gray-700 group-focus-within:text-red-500"
                      : "text-gray-700 group-focus-within:text-primary-500",
                  )}
                >
                  Nama Pasar <span className="text-red-500">*</span>
                </label>
                <ErrorTooltip error={errors.marketName}>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-2.5 text-sm bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 font-medium">
                      Pasar
                    </span>
                    <input
                      type="text"
                      placeholder="contoh: Cibeunying"
                      value={marketName}
                      onChange={(e) => {
                        setMarketName(e.target.value);
                        clearError("marketName");
                      }}
                      className={cn(
                        "w-full px-4 py-2.5 text-sm border rounded-r-lg placeholder:text-gray-400 focus:outline-none transition-colors duration-200",
                        errors.marketName
                          ? "border-red-500 group-focus-within:ring-1 group-focus-within:ring-red-500 group-focus-within:border-red-500"
                          : "border-gray-300 group-focus-within:ring-1 group-focus-within:ring-primary-500 group-focus-within:border-primary-500",
                      )}
                    />
                  </div>
                </ErrorTooltip>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="group">
                <label
                  className={cn(
                    "block text-sm font-medium mb-1.5 transition-colors duration-200",
                    errors.province
                      ? "text-gray-700 group-focus-within:text-red-500"
                      : "text-gray-700 group-focus-within:text-primary-500",
                  )}
                >
                  Provinsi <span className="text-red-500">*</span>
                </label>
                <ErrorTooltip error={errors.province}>
                  <select
                    value={province}
                    onChange={(e) => {
                      handleAddressChange("province", e.target.value);
                      clearError("province");
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none transition-colors duration-200 bg-white",
                      errors.province
                        ? "border-red-500 group-focus-within:ring-1 group-focus-within:ring-red-500 group-focus-within:border-red-500"
                        : "border-gray-300 group-focus-within:ring-1 group-focus-within:ring-primary-500 group-focus-within:border-primary-500",
                    )}
                    required
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {provinceLabel(p)}
                      </option>
                    ))}
                  </select>
                </ErrorTooltip>
              </div>

              <Input
                id="regency"
                type="text"
                label="Kabupaten/Kota"
                placeholder="contoh: PURWAKARTA"
                value={regency}
                onChange={(e) => {
                  handleAddressChange("regency", e.target.value);
                  clearError("regency");
                }}
                error={errors.regency}
                required
              />

              {!isMarketSeller && (
                <Input
                  id="district"
                  type="text"
                  label="Kecamatan"
                  placeholder="contoh: WANAYASA"
                  value={district}
                  onChange={(e) => {
                    handleAddressChange("district", e.target.value);
                    clearError("district");
                  }}
                  error={errors.district}
                  required
                />
              )}

              {!isMarketSeller && (
                <Input
                  id="village"
                  type="text"
                  label="Desa/Kelurahan"
                  placeholder="contoh: Desa Baru"
                  value={village}
                  onChange={(e) =>
                    handleAddressChange("village", e.target.value)
                  }
                />
              )}

              {!isMarketSeller && (
                <Input
                  id="postalCode"
                  type="text"
                  label="Kode Pos"
                  placeholder="contoh: 41175"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              )}
            </div>

            {!isMarketSeller && (
              <>
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 transition-colors duration-200 group-focus-within:text-primary-500">
                    Alamat Lengkap (Opsional)
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jalan, nomor, RT/RW, dll."
                    rows={2}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none transition-colors duration-200 resize-none group-focus-within:ring-1 group-focus-within:ring-primary-500 group-focus-within:border-primary-500"
                  />
                </div>

                {latitude != null && longitude != null && (
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>
                      Koordinat: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP 2 — KONFIRMASI
        ═══════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-purple-700" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Konfirmasi Data
                </h2>
                <p className="text-xs text-gray-400">
                  Pastikan data yang Anda isi sudah benar
                </p>
              </div>
            </div>

            {/* Ringkasan Akun */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Informasi Akun
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Nama Toko</span>
                  <p className="font-medium text-gray-800">{name}</p>
                </div>
                <div>
                  <span className="text-gray-400">Email</span>
                  <p className="font-medium text-gray-800">{email}</p>
                </div>
                <div>
                  <span className="text-gray-400">NIB</span>
                  <p className="font-medium text-gray-800">{nib}</p>
                </div>
                <div>
                  <span className="text-gray-400">Telepon</span>
                  <p className="font-medium text-gray-800">{phone || "-"}</p>
                </div>
              </div>
            </div>

            {/* Ringkasan Lokasi */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Lokasi & Alamat
              </h3>
              {isMarketSeller ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Tipe</span>
                    <p className="font-medium text-gray-800">Penjual Pasar</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Nama Pasar</span>
                    <p className="font-medium text-gray-800">
                      Pasar {marketName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Provinsi</span>
                    <p className="font-medium text-gray-800">
                      {provinceLabel(province)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Kabupaten/Kota</span>
                    <p className="font-medium text-gray-800">{regency}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Tipe</span>
                      <p className="font-medium text-gray-800">
                        Bukan Penjual Pasar
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Provinsi</span>
                      <p className="font-medium text-gray-800">
                        {provinceLabel(province)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Kabupaten/Kota</span>
                      <p className="font-medium text-gray-800">{regency}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Kecamatan</span>
                      <p className="font-medium text-gray-800">{district}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Desa/Kelurahan</span>
                      <p className="font-medium text-gray-800">
                        {village || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Kode Pos</span>
                      <p className="font-medium text-gray-800">
                        {postalCode || "-"}
                      </p>
                    </div>
                    {latitude != null && longitude != null && (
                      <div>
                        <span className="text-gray-400">Koordinat</span>
                        <p className="font-medium text-gray-800 font-mono text-xs">
                          {latitude.toFixed(6)}, {longitude.toFixed(6)}
                        </p>
                      </div>
                    )}
                  </div>
                  {address && (
                    <div className="mt-3">
                      <span className="text-gray-400 text-sm">
                        Alamat Lengkap
                      </span>
                      <p className="font-medium text-gray-800 text-sm">
                        {address}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Info */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Verifikasi Data
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Data Anda akan diverifikasi oleh AI paling lambat 1 hari
                  setelah pendaftaran.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            NAVIGATION BUTTONS
        ═══════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-3 mt-8">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleBack}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          )}

          {step < 2 ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleNext}
              className="flex-1"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              onClick={handleSubmit}
              className="flex-1"
            >
              Daftar Sekarang
            </Button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link
            href="/auth/login"
            onClick={() => sessionStorage.setItem("auth-slide", "right")}
            className="text-primary-600 font-semibold hover:underline cursor-pointer"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
