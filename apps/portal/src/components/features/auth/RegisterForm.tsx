'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { Logo } from '@/components/features/auth/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FileUpload } from '@/components/ui/FileUpload';
import { registerSupplier, uploadFile } from '@/lib/api';

interface FormErrors {
  name?: string;
  npwp?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  npwpFile?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [npwp, setNpwp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [npwpFile, setNpwpFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function validateForm(): boolean {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nama toko wajib diisi';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Nama toko minimal 3 karakter';
    }

    const npwpClean = npwp.replace(/\D/g, '');
    if (!npwp.trim()) {
      newErrors.npwp = 'NPWP wajib diisi';
    } else if (npwpClean.length < 15 || npwpClean.length > 16) {
      newErrors.npwp = 'NPWP harus 15-16 digit';
    }

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    } else if (password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    if (!npwpFile) {
      newErrors.npwpFile = 'File NPWP wajib diupload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      let npwpFileUrl = '';
      if (npwpFile) {
        const uploadResponse = await uploadFile(npwpFile);
        if (uploadResponse.success) {
          npwpFileUrl = uploadResponse.data.url;
        }
      }

      const registerResponse = await registerSupplier({
        name: name.trim(),
        npwp: npwp.replace(/\D/g, ''),
        email: email.trim(),
        password,
        npwpFileUrl,
      });

      if (registerResponse.success) {
        setSuccessMessage('Registrasi berhasil! Anda akan dialihkan ke halaman login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setApiError(err.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-3xl p-6 md:p-10">
        {/* Logo */}
        <Logo className="mb-6" />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Pusat Pendaftaran Supplier
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lengkapi dokumen utama untuk mulai menyuplai makanan bergizi
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* API Error / Success */}
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left Column: Form Fields */}
            <div className="space-y-4">
              {/* Nama Toko */}
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

              {/* NPWP */}
              <div>
                <label htmlFor="npwp" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nomor Pokok Wajib Pajak (NPWP) <span className="text-red-500">*</span>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                    WAJIB
                  </span>
                </label>
                <input
                  id="npwp"
                  type="text"
                  placeholder="Masukkan NPWP"
                  value={npwp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setNpwp(value);
                  }}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                  required
                />
                {errors.npwp && (
                  <p className="mt-1 text-xs text-red-500">{errors.npwp}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Ekstrak data otomatis via API OSS
                </p>
              </div>

              {/* Email */}
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

              {/* Password */}
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

              {/* Konfirmasi Password */}
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
            </div>

            {/* Right Column: Upload + Actions */}
            <div className="flex flex-col gap-4">
              {/* File Upload */}
              <FileUpload
                label="Upload NPWP"
                accept=".pdf"
                maxSize={5}
                onFileSelect={setNpwpFile}
                error={errors.npwpFile}
                required
                helperText="Klik atau seret file PDF NPWP di sini"
              />

              {/* Spacer to push content down */}
              <div className="flex-1" />

              {/* Verification Note */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  Data Anda akan diverifikasi oleh AI paling lambat 1 hari
                </p>
              </div>

              {/* Submit Button */}
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

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
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
