import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-green-700 mb-4">
            SIGIZI
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            Platform Traceability Makanan MBG
          </p>
          <p className="text-gray-500">
            Pelacakan transparansi gizi dan alergen program Makan Bergizi Gratis
          </p>
        </div>

        {/* Cek Resi Section */}
        <div className="max-w-xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              🍽️ Cek Resi Makanan
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Masukkan nomor batch untuk melihat informasi gizi, alergen, dan biaya
            </p>
            <form action="/batch" method="GET" className="flex gap-2">
              <input
                type="text"
                name="number"
                placeholder="Contoh: BATCH-20260709-001"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Lacak
              </button>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Informasi Gizi</h3>
            <p className="text-gray-600 text-sm">
              Lihat detail kalori, protein, lemak, dan karbohidrat setiap makanan
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Deteksi Alergen</h3>
            <p className="text-gray-600 text-sm">
              Kenali bahan yang dapat memicu alergi sebelum mengonsumsi
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">Lapor Komplain</h3>
            <p className="text-gray-600 text-sm">
              Sampaikan keluhan dengan valid menggunakan kode Report Key
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>SIGIZI - Platform GovTech untuk Program Makan Bergizi Gratis</p>
          <p className="mt-1">Dikembangkan oleh TraceBite</p>
        </div>
      </div>
    </main>
  );
}
