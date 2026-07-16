# SIGIZI - Proposal (Markdown)

------------------------------------------------------------------------

## Halaman 1

SIGIZI Form Pertanyaan & Jawaban 1. ID Tim Masukkan ID Tim Anda sesuai
dengan data pendaftaran. S0233 2. Nama Tim Masukkan Nama Tim Anda.
TraceBite 3. Proposal Title Masukkan judul proposal Anda. SIGIZI:
Platform GovTech Berbasis AI OCR dan QR Traceability untuk Digitalisasi
Perizinan dan Pengawasan Vendor MBG 4. Team Composition Sebutkan nama
ketua dan anggota, serta peran masing-masing dalam project ini. -
Muhammad Arvind Alaric(Ketua) - Arief Nurrahman(Frontend Engineer) -
Hafizh Kamaluddin Abdillah(Backend Engineer & AI Engineer) - Muhammad
Nawwaf Ghibran(Business Analyst & UI/UX) 5. Executive Summary Jelaskan
versi terbaru dari solusi Anda, termasuk problem utama, pendekatan
solusi, dan dampak utama yang ditargetkan. SIGIZI hadir mengatasi krisis
transparansi kualitas MBG, digitalisasi distribusi supplier, dan beban
administrasi manual SPPG. Target pengguna utamanya meliputi siswa atau
sekolah, SPPG, serta supplier bahan baku pangan. Solusi ini
mengunggulkan fitur Traceability sebagai nilai utama untuk menjamin
transparansi, keamanan pangan, dan validitas data distribusi MBG. Cara
kerjanya, siswa/sekolah memindai QR yang diberikan oleh SPPG(hanya
sekali) yang akan diarahkan ke web portal informasi batch SIGIZI untuk
mengakses informasi gizi, alergen, anggaran, serta mengirim keluhan yang
diamankan menggunakan Report Key. Di sisi hulu, SPPG mengelola pembelian
bahan baku melalui sistem supplier terintegrasi yang otomatis
menghasilkan laporan pengeluaran siap unggah. Penajaman proposal
dilakukan dengan menghapus pendaftaran ulang SPPG karena akun
terintegrasi langsung dengan sistem Portal Mitra(mitra.bgn.go.id) serta
menghapus dasbor makro BGN karena sudah tersedia Tauwas Care. Dampak
utama SIGIZI adalah transparansi kualitas MBG, digitalisasi supplier,
integrasi operasional SPPG, dan pengurangan beban administrasi manual
secara signifikan. 6. Problem Statement Sesuai dengan penulisan Problem
Statement yang sesuai. Percepatan Layanan Publik, Ekonomi Kreatif, dan
Ekspor Jasa Digital 7. Primary Sub-Problem Statement Sesuai dengan
penulisan Sub-Problem Statement yang sesuai, boleh lebih dari 1.
Digitalisasi Layanan Publik & Pariwisata - Platform Perizinan dan
Pengawasan Vendor MBG

------------------------------------------------------------------------

## Halaman 2

8.  Problem Validation Apa masalah inti yang Anda selesaikan saat ini?
    Jelaskan akar masalahnya. Pelaksanaan Makan Bergizi Gratis (MBG)
    menghadapi krisis transparansi kualitas makanan, digitalisasi
    distribusi Supplier dan inefisiensi pencatatan rantai pasok. Masalah
    ini berdampak pada siswa/sekolah yang kehilangan hak informasi gizi,
    alergen, dan jalur pelaporan valid, serta SPPG yang terbebani
    administrasi manual pembelian bahan baku ke supplier dan pemilihan
    supplier yang tepat juga terdigitalisasi. Situasi ini terjadi saat
    distribusi harian batch makanan ke sekolah, distribusi bahan baku
    Supplier ke SPPG serta saat SPPG menyusun pertanggungjawaban
    anggaran. Akar penyebabnya adalah tidak adanya pelacakan digital
    spesifik per batch di level end-user, serta belum terintegrasinya
    Supplier dengan SPPG. Sistem makro pemerintah (seperti Tauwas care)
    berfokus pada pengawasan level atas, namun memiliki celah dalam
    memvalidasi keluhan langsung dari siswa. Penyelesaian masalah ini
    krusial untuk mencegah insiden keracunan pangan, memutus potensi
    markup harga bahan, dan membebaskan SPPG dari beban laporan manual.
    Melalui implementasi QR Traceability, juga melalui sistem supplier
    yang terintegrasi langsung dengan SPPG menjadikan sistem mengamankan
    validasi data riil secara terstruktur dari hulu (supplier) hingga ke
    hilir (siswa).
9.  Problem--Solution Mapping Jelaskan secara eksplisit hubungan antara
    problem → mekanisme solusi → outcome. Masalah: Siswa atau pihak
    sekolah tidak mengetahui detail gizi atau alergen makanan, serta
    tidak memiliki jalur pengaduan kualitas makanan yang tervalidasi.
    Solusi: Fitur QR yang menyimpan link web untuk akses web portal
    pelacakan batch MBG dan sistem pelaporan menggunakan Report Key unik
    per batch. Hasil yang Diharapkan: Jaminan keamanan pangan bagi siswa
    melalui transparansi informasi seluruh batch MBG, serta terbentuknya
    rekam aduan yang 100% valid dan bebas dari laporan fiktif. Masalah:
    SPPG terutama bagian akuntan terbebani oleh pencatatan administrasi
    manual saat pembelian bahan baku dan kegiatan operasional lain,
    serta tidak adanya digitalisasi dalam penentuan harga HET yang
    mengharuskan SPPG survei ke lapangan dan pemilihan supplier yang
    tepat. Solusi: Dasbor Analitik Pasar berbasis algoritma Dynamic
    Median untuk memfilter anomali harga supplier secara real-time,
    memungkinkan SPPG menetapkan HET dan menyetujui anggaran harian
    secara instan tanpa perlu melakukan survei pasar fisik., juga sistem
    dilengkapi fitur auto-generate laporan operasional harian/mingguan.
    Hasil yang Diharapkan: Rantai pasok terdigitalisasi secara terpusat
    serta membebaskan SPPG dari penentuan HET melalui survei lapangan
    serta beban rekapitulasi manual saat membuat laporan
    harian/mingguan.
