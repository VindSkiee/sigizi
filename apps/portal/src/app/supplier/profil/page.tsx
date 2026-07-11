'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupplierById, updateSupplier } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProfilPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    npwp: '',
    phone: '',
    address: '',
    email: user?.email || '',
  });

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
          setProfile({
            name: data.name || '',
            npwp: data.npwp || '',
            phone: data.phone || '',
            address: data.address || '',
            email: user?.email || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [token, user]);

  async function handleSave() {
    if (!user?.supplierId) return;
    
    setSaving(true);
    try {
      await updateSupplier(token!, user.supplierId, {
        phone: profile.phone,
        address: profile.address,
      });
      alert('Profil berhasil disimpan!');
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profil Perusahaan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi perusahaan Anda</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <form className="space-y-4 max-w-2xl" onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Nama Perusahaan"
            value={profile.name}
            readOnly
            className="bg-gray-50"
          />
          <Input
            label="NPWP"
            value={profile.npwp}
            readOnly
            className="bg-gray-50"
          />
          <Input
            label="Email"
            value={profile.email}
            readOnly
            className="bg-gray-50"
          />
          <Input
            label="Telepon"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="Masukkan nomor telepon"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Masukkan alamat lengkap"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
