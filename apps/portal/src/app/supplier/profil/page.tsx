'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profil Perusahaan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi perusahaan Anda</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <form className="space-y-4 max-w-2xl">
          <Input label="Nama Perusahaan" value="PT Sumber Makmur" readOnly />
          <Input label="NPWP" value="321401234567890" readOnly />
          <Input label="Email" value="info@sumbermakmur.com" />
          <Input label="Telepon" value="081234567890" />
          <Input label="Alamat" value="Jl. Raya Utama No. 123, Purwakarta" />
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="primary">Simpan Perubahan</Button>
            <Button type="button" variant="outline">Batal</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
