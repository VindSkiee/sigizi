'use client';

import { useState } from 'react';
import { Eye, Download, X, FileText } from 'lucide-react';

type OrderStatus = 'BARU' | 'DIPROSES' | 'SELESAI' | 'GAGAL';

interface Order {
  id: string;
  sppg: string;
  items: string;
  date: string;
  status: OrderStatus;
  paymentProof?: string;
}

const mockOrders: Order[] = [
  { id: 'ORD-771', sppg: 'SPPG Bandung 01', items: 'Beras 50kg, Telur 20kg', date: '22 Mei 2024', status: 'BARU' },
  { id: 'ORD-768', sppg: 'SPPG Cimahi Central', items: 'Daging Sapi 15kg, Wortel 30kg', date: '21 Mei 2024', status: 'DIPROSES' },
  { id: 'ORD-740', sppg: 'SPPG Padalarang', items: 'Telur Ayam 100kg', date: '18 Mei 2024', status: 'GAGAL' },
  { id: 'ORD-771', sppg: 'SPPG Bandung 01', items: 'Beras 50kg, Telur 20kg', date: '22 Mei 2024', status: 'SELESAI', paymentProof: 'struk_transfer_INV-202405-771.jpg' },
];

const filterMap: Record<string, OrderStatus | null> = {
  SEMUA: null,
  BARU: 'BARU',
  DIPROSES: 'DIPROSES',
  SELESAI: 'SELESAI',
  BATAL: 'GAGAL',
};

export default function PesananPage() {
  const [filter, setFilter] = useState('SEMUA');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const targetStatus = filterMap[filter];
  const filteredOrders = targetStatus === null 
    ? mockOrders 
    : mockOrders.filter(o => o.status === targetStatus);

  const getStatusBadge = (status: OrderStatus) => {
    const styles = {
      BARU: 'bg-blue-50 text-blue-700 border-blue-200',
      DIPROSES: 'bg-amber-50 text-amber-700 border-amber-200',
      SELESAI: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      GAGAL: 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pesanan Masuk</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau dan kelola permintaan logistik dari unit SPPG.</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {['SEMUA', 'BARU', 'DIPROSES', 'SELESAI', 'BATAL'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order, idx) => (
          <div key={`${order.id}-${idx}`} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg text-gray-800">{order.id}</span>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm text-gray-700 font-medium">{order.sppg}</p>
                <p className="text-sm text-gray-500 mt-1">Item: {order.items}</p>
                <p className="text-xs text-gray-400 mt-2">Dipesan: {order.date}</p>
              </div>
              
              <div className="flex flex-row md:flex-col gap-2 md:items-end">
                {order.status === 'BARU' && (
                  <>
                    <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto">
                      Konfirmasi
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto">
                      Tolak
                    </button>
                  </>
                )}
                {(order.status === 'DIPROSES' || order.status === 'GAGAL') && (
                  <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto">
                    Detail Pesanan
                  </button>
                )}
                {order.status === 'SELESAI' && (
                  <>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Lihat Bukti Pembayaran
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto">
                      Detail Pesanan
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Bukti Pembayaran */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Bukti Pembayaran</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="bg-gray-100 rounded-xl p-8 w-full flex items-center justify-center min-h-[320px] border-2 border-dashed border-gray-300 relative group cursor-pointer hover:bg-gray-200 transition-colors">
                <div className="text-center text-gray-400 group-hover:text-gray-500 transition-colors">
                  <FileText size={48} className="mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">{selectedOrder.paymentProof || 'bukti_pembayaran.jpg'}</p>
                  <p className="text-xs text-gray-400 mt-1">Klik untuk melihat penuh</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6 w-full justify-end">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Eye size={16} /> Lihat Penuh
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Download size={16} /> Unduh Gambar
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