10. Ecosystem Alignment Bagaimana solusi Anda berinteraksi dengan
    stakeholder dan regulasi? SIGIZI dirancang untuk melengkapi
    infrastruktur Badan Gizi Nasional (BGN). Pihak yang terlibat
    meliputi: - SPPG & Supplier (UMKM), sebagai pengelola rantai pasok
    dan operasional dapur MBG(supplier sebagai entitas baru). -
    Sekolah/Siswa (Masyarakat), sebagai pengguna akhir portal pelacakan
    batch dan pelaporan makanan. - BGN (Regulator), sebagai pembuat
    kebijakan dan pengawas program. Sistem mengambil data autentikasi
    akun SPPG dari Portal Mitra (mitra.bgn.go.id) untuk memfasilitasi
    login. SIGIZI juga menarik data penerima manfaat langsung dari SIPGN
    agar SPPG tidak mendata ulang. Output sistem berupa laporan batch
    mingguan otomatis yang siap diunggah ke Portal Dialur(efisiensi
    fitur dari proposal 1). Fokus SIGIZI murni pada operasional rantai
    pasok. Verifikasi legalitas UMKM bukan cakupan sistem karena
    ditangani penuh oleh Tim Verifikasi BGN di awal. Implementasi ini
    dibatasi oleh ketersediaan Open API kementerian dan tingkat literasi
    digital supplier tradisional(fitur baru).

------------------------------------------------------------------------

## Halaman 3

11. Solution Approach & Mechanism Jelaskan bagaimana solusi bekerja
    secara end-to-end. SIGIZI merupakan sistem yang berfokus pada
    transparansi publik dan efisiensi operasional SPPG. Sistem ini
    berevolusi dari konsep pengawasan makro BGN dan AI-OCR, dengan
    menghapus dashboard BGN agar tidak tumpang tindih dengan Tawas Care.
    Mekanisme QR harian yang memerlukan biaya cetak juga diganti menjadi
    QR statis berbasis konsep "Cek Resi". Alur Kerja SIGIZI: 1. Input &
    Autentikasi SPPG masuk menggunakan akun resmi dari mitra.bgn.go.id.
    Data penerima manfaat otomatis terintegrasi dari SIPGN sehingga
    tidak memerlukan input ulang. Supplier mendaftar menggunakan NPWP
    dan mengunggah daftar harga bahan baku yang tersedia. 2. Proses Hulu
    (Rantai Pasok) SIGIZI menggunakan algoritma Dynamic Median untuk
    menghimpun harga supplier dalam suatu wilayah dan menyaring harga
    anomali guna mencegah markup. SPPG dapat melihat analisis rentang
    harga pasar dan menetapkan HET tanpa perlu survei lapangan. Setelah
    memilih supplier, SPPG dapat membuat pesanan mingguan serta MoU
    kerja sama (opsional). Seluruh transaksi otomatis direkap menjadi
    laporan keuangan operasional. 3. Proses Hilir (Traceability) Saat
    makanan siap didistribusikan, SPPG merilis batch yang menghasilkan
    Nomor Batch Unik dan Report Key. Interaksi Pengguna: Supplier
    menerima pesanan melalui dashboard. Siswa atau sekolah memindai QR
    statis, masuk ke web portal, dan memasukkan nomor Batch untuk
    melihat informasi gizi, alergen, biaya menu, serta biaya total
    batch. Aduan terkait makanan dapat dikirim di web portal bacth
    menggunakan Report Key sehingga valid dan bebas spam. Selanjutnya,
    akuntan SPPG cukup mengunduh laporan mingguan otomatis dari SIGIZI
    dan mengunggahnya ke Portal Dialur.
