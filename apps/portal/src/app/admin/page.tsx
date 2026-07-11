'use client';

import { Star, Users, FileText, MapPin } from 'lucide-react';

const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return 'Sangat Baik';
  if (rating >= 3.5) return 'Baik';
  if (rating >= 2.5) return 'Cukup';
  if (rating >= 1.5) return 'Kurang';
  return 'Sangat Kurang';
};

const statsCards = [
  { 
    label: 'Reputasi Vendor', 
    type: 'star-rating',
    value: 4.5,
    color: 'bg-amber-50 text-amber-600',
    iconBg: 'bg-amber-100'
  },
  { 
    label: 'Porsi Hari Ini', 
    value: '1.250', 
    subtitle: '/ Siswa',
    icon: Users,
    color: 'bg-emerald-50 text-emerald-600',
    iconBg: 'bg-emerald-100'
  },
  { 
    label: 'Laporan Aktif', 
    value: '4', 
    subtitle: 'Cek laporan',
    icon: FileText,
    color: 'bg-purple-50 text-purple-600',
    iconBg: 'bg-purple-100'
  },
];

const recentBatches = [
  { id: '#BTCH-001', date: '20 Mei 2026', total: 'Rp 4.500.000' },
  { id: '#BTCH-002', date: '19 Mei 2026', total: 'Rp 3.200.000' },
];

const nearbySchools = [
  { name: 'SMPN 03 Jakarta', vendor: null, students: 420, distance: '1,2 KM' },
  { name: 'SDN 02 Palmerah', vendor: 'CV. Dapur Sehat', students: 310, distance: '2,8 KM' },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Selamat Pagi, Dapur Sehat!</h1>
        <p className="text-sm text-gray-500 mt-1">Berikut ringkasan operasional MBG hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statsCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{stat.label}</span>
              {stat.icon && (
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
                </div>
              )}
            </div>
            {stat.type === 'star-rating' ? (
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={20} 
                      className={star <= Math.floor(stat.value) 
                        ? 'fill-amber-400 text-amber-400' 
                        : star - 0.5 <= stat.value 
                          ? 'fill-amber-400/50 text-amber-400' 
                          : 'text-gray-300'
                      } 
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">{getRatingLabel(stat.value)}</p>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                {stat.subtitle && (
                  <span className="text-sm text-gray-500">{stat.subtitle}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Pengeluaran */}
      <div className="bg-[#1E40AF] rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-medium text-blue-100 mb-2">Total Pengeluaran Seluruh Batch</h2>
        <p className="text-3xl font-bold text-white">Rp 7.700.000</p>
      </div>

      {/* Riwayat Batch */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Riwayat Batch & Pengeluaran Terbaru</h2>
        </div>
        <div className="p-5">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3">ID Batch</th>
                <th className="pb-3">Tanggal</th>
                <th className="pb-3 text-right">Total Pengeluaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-900">{batch.id}</td>
                  <td className="py-3 text-sm text-gray-600">{batch.date}</td>
                  <td className="py-3 text-sm font-medium text-gray-900 text-right">{batch.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sekolah Sekitar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Sekolah Sekitar (Radius 5km)</h2>
        </div>
        <div className="p-5 space-y-4">
          {nearbySchools.map((school) => (
            <div key={school.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#1E40AF]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{school.name}</p>
                <p className="text-xs text-gray-500">
                  {school.students} Siswa • {school.distance}
                </p>
              </div>
              <div className="text-right">
                {school.vendor ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{school.vendor}</p>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Sudah Ada Vendor
                    </span>
                  </div>
                ) : (
                  <button className="text-sm font-medium text-[#1E40AF] hover:text-blue-800">
                    Pilih sekolah
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
