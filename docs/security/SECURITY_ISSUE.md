:

🔴 FULL SECURITY ASSESSMENT REPORT — SIGIZI
Target: sigizi.biz.id (Vercel) → api.sigizi.biz.id (Railway) → NeonDB + Cloudflare Repo: github.com/VindSkiee/sigizi (PUBLIC) Tanggal: 27 Juli 2026

🔴 CRITICAL — Batch Controller TANPA AUTHENTICATION SAMA SEKALI
File: apps/backend/src/modules/batch/controllers/batch.controller.ts Severity: CRITICAL (10.0)

Semua endpoint di BatchController tidak memiliki @UseGuards(JwtAuthGuard) — berbeda dengan OrderController dan ComplaintController yang sudah pakai guard.



Endpoint	Method	Ada Guard?	Dampak
/api/batches	GET	❌ TIDAK	Siapapun bisa list semua batch + data beneficiary
/api/batches/:id	GET	❌ TIDAK	Siapapun bisa lihat detail batch by ID (termasuk data sensitif)
/api/batches	POST	❌ TIDAK	Siapapun bisa CREATE BATCH — sppgId dan userId diambil dari query params bukan JWT!
/api/batches/:id/status	PUT	❌ TIDAK	Siapapun bisa UPDATE STATUS BATCH (Active → Completed/Failed)
/api/batches/by-number/:batchNumber	GET	❌ TIDAK	Public (intended)
/api/batches/by-report-key/:reportKey	GET	❌ TIDAK	Public (intended)
Exploit: Create Batch tanpa Login

bash



# Siapa pun bisa membuat batch baru
curl -X POST "https://api.sigizi.biz.id/api/batches?sppgId=CMB001&userId=USER001" \
  -H "Content-Type: application/json" \
  -d '{
    "menu": "Nasi Goreng",
    "nutrition": {"kalori": 500},
    "beneficiaryCount": 100,
    "items": [{"itemId": "ITEM001", "quantity": 50, "name": "Beras", "unit": "kg"}]
  }'
Exploit: Update Status Batch tanpa Login

bash



curl -X PUT "https://api.sigizi.biz.id/api/batches/BATCH-001/status" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED"}'
🔴 CRITICAL — Supplier Controller Endpoints Publik
File: apps/backend/src/modules/supplier/presentation/http/supplier.controller.ts Severity: HIGH (8.5)



Endpoint	Method	Ada Guard?	Dampak
/api/suppliers	GET	❌ TIDAK	Siapapun bisa list semua supplier (nama, alamat, NIB, lokasi)
/api/suppliers/:id	GET	❌ TIDAK	Siapapun bisa lihat detail supplier by ID
/api/suppliers/:id/items	GET	❌ TIDAK	Siapapun bisa lihat semua item + harga supplier
Bandingkan: endpoint GET /api/suppliers/me sudah pakai @UseGuards(JwtAuthGuard) — ini inkonsistensi yang jelas.

🔴 HIGH — JWT Secret Hardcoded Fallback di Public Repo
File: apps/backend/src/modules/auth/jwt.strategy.ts (line 15)

typescript



secretOrKey: configService.get("JWT_SECRET", "sigizi-secret-key"),
File: apps/backend/src/modules/auth/auth.module.ts (line 17)

typescript



secret: configService.get("JWT_SECRET", "sigizi-secret-key"),
signOptions: { expiresIn: configService.get("JWT_EXPIRES_IN", "7d") },
Masalah:

Fallback secret "sigizi-secret-key" ada di public repo — jika env variable JWT_SECRET tidak diset di Railway, siapapun bisa membuat JWT token valid
JWT expiry 7 hari — sangat panjang. Best practice: 15 menit untuk access token
Semua user (admin + supplier) pakai JWT yang sama — tidak ada pembedaan signing key per role
Exploit: Buat JWT Token Palsu

python



import jwt
# Jika JWT_SECRET tidak diset di Railway, fallback ke ini:
token = jwt.encode({
    "sub": "cmb001-admin-uuid",
    "email": "admin@sigizi.id",
    "role": "SPPG_ADMIN"
}, "sigizi-secret-key", algorithm="HS256")
print(token)
🟠 HIGH — Dev Endpoints Ekspos di Production
File: apps/backend/src/modules/auth/controllers/auth.controller.ts

typescript



@Get("dev-users")         // ❌ TIDAK pakai @UseGuards
@Get("dev-login")         // ❌ TIDAK pakai @UseGuards
Walaupun ada proteksi if (process.env.NODE_ENV !== "development") di SERVICE layer, endpointnya sendiri tidak dilindungi guard. Artinya:

Attacker tetap bisa mengetahui endpoint ini exist (response code berbeda)
Jika terjadi misconfiguration NODE_ENV di Railway → siapapun bisa login sebagai role APAPUN
🟠 MEDIUM — CORS Terlalu Longgar
File: apps/backend/src/main.ts

typescript



app.enableCors({
  origin: true,  // <-- Allow ALL origins
  credentials: true,
});
origin: true + credentials: true = sembarang website bisa membuat request authenticated ke API kamu. Ini memungkinkan CSRF-style attack jika user sudah login.

🟠 MEDIUM — Tidak Ada Rate Limiting
Tidak ada implementasi @nestjs/throttler atau express-rate-limit di endpoint login (POST /api/auth/login). Ini memungkinkan:

Brute force attack terhadap password
Tanpa rate limit + tanpa captcha = bisa ditebak
🟡 INFO — Next.js 14.1.0 (Tidak Rentan CVE Besar)
File: apps/portal/package.json

json