12. Impact Scale & Targets Apa dampak utama solusi Anda? Jelaskan skala
    dampaknya. Dampak utama SIGIZI berfokus pada transparansi keamanan
    pangan, efisiensi administrasi dapur, dan digitalisasi rantai pasok
    lokal. Penerima manfaat dari solusi ini meliputi: 1. Siswa dan Pihak
    Sekolah, mendapatkan akses web portal pelacakan batch yang berisi
    informasi gizi, alergen, biaya per menu, biaya total batch dan jalur
    pelaporan insiden yang 100% tervalidasi melalui Report Key pada
    setiap batch nya. 2. SPPG (Satuan Pelayanan), terbebas dari survei
    lapangan dan beban pembukuan manual berkat sistem auto-generate
    laporan transaksi harian dan mingguan. 3. Supplier (UMKM Lokal),
    memperoleh kepastian pasar dan ekosistem penawaran bahan baku yang
    terdigitalisasi berbasis kompetitif anti markup dengan sistem
    algoritma Dynamic Median. Estimasi Skala & Dampak Terukur: Jika
    diproyeksikan untuk implementasi tahap awal (pilot project) di
    lingkup satu kabupaten/kota (misalnya Kabupaten Purwakarta dengan
    \~50 SPPG), estimasi dampaknya adalah: 1. Skala Pengguna,
    mengamankan kualitas dan transparansi makanan bagi \~150.000 siswa
    (asumsi 1 SPPG melayani 3.000 porsi/hari) serta mengintegrasikan
    ratusan UMKM supplier lokal. 2. Efisiensi Waktu, memangkas waktu
    survei lapangan dan rekapitulasi data laporan keuangan dan
    operasional oleh akuntan SPPG hingga 80%, mempercepat pemenuhan
    wajib lapor di Portal Dialur. 3. Pengurangan Biaya, menghilangkan
    biaya survei pasar dan menghilangkan 100% biaya cetak QR dinamis
    harian melalui inovasi kode QR statis terpusat berkonsep "cek
    resi"(efisiensi fitur dari proposal 1). 4. Pencegahan Risiko,
    memblokir seluruh potensi laporan keluhan fiktif (spam) dan menutup
    celah markup anggaran sejak dari hulu pengadaan bahan baku.
13. Impact Measurement Bagaimana Anda mengukur keberhasilan solusi
    secara kuantitatif? Keberhasilan implementasi SIGIZI akan diukur
    melalui tiga kelompok indikator kuantitatif utama: 1. Adopsi
    Ekosistem & Integrasi Rantai Pasok Tingkat adopsi

------------------------------------------------------------------------

## Halaman 4

