"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Info } from "lucide-react";
import { Logo } from "@/components/features/auth/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { FileUpload } from "@/components/ui/FileUpload";
import { registerSupplier, uploadFile } from "@/lib/api";

interface FormErrors {
  name?: string;
  nib?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  province?: string;
  regency?: string;
  district?: string;
  nibFile?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nib, setNib] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [province, setProvince] = useState("");
  const [regency, setRegency] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [nibFile, setNibFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Nama toko wajib diisi";
    } else if (name.trim().length < 3) {
      newErrors.name = "Nama toko minimal 3 karakter";
    }

    if (!nib.trim()) {
      newErrors.nib = "NIB wajib diisi";
    }

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!password) {
      newErrors.password = "Password wajib diisi";
    } else if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    if (!province.trim()) {
      newErrors.province = "Provinsi wajib diisi";
    }

    if (!regency.trim()) {
      newErrors.regency = "Kabupaten/Kota wajib diisi";
    }

    if (!district.trim()) {
      newErrors.district = "Kecamatan wajib diisi";
    }

    if (!nibFile) {
      newErrors.nibFile = "File NIB wajib diupload";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Upload NIB file if provided (optional - backend doesn't require it)
      if (nibFile) {
        try {
          await uploadFile(nibFile);
        } catch {
          // File upload is optional, continue with registration
        }
      }

      const registerResponse = await registerSupplier({
        name: name.trim(),
        nib: nib.trim(),
        email: email.trim(),
        password,
        province: province.trim(),
        regency: regency.trim(),
        district: district.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });

      if (registerResponse.success) {
        setSuccessMessage(
          "Registrasi berhasil! Anda akan dialihkan ke halaman login...",
        );
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      setApiError(err.message || "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-3xl p-6 md:p-10">
        <Logo className="mb-6" />

        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Pusat Pendaftaran Supplier
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi dokumen utama untuk mulai menyuplai makanan bergizi
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <Input
                id="name"
                type="text"
                label="Nama Toko"
                placeholder="contoh: UD. Sumber Rejeki"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
              />

              <div>
                <label
                  htmlFor="nib"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  NIB (Nomor Induk Berusaha){" "}
                  <span className="text-red-500">*</span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                    WAJIB
                  </span>
                </label>
                <input
                  id="nib"
                  type="text"
                  placeholder="Masukkan NIB"
                  value={nib}
                  onChange={(e) => setNib(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  required
                />
                {errors.nib && (
                  <p className="mt-1 text-xs text-red-500">{errors.nib}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Nomor Induk Berusaha dari OSS
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="province"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Provinsi <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="province"
                    type="text"
                    placeholder="Jawa Barat"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    required
                  />
                  {errors.province && (
                    <p className="mt-1 text-xs text-red-500">{errors.province}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="regency"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Kabupaten <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="regency"
                    type="text"
                    placeholder="Purwakarta"
                    value={regency}
                    onChange={(e) => setRegency(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    required
                  />
                  {errors.regency && (
                    <p className="mt-1 text-xs text-red-500">{errors.regency}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Kecamatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="district"
                    type="text"
                    placeholder="Wanayasa"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    required
                  />
                  {errors.district && (
                    <p className="mt-1 text-xs text-red-500">{errors.district}</p>
                  )}
                </div>
              </div>

              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="Masukkan Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />

              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Masukkan Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
              />

              <Input
                id="confirmPassword"
                type="password"
                label="Konfirmasi Password"
                placeholder="Masukkan Konfirmasi Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                required
              />

              <Input
                id="phone"
                type="tel"
                label="No. Telepon"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <Input
                id="address"
                type="text"
                label="Alamat"
                placeholder="Masukkan Alamat Lengkap"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4">
              <FileUpload
                label="Upload Dokumen NIB"
                accept=".pdf"
                maxSize={5}
                onFileSelect={setNibFile}
                error={errors.nibFile}
                required
                helperText="Klik atau seret file PDF NIB di sini"
              />

              <div className="flex-1" />

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  Data Anda akan diverifikasi oleh AI paling lambat 1 hari
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Submit
              </Button>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary-600 font-semibold hover:underline"
          >
            Masuk
          </Link>
        </p>
      </Card>
    </div>
  );
}