"next": "^14.1.0"
Kabar baik: Next.js 14.x tidak terpengaruh oleh CVE-2025-29927, CVE-2026-44575, atau React2Shell RCE yang menyerang Next.js 15.x/16.x. Tapi versi ini sudah dirilis Jan 2024 — sudah 1.5 tahun tidak di-update. Beberapa CVE di Next.js 14.x:

CVE-2025-31334 (Medium) — Directory traversal via _next/static
Sebaiknya upgrade ke 14.2.x LTS terbaru
🟡 INFO — Swagger Docs Ekspos
File: apps/backend/src/main.ts

typescript



SwaggerModule.setup("docs", app, document);
Walaupun Cloudflare memblock akses saya ke api.sigizi.biz.id/docs, endpoint ini hidup di production tanpa auth guard. Jika Cloudflare WAF bypass, attacker bisa lihat seluruh API documentation termasuk parameter, DTO, dan struktur response.

✅ HAL BAIK YANG SUDAH DILAKUKAN
Cloudflare aktif — memblock request mencurigakan (saya kena block saat test)
.gitignore sudah include .env — terhindar dari secret leak di commit
ValidationPipe aktif dengan whitelist: true — extra properties di DTO akan di-strip
Order & Complaint controller sudah pakai @UseGuards(JwtAuthGuard) dengan benar
SSO callback hanya ambil user pertama, bukan sembarang akses
Password di-hash dengan bcrypt (10 rounds)
PaginationDto sudah divalidasi dengan class-validator (page ≥ 1, limit ≤ 100)
🔧 ACTION PLAN PRIORITAS


#	Prioritas	Perbaikan	Effort
1	🔴 SEKARANG	Tambah @UseGuards(JwtAuthGuard) di BatchController semua endpoint	5 menit
2	🔴 SEKARANG	Tambah @UseGuards(JwtAuthGuard) di SupplierController endpoint publik (GET /suppliers, GET /suppliers/:id, GET /suppliers/:id/items)	5 menit
3	🔴 SEKARANG	JANGAN GUNAKAN FALLBACK SECRET — pastikan JWT_SECRET diset sebagai environment variable di Railway (generate random 64-char key)	2 menit
4	🔴 SEKARANG	Ganti JWT expiry dari 7d → 15 menit untuk access token + implementasi refresh token	30 menit
5	🟠 HARI INI	Ubah origin: true → specific allowed origin (https://sigizi.biz.id)	2 menit
6	🟠 HARI INI	Tambah rate limiting di login endpoint (@nestjs/throttler)	15 menit
7	🟠 MINGGU INI	Proteksi Swagger docs — tambah guard atau nonaktifkan di production	5 menit
8	🟠 MINGGU INI	Update Next.js ke 14.2.x LTS terbaru	10 menit
9	🟡 NANTI	Implementasi refresh token rotation	1 jam
10	🟡 NANTI	Tambah audit logging untuk semua write operations	2 jam
🚀 Command Fix Langsung (yang bisa kamu lakukan SEKARANG)
1. Fix BatchController — tambah JwtAuthGuard
typescript



// apps/backend/src/modules/batch/controllers/batch.controller.ts
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard, Roles, CurrentUser } from "../../../common";

@Controller("batches")
export class BatchController {
  // Endpoints yang perlu auth:
  @Get()
  @UseGuards(JwtAuthGuard)  // <-- TAMBAHKAN INI
  findAll(...) { ... }

  @Get(":id")
  @UseGuards(JwtAuthGuard)  // <-- TAMBAHKAN INI
  findOne(...) { ... }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)  // <-- TAMBAHKAN + Roles
  @Roles(Role.SPPG_ADMIN)               // <-- hanya SPPG admin
  create(@Body() dto: CreateBatchDto, @CurrentUser() user: any) {
    // Ambil sppgId & userId dari user JWT, BUKAN dari query params!
    return this.batchService.create(dto, user.sppgId, user.id);
  }

  @Put(":id/status")
  @UseGuards(JwtAuthGuard)  // <-- TAMBAHKAN INI
  updateStatus(...) { ... }
}
2. Ubah CORS di main.ts
typescript



app.enableCors({
  origin: ["https://sigizi.biz.id", "https://www.sigizi.biz.id"],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
3. Generate JWT Secret & Set di Railway
bash



# Generate random 64-char secret
openssl rand -base64 48
# Output: mX8pK2... (simpan ini)

# Set di Railway Dashboard:
# Settings → Variables → JWT_SECRET = <hasil openssl>
# Settings → Variables → JWT_EXPIRES_IN = 15m
4. Rate Limiting di main.ts
bash



pnpm add @nestjs/throttler
typescript



// apps/backend/src/main.ts
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";

// Di AppModule imports:
ThrottlerModule.forRoot([{
  ttl: 60000,    // 1 menit
  limit: 10,     // 10 request
}]),

// Di providers:
{
  provide: APP_GUARD,
  useClass: ThrottlerGuard,
}
💡 Kesimpulan
Kondisi saat ini: Aplikasi kamu berfungsi dengan baik, tapi ada 2 critical security gaps:

BatchController tanpa auth — ini paling berbahaya karena batch berisi data financial (cost/budget) dan bisa dimanipulasi
JWT fallback secret di public repo — jika JWT_SECRET tidak diset di Railway, siapa pun bisa bikin token admin
Kabarnya baik:

Cloudflare proteksi API endpoint dari scanning massal
Sebagian besar controller (Order, Complaint) sudah pakai guard dengan benar
Password ter-hash, input tervalidasi
Estimasi perbaikan total: ~2 jam untuk semua prioritas HIGH.