SPPG dengan target 80% dari total SPPG di wilayah pilot project berhasil
login dan menjalankan siklus operasional penuh menggunakan integrasi
kredensial mitra.bgn.go.id pada 3 bulan pertama(efisiensi fitur dari
proposal 1). Jumlah kemitraan Supplier mencapai rasio minimal 1:3, di
mana terdapat 3 supplier bahan baku lokal (UMKM) yang terdaftar untuk
setiap 1 SPPG aktif(kesepakatan MoU bersifat tidak wajib). 2. Efisiensi
Operasional & Pengurangan Biaya Efisiensi survei bisa dilakukan melalui
dasbor analitik(algoritma Dynamic Median) dan fitur auto-generate
laporan yang memangkasan waktu rekapitulasi laporan pengeluaran
harian/mingguan SPPG dari rata-rata 1-2 jam secara manual menjadi di
bawah 10 menit melalui fitur auto-generate untuk Portal Dialur.
Pengurangan biaya habis pakai mencapai 100% eliminasi biaya pencetakan
QR Code dinamis harian per batch melalui transisi inovasi tautan QR
statis (efisiensi fitur dari proposal 1 dengan konsep layaknya "Cek
Resi"). 3. Transparansi & Validitas Pelaporan (Traceability) Tingkat
interaksi (Engagement) pemindaian batch berjalan aktif dengan rasio
minimal 15% dari total porsi harian dilacak detail gizi dan alergennya
oleh pihak sekolah di portal publik. Tingkat akurasi pelaporan (Zero
Spam) yakni 100% keluhan kualitas makanan yang masuk ke sistem
tervalidasi dengan benar oleh Report Key, memastikan 0 (nol) kasus
laporan fiktif yang mengganggu SPPG. Peningkatan kecepatan respons (SLA)
yakni 90% dari total laporan keluhan valid yang masuk berhasil
dievaluasi dan ditindaklanjuti oleh SPPG dalam batas waktu maksimal 1x24
jam. 14. System & Public Value Proposition Bagaimana solusi memberikan
nilai terhadap sistem yang lebih luas? SIGIZI memberikan nilai sistemik
berskala nasional dalam tata kelola program Makan Bergizi Gratis (MBG),
melampaui sekadar kemudahan bagi pengguna individu: 1. Efisiensi Proses
dan Peningkatan Kualitas Data SIGIZI terintegrasi dengan SIPGN sehingga
data penerima manfaat dapat ditarik secara otomatis tanpa pendataan
ulang. Selain itu, sistem mengotomatisasi penyusunan laporan operasional
sehingga mengurangi redundansi input manual dan menghasilkan aliran data
yang lebih cepat, akurat, serta terstandarisasi antarplatform
pemerintah. 2. Pengurangan Risiko Penyelewengan Anggaran Melalui
algoritma Dynamic Median, SIGIZI menghimpun dan mengkurasi harga pasar
dengan menyaring anomali harga (outlier). SPPG dapat membandingkan
rentang harga yang wajar dan menetapkan HET secara lebih akurat tanpa
survei lapangan, sehingga risiko markup, manipulasi harga, dan potensi
kolusi dalam rantai pasok dapat diminimalkan. 3. Transparansi dan
Penguatan Integritas Pengawasan Implementasi QR Batch dan Report Key
menciptakan rekam jejak digital yang dapat diverifikasi. Masyarakat
dapat mengakses informasi distribusi dan menyampaikan aduan yang
tervalidasi, sehingga pengawasan menjadi lebih transparan, akuntabel,
dan bebas laporan fiktif. 4. Peningkatan Inklusi Ekonomi SIGIZI
menghubungkan UMKM lokal sebagai supplier dalam ekosistem pengadaan
digital yang formal. Hal ini memperluas akses pasar, mendorong
digitalisasi usaha, serta mempercepat inklusi ekonomi dan finansial di
tingkat daerah. 15. Solution Originality Apa yang benar-benar baru dari
solusi Anda dibandingkan yang sudah ada? Keunikan utama SIGIZI dibanding
sistem Makan Bergizi Gratis (MBG) eksisting terletak pada tiga aspek
inovasi proaktif. Pertama, kehadiran Sistem Supplier yang ditenagai oleh
algoritma Dynamic Median. Sistem ini secara otomatis menghimpun input
harga dari UMKM lokal dan menyaring anomali untuk mencegah praktik
markup. Melalui Dasbor Analitik Pasar ini, SPPG dapat menetapkan Harga
Eceran Tertinggi (HET) dan menyetujui anggaran harian secara akurat dari
balik meja, tanpa perlu lagi kelelahan melakukan survei pasar fisik.
Proses transaksi ini kemudian langsung diproses menjadi auto-generate
laporan keuangan. Kedua, inovasi QR Traceability beralih dari pelacakan
makro menjadi

------------------------------------------------------------------------

## Halaman 5

penelusuran mikro spesifik per batch harian menggunakan tautan QR Statis
(konsep "Cek Resi"). Pendekatan ini menihilkan beban biaya cetak harian
di dapur SPPG, sambil tetap memberikan transparansi detail menu, nilai
gizi, serta informasi krusial terkait potensi alergen secara langsung
kepada penerima manfaat. Ketiga, SIGIZI merevolusi Sistem Pelaporan.
Mengatasi kendala keluhan di lapangan yang seringkali tidak terstruktur
atau rentan manipulasi, SIGIZI menampung komplain secara terpusat.
Validitas aduan dari pihak sekolah dijamin 100% bersih dari spam atau
laporan fiktif berkat sistem verifikasi Report Key digital eksklusif
yang dihasilkan dari setiap batch makanan. Seluruh keunikan ini
disempurnakan oleh integrasi ekosistem GovTech yang efisien. Verifikasi
dokumen awal dihapus dan digantikan dengan integrasi Single Sign-On
(SSO) akun BGN, serta penarikan data sasaran penerima manfaat dilakukan
secara otomatis langsung dari sistem SIPGN sehingga SPPG tidak perlu
melakukan pendataan berulang. 16. Technological / Method Innovation Apa
pendekatan teknis/metodologi unik yang digunakan? SIGIZI menerapkan
empat pendekatan teknologi dan metode utama yang dirancang untuk
mengotomatisasi pengawasan operasional program Makan Bergizi Gratis
(MBG). Pertama, API Integration & Interoperability berfungsi
mengintegrasikan akun resmi BGN agar SPPG dapat masuk (login) tanpa
verifikasi dokumen manual , otomatis menarik data penerima manfaat dari
sistem SIPGN agar tidak perlu menginput ulang. Kedua, Web Portal &
Digital Indexing (QR Traceability) digunakan untuk menekan biaya cetak
QR fisik harian dengan mengalihkan sistem ke penyimpanan tautan menuju
portal publik web SIGIZI. Saat SPPG menyimpan data harian, sistem
otomatis menghasilkan nomor batch unik dan kode Report Key agar
masyarakat dapat mencari detail gizi layaknya melacak resi pengiriman.
Ketiga, auto-generate laporan berfungsi mengotomatisasi penyusunan
laporan pembelian bahan baku mingguan dari SPPG ke Supplier berdasarkan
kecocokan Harga Eceran Tertinggi (HET), mengotomatisasi pembuatan
laporan harian, guna membantu akuntan SPPG mencatat serta mengirimkan
laporan harian/mingguan ke pusat secara instan. Terakhir, Digital
Reporting Database berfungsi menyediakan wadah penampungan aduan digital
yang terstruktur di dalam sistem. Pendekatan ini sangat relevan untuk
mengatasi kendala operasional di lapangan, di mana laporan dari penerima
manfaat mengenai kualitas makanan sering kali hanya tersampaikan dari
mulut ke mulut. 17. Creativity in Implementation Jelaskan kreativitas
dalam distribusi, monetisasi, atau user engagement. Kreativitas
implementasi SIGIZI berfokus pada integrasi layanan eksisting dan
transparansi operasional untuk mempercepat adopsi. Strategi onboarding
dibuat sangat praktis, SPPG dapat langsung login menggunakan kredensial
akun BGN tanpa verifikasi dokumen berulang. Kemudahan ini diperkuat
dengan penarikan data sasaran penerima manfaat otomatis dari
SIPGN.Keterlibatan publik diwujudkan melalui portal web menggunakan
konsep pelacakan layaknya resi pengiriman. Mengatasi rentannya keluhan
manual yang sering berujung viral di media sosial, masyarakat dapat
melacak nomor batch harian untuk mengakses rincian menu, nilai gizi,
panduan alergen, hingga transparansi biaya. Pelaporan komplain kini
diwadahi secara terstruktur menggunakan kode Report Key unik per batch,
menjamin validitas aduan dan mencegah laporan fiktif (spam). Terakhir,
ekosistem hulu diperluas melalui Sistem Supplier yang ditenagai
algoritma Dynamic Median. Dasbor Analitik Pasar ini secara otomatis
menghimpun penawaran pemasok lokal dan memfilter harga anomali (outlier)
secara real-time guna mencegah praktik markup. Inovasi ini membebaskan
akuntan SPPG dari kewajiban survei pasar fisik yang melelahkan, mereka
cukup memantau dasbor untuk menganalisis pasar, menetapkan HET, dan
mengeksekusi pesanan.

------------------------------------------------------------------------

## Halaman 6

Seluruh transaksi tersebut kemudian diproses oleh sistem untuk
menghasilkan auto-generate laporan keuangan harian dan mingguan secara
instan. 18. System Architecture Jelaskan desain arsitektur solusi Anda
secara sistemik. Arsitektur sistem web SIGIZI dirancang secara ringkas
dan efisien dengan memadukan empat komponen utama: Frontend: Menyediakan
antarmuka web khusus yang ramah pengguna untuk peran Supplier, halaman
Portal Publik bagi masyarakat untuk memantau data batch harian, serta
tambahan Dasbor Analitik Pasar bagi SPPG untuk memantau visualisasi
kurasi harga secara instan. Backend: Mengelola seluruh logika bisnis
operasional yang kini ditenagai oleh algoritma Dynamic Median. Algoritma
ini secara otomatis menghimpun dan memfilter harga anomali (outlier)
dari supplier lokal untuk mencegah markup, menyajikan rentang harga
rasional untuk mempermudah penentuan HET. Komponen ini juga menangani
otomatisasi penyusunan laporan pembelian rutin mingguan, penyediaan
fitur unggah (upload) nota, serta pembuatan nomor batch unik dan kode
Report Key digital secara otomatis ketika data harian disimpan.
Database: Menyimpan secara terstruktur seluruh data operasional, riwayat
kalkulasi harga pasar, transaksi pembelian bahan baku, berkas salinan
bukti pembayaran, data kemitraan, hingga tiket penampungan aduan
kualitas makanan dari lapangan. API Integration: Menjadi pilar utama
interoperabilitas yang menghubungkan akun login langsung ke situs BGN
dan menarik data penerima manfaat secara otomatis dari sistem SIPGN agar
pengguna tidak perlu memilih ulang. 19. Data & Feasibility Data apa yang
digunakan? Dari mana sumbernya? SIGIZI memanfaatkan empat kelompok data
realistis dengan format standar yang aman diakses tanpa ketergantungan
pada data rahasia: Pertama, Data Otentikasi SPPG berformat teks
kredensial (string) yang sudah tersedia dari database akun resmi BGN dan
ditarik melalui integrasi login. Kedua, Data Penerima Manfaat berformat
data terstruktur (JSON) dari sistem SIPGN, ditarik otomatis lewat API
agar SPPG tidak perlu melakukan pendataan berulang. Ketiga, Data Harga &
Kemitraan Supplier berformat tabular yang memuat profil serta input
harga penawaran real-time. Data ini dikumpulkan via pengisian mandiri
supplier, yang kemudian diproses oleh algoritma Dynamic Median untuk
menyaring harga anomali (outlier) menjadi data kurasi analitik pasar
sebagai acuan penetapan HET bagi SPPG. Keempat, Data Operasional &
Pelaporan berupa nomor batch dan kode Report Key alfanumerik unik yang
diterbitkan sistem secara otomatis, berkas unggahan nota pembayaran,
serta aduan kualitas makanan dari portal publik berformat dokumen/gambar
(PDF/JPG/PNG). Data operasional ini akan terus terhimpun secara berkala
seiring berjalannya program harian. 20. Security & Compliance Bagaimana
solusi Anda menangani keamanan data dan kepatuhan? SIGIZI
mengimplementasikan arsitektur keamanan berlapis demi menjamin security
dan compliance. Kontrol akses diterapkan melalui API authentication
login menggunakan kredensial akun resmi BGN, dipadukan dengan Role-Based
Access Control (RBAC) ketat untuk memisahkan hak akses SPPG dan
Supplier. Pengguna publik hanya diberikan otoritas baca (read-only)
terbatas pada modul batch. Terkait integritas data, algoritma Dynamic
Median kini bertindak sebagai lapisan keamanan preventif yang memfilter
input harga anomali (outlier) secara otomatis guna mencegah risiko
manipulasi harga (markup) oleh supplier. Selanjutnya, integritas
pelaporan publik divalidasi menggunakan token alfanumerik Report Key
untuk menangkal infeksi aduan fiktif (spam). Seluruh data transaksi ini
kemudian

------------------------------------------------------------------------

## Halaman 7

dienkripsi di dalam database lokal. Persetujuan pengguna (user consent)
telah terpenuhi secara legal sejak fase identifikasi dokumen mitra di
portal BGN. Terhadap kepatuhan regulasi, platform ini patuh pada
kebijakan akuntabilitas Portal Dialur. SIGIZI mengotomatisasi pembukuan
laporan bahan baku menjadi dokumen PDF siap unggah, sementara input
laporan operasional dan pengiriman berkas ke Portal Dialur tetap
dilakukan secara manual. 21. Implementation Readiness (MVP) Apa scope
MVP Anda dan target pembangunannya? Fitur MVP 1. Akses & Data Otomatis
Login akun BGN dan penarikan data penerima manfaat SIPGN langsung secara
otomatis. 2. Dasbor Analitik Pasar & Manajemen Supplier Implementasi
algoritma Dynamic Median, dasbor analitik pasar untuk SPPG dan
kesepakatan MoU. 3. Autogenerate Laporan Keuangan Sistem otomatis
menyusun dan menghasilkan laporan keuangan harian/mingguan berdasarkan
history transaksi. 4. Input Manual Operasional Menu khusus untuk
mencatat biaya laporan operasional harian secara manual karena tidak
otomatis dibuat oleh sistem. 5. QR Traceability & Resi Unik Pembuatan
nomor batch, kode Report Key, dan kode QR untuk mengakses web portal
publik. 6. Portal Publik & Database Keluhan Web pelacakan makanan dan
input pengaduan berbasis Report Key. Out of Scope 1. AI & Dashboard BGN
Tidak memakai AI maupun dashboard pengawasan BGN yang rumit. 2. Upload
Otomatis Sistem tidak otomatis mengunggah data ke Portal Dialur, petugas
SPPG harus mengunduh hasil autogenerate keuangan lalu mengunggah laporan
dana tersebut secara manual ke Portal Dialur. Kebutuhan Tim &
Teknologi 1. Tim (4 Orang) Project Lead, Frontend, Backend, Business
Analyst, dan QA. 2. Teknologi Aplikasi web, database relasional
terstruktur, penyimpanan cloud berkas nota, dan integrasi API eksternal.
Tahapan Pengembangan (6--12 Bulan) 1. Bulan 1--2 Desain database serta
integrasi API login akun BGN dan sinkronisasi sistem SIPGN. 2. Bulan
3--5 Backend supplier, sistem autogenerate keuangan, menu input manual
operasional, dan fitur unggah nota belanja. 3. Bulan 6--8 Sistem QR
digital, antarmuka Portal Publik, dan database keluhan terstruktur. 4.
Bulan 9--12 Pelaksanaan pengujian dan simulasi operasional langsung di
lapangan. Risiko Teknis Utama 1. Risiko kesalahan input manual pada
laporan operasional oleh petugas yang dapat memengaruhi keakurasi hasil
autogenerate laporan keuangan. 2. Kualitas berkas foto nota bukti
pembayaran yang diunggah manual buram atau tidak sah. 3. Situs web
publik melambat akibat lonjakan trafik (concurrent hits) saat warga
mengakses web secara serentak. 22. Value Proposition Apa nilai utama
yang diterima oleh pengguna? 1. Bagi SPPG (Lebih Cepat, Mudah, & Akurat)
Petugas dapat langsung masuk memanfaatkan integrasi akun resmi BGN.
Proses pengadaan bahan baku dan penetapan HET lebih mudah lewat dasbor
analitik pasar supplier lokal anti markup(sistem dynamic median) dan
penyusunan draf transaksi mingguan. Akurasi data terjaga berkat fitur
autogenerate laporan keuangan, memudahkan petugas mengunduh berkas.
Laporan operasional harian dicatat manual guna menjamin validitas riil
di lapangan. 2. Bagi Supplier (Lebih Inklusif) Membuka akses pasar
digital terstruktur bagi UMKM katering dan penyedia bahan baku lokal
untuk membangun kemitraan (MoU) langsung dengan SPPG berdasarkan acuan
harga HET. 3. Bagi Publik & Penerima Manfaat (Lebih Transparan & Aman)
Keamanan pangan terjamin lewat penelusuran digital (QR Traceability)
berbasis web yang hemat biaya jika dibandingkan dengan solusi sebelumnya
yaitu dengan cetak fisik. Warga dapat memantau info gizi, menu, alergen,
dan rincian biaya porsi lewat pencarian resi batch, serta mengirim aduan
kualitas makanan secara valid menggunakan kode pengaman Report Key
anti-spam.

------------------------------------------------------------------------

## Halaman 8

23. Model Revenue / Funding Bagaimana solusi menghasilkan revenue atau
    pendanaan? Model pendapatan SIGIZI dirancang menggunakan arsitektur
    Dual-Licensing (B2G dan B2B) untuk memastikan keberlanjutan sistem
    tanpa membebani anggaran operasional program Makan Bergizi Gratis
    (MBG): 1. Enterprise License & Managed Services (B2G - Pendapatan
    Utama) Badan Gizi Nasional (BGN) bertindak sebagai klien Enterprise
    tunggal. Pendapatan bersumber dari pembelian lisensi sistem tata
    kelola MBG, biaya integrasi API ke portal pemerintah, serta kontrak
    pemeliharaan (Operations & Maintenance) tahunan. Skema ini
    membebaskan biaya penggunaan di tingkat SPPG dan sekolah.
24. Freemium & Commercial Add-Ons (B2B - Pendapatan Tambahan) Bagi
    supplier (UMKM lokal), pendaftaran dan seluruh transaksi pesanan MBG
    dari SPPG adalah 100% gratis dengan komisi 0%. Namun, TraceBite
    memonetisasi melalui fitur premium opsional. Jika supplier ingin
    menggunakan infrastruktur SIGIZI untuk mengelola bisnis katering
    yang lebih komprehensif, mereka dapat berlangganan paket SaaS. Fitur
    premium mencakup: Rekomendasi toko agar mudah dicari/muncul paling
    atas di list supplier, SPPG, inventory forecasting, dan dasbor
    analitik tren penjualan, untuk memancing berlangganan SIGIZI akan
    menyediakan trial agar supplier dapat mencoba fiturnya dulu.
    Pendekatan ini mengunci kepatuhan transaksi tata niaga negara agar
    tetap terekam di dalam platform, sekaligus memberikan ruang bagi
    UMKM untuk melakukan eskalasi bisnis secara mandiri.
25. Cost Structure & Sustainability Apa komponen biaya utama dan
    keberlanjutan finansialnya? Komponen biaya utama SIGIZI terbagi
    menjadi pengeluaran modal awal (CAPEX) dan biaya operasional
    (OPEX): 1. Pengembangan Teknologi & Tenaga Ahli: Biaya ditekan
    signifikan melalui alur rekayasa low-code dan integrasi API (SIPGN &
    Dialur). Fokus resource dialokasikan pada pengembangan dan pengujian
    ketat algoritma statistik Dynamic Median serta antarmuka Dasbor
    Analitik. 2. Infrastruktur Cloud & Komputasi: Menjadi biaya variabel
    utama untuk menampung traffic portal publik "Cek Resi", penyimpanan
    database supplier, dan daya komputasi (compute power) guna memproses
    algoritma Dynamic Median secara real-time. 3. Legalitas, Compliance,
    & Kemitraan: Biaya kepatuhan keamanan data privasi dan operasional
    akuisisi kerja sama B2G. 4. Operasional & Maintenance: Biaya
    pemeliharaan sistem rutin dan dukungan teknis. Keberlanjutan
    Finansial (Sustainability): SIGIZI dirancang sangat sustainable.
    Peralihan ke tautan QR statis mengeliminasi 100% biaya cetak habis
    pakai SPPG. Dengan burn rate infrastruktur yang dijaga tetap rendah,
    biaya operasional bulanan (termasuk beban komputasi pelacakan harga)
    dapat disubsidi silang dan tertutupi sepenuhnya oleh recurring
    revenue dari kontrak licensing B2G pemerintah dan langganan freemium
    dari ekosistem UMKM supplier yang terkurasi.
26. Scalability Bagaimana solusi dapat berkembang ke skala yang lebih
    besar? Faktor Pendukung Skalabilitas SIGIZI memiliki daya ekspansi
    tinggi berkat arsitektur berbasis cloud API dan pendekatan low-code
    yang modular. Keputusan mengganti QR dinamis harian menjadi tautan
    QR statis berkonsep "Cek Resi" secara signifikan memangkas beban
    komputasi server (database load) serta mengeliminasi biaya cetak
    harian. Hal ini membuat sistem siap menerima jutaan pemindaian dari
    berbagai wilayah secara simultan tanpa risiko down. Persiapan untuk
    Skala Besar Agar dapat diperluas ke jumlah pengguna, wilayah, dan
    institusi yang lebih besar, beberapa poin krusial yang perlu
    disiapkan adalah: 1. Menyusun dokumentasi Open API yang matang demi
    kelancaran penarikan data massal dari SIPGN, mitra.bgn.go.id, dan
    otomatisasi unggah ke Portal Dialur. 2. Menerapkan sistem caching
    (seperti Redis) pada portal publik guna mengantisipasi lonjakan
    ekstrim traffic pencarian nomor batch di jam

------------------------------------------------------------------------

## Halaman 9

istirahat sekolah. 3. Menyediakan modul panduan digital yang ringkas
agar supplier (UMKM) baru di berbagai daerah dapat mendaftar dan
mengelola toko mereka secara mandiri. 26. Partnership & Distribution
Bagaimana strategi distribusi dan peran mitra Anda? Strategi distribusi
SIGIZI menggunakan pendekatan Top-Down (mandat regulasi) yang dipadukan
dengan Bottom-Up (pemberdayaan komunitas). Mitra strategis yang
dilibatkan meliputi: 1. Badan Gizi Nasional (BGN) & Pemda (Regulator)
Sebagai klien utama B2G. Berperan memberikan legitimasi penggunaan
SIGIZI di SPPG serta membuka akses integrasi ke portal pemerintah
(SIPGN, Dialur, mitra.bgn.go.id). 2. Sekolah & Dinas Pendidikan
(Institusi/Masyarakat) Sebagai fasilitator end-user. Berperan mendorong
partisipasi aktif siswa dan guru dalam memindai QR "Cek Resi" untuk
transparansi gizi dan pelaporan. 3. Asosiasi UMKM & Koperasi Daerah
(Komunitas) Berperan mempercepat edukasi literasi digital dan onboarding
supplier bahan baku lokal ke dalam ekosistem SIGIZI secara masal. 4.
Bank Himbara (Lembaga Keuangan) Berperan sebagai infrastruktur pendukung
(di luar sistem) yang memfasilitasi transaksi pembayaran via Cash
Management System (CMS) dari SPPG kepada supplier. 5. Telkom University
dan Universitas Indonesia (Kampus) Sebagai mitra inkubator riset untuk
pengembangan teknologi TraceBite berkelanjutan. Melalui ekosistem ini,
jangkauan adopsi platform dapat dieksekusi secara masif dan terstruktur.
27. Problem--Market Fit Mengapa masalah ini penting bagi target pengguna
Anda? Berdasarkan wawancara, masalah transparansi tata niaga bahan baku
(HET) dan pelaporan manual sangat mendesak bagi Kepala SPPG karena
menyulitkan pengawasan kualitas makanan serta efisiensi anggaran dapur
MBG. konsekuensi meliputi: 1. Lolosnya bahan baku buruk (seperti
sayur/roti berulat) dan mismanajemen data alergi rentan memicu
keracunan. Hal ini membuka celah "sabotase" atau diviralkan, yang akan
menghancurkan kepercayaan publik terhadap program negara. 2. Praktik
monopoli dan manipulasi harga dadakan oleh supplier sangat rawan
menyebabkan pembengkakan anggaran negara (over-budget). 3. Waktu akuntan
dan Kepala SPPG terkuras habis untuk survei pasar dan rekapitulasi
laporan manual setiap hari, sehingga mengorbankan fokus mereka pada
quality control dapur. 28. Evidence of Demand Apa bukti bahwa solusi ini
dibutuhkan? (Survey, interview, dll) Berdasarkan wawancara mendalam
dengan Kepala SPPG, terbukti bahwa sistem digital terpusat sangat
dibutuhkan. Kesimpulan utama dari observasi lapangan menunjukkan
tingginya beban administrasi, akuntan dan Kepala SPPG harus menghabiskan
waktu berjam-jam untuk survei pasar manual guna menentukan HET dan
merekap laporan harian secara manual agar pagu anggaran tidak jebol.
Selain itu, terungkap praktik monopoli harga oleh supplier dan insiden
pencurian bahan baku premium oleh staf internal dapur akibat lemahnya
pencatatan sistem. Bukti lain menunjukkan masih lolosnya bahan baku tak
layak (seperti sayur dan roti berulat) dari supplier. Kepala SPPG
menegaskan bahwa tanpa pelacakan detail per batch dan manajemen alergi
yang terotomatisasi, risiko masalah kesehatan pada siswa sangat tinggi.
Hal ini terbukti sering memicu "sabotase" atau framing negatif dari
masyarakat yang bisa menghancurkan kepercayaan pada program MBG.
Didukung oleh studi industri dari CELIOS, ketiadaan transparansi
pengawasan ini berpotensi menyebabkan kebocoran anggaran negara hingga
Rp8,5 triliun. Kesimpulannya solusi SIGIZI mutlak diperlukan karena
proses manual saat ini gagal mencegah kerugian finansial

------------------------------------------------------------------------

## Halaman 10

(inflasi harga/pencurian) dan tidak memiliki sistem mitigasi cepat untuk
mencegah krisis keamanan pangan yang berujung pada hilangnya kepercayaan
publik. 29. Target Market Siapa target market utama Anda? Jelaskan
secara spesifik. Target pasar utama SIGIZI berfokus pada ekosistem
spesifik Program Makan Bergizi Gratis (MBG), yang terbagi ke dalam tiga
segmen: 1. Segmen Operasional (SPPG) sebagai operator dapur tingkat
kecamatan/kabupaten (fokus awal pada wilayah pilot project BGN).
Kebutuhan utama mereka adalah otomatisasi pelaporan keuangan ke Portal
Dialur dan efisiensi biaya pelacakan (tanpa cetak QR harian). 2. Segmen
B2B (UMKM Supplier) sebagai pemasok bahan baku pangan lokal dengan
literasi digital dasar yang mencari kepastian akses pengadaan pemerintah
secara transparan, kompetitif, sistem anti markup, dan tanpa potongan
komisi (0% fee). 3. Segmen End-User (Siswa & Sekolah) sebagai penerima
manfaat di lingkungan pendidikan yang membutuhkan transparansi informasi
gizi dan jalur pelaporan insiden keamanan makanan yang tervalidasi
melalui pemindaian QR statis. Konteks penggunaannya adalah aktivitas
harian tata niaga rantai pasok dapur MBG, di mana peluncuran awal
menyasar daerah percontohan sebelum diekspansi secara nasional mengikuti
mandat regulasi (BGN). 30. Adoption Readiness Seberapa mudah solusi Anda
diadopsi oleh pengguna? Secara operasional, target pengguna di ekosistem
MBG cukup siap mengadopsi SIGIZI. Pihak SPPG sudah terbiasa dengan
pelaporan via aplikasi pemerintah (Dialur), dan sekolah familiar dengan
alat digital dasar seperti WhatsApp atau G-Form. Akses smartphone
memadai, dan motivasi adopsi sangat tinggi karena solusi ini memangkas
waktu kerja akuntan secara drastis. Tantangan utamanya adalah rendahnya
literasi digital (gaptek) pada staf senior di dapur dan supplier lokal.
Pengguna harus beralih dari kebiasaan survei fisik dan laporan komplain
acak di WhatsApp menuju sistem input dasbor dan pemindaian QR Code.
Mengingat literasi digital supplier bervariasi, SIGIZI dibangun dengan
antarmuka web Mobile-First. Artinya, sistem sangat ringan dan
dioptimalkan sempurna untuk diakses langsung melalui smartphone tanpa
perlu instalasi rumit. UI/UX dirancang sangat ramah bagi orang awam
(meminimalisir ketikan manual) dan dilengkapi in-app guide (panduan
interaktif), sehingga edukasi teknis berjalan instan dan keengganan
supplier untuk memperbarui harga dapat teratasi dengan mudah. 31.
Progress Since the 1st Submission Apa perkembangan utama sejak
submission sebelumnya? Sejak submission pertama, kami melakukan pivot
strategis pada arsitektur teknis dan operasional SIGIZI: 1. Kami
meniadakan pembuatan dashboard khusus BGN. Alasannya, pemerintah telah
memiliki ekosistem eksisting (SIPGN & mitra.bgn.go.id). SIGIZI kini
berfokus pada integrasi Open API untuk menyuplai data operasional
langsung ke sistem pusat guna mencegah tumpang tindih (silo data). 2.
Kami membangun ekosistem pengadaan baru. UMKM supplier kini dapat
mendaftar gratis dan menerima pesanan bahan baku dari SPPG berbasis
kompetisi harga anti markup, yang juga membuka jalur monetisasi freemium
(B2B). 3. Mengubah pelacakan menjadi tautan QR Statis ("Cek Resi") untuk
mengeliminasi 100% biaya cetak harian, ditambah modul auto-generate
laporan keuangan yang langsung terhubung ke Portal Dialur.
