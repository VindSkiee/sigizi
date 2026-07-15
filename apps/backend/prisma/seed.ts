import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = hashSync("password123", 10);

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================================
  // 1. Create SPPG (with structured address + GPS)
  // ============================================================================

  const sppg = await prisma.sppg.upsert({
    where: { id: "clx0000000000000000000001" },
    update: {},
    create: {
      id: "clx0000000000000000000001",
      name: "SPPG Purwakarta",
      address: "Jl. Nasional III No. 10, Purwakarta",
      province: "JAWA_BARAT",
      regency: "PURWAKARTA",
      district: "PURWAKARTA",
      village: "Ciseureuh",
      postalCode: "41111",
      latitude: -6.5547,
      longitude: 107.4461,
    },
  });
  console.log("✅ SPPG upserted:", sppg.name);

  // ============================================================================
  // 2. Create Users
  // ============================================================================

  const admin = await prisma.user.upsert({
    where: { email: "admin@sppg-purwakarta.go.id" },
    update: {},
    create: {
      email: "admin@sppg-purwakarta.go.id",
      name: "Budi Santoso",
      role: "SPPG_ADMIN",
      password: DEFAULT_PASSWORD,
      sppgId: sppg.id,
    },
  });
  console.log("✅ Admin user upserted:", admin.email);

  const supplierUser = await prisma.user.upsert({
    where: { email: "supplier@sumberrejeki.go.id" },
    update: {},
    create: {
      email: "supplier@sumberrejeki.go.id",
      name: "UD. Sumber Rejeki",
      role: "SUPPLIER",
      password: DEFAULT_PASSWORD,
    },
  });
  console.log("✅ Supplier user upserted:", supplierUser.email);

  // ============================================================================
  // 3. Create Suppliers (with NIB + structured address + GPS)
  // ============================================================================

  const supplier1 = await prisma.supplier.upsert({
    where: { id: "clx00000000000000000000s1" },
    update: {},
    create: {
      id: "clx00000000000000000000s1",
      name: "UD. Sumber Rejeki",
      nib: "/uploads/nib/sumber-rejeki-2026.pdf",
      phone: "081234567890",
      address: "Jl. Raya Purwakarta-Subang Km 5",
      province: "JAWA_BARAT",
      regency: "PURWAKARTA",
      district: "WANAYASA",
      village: "Wanayasa",
      postalCode: "41152",
      latitude: -6.5025,
      longitude: 107.4523,
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { id: "clx00000000000000000000s2" },
    update: {},
    create: {
      id: "clx00000000000000000000s2",
      name: "UD. Murah Jaya",
      nib: "/uploads/nib/murah-jaya-2026.pdf",
      phone: "081234567891",
      address: "Jl. Veteran No. 25, Purwakarta",
      province: "JAWA_BARAT",
      regency: "PURWAKARTA",
      district: "PURWAKARTA",
      village: "Ciseureuh",
      postalCode: "41111",
      latitude: -6.556,
      longitude: 107.448,
    },
  });

  const supplier3 = await prisma.supplier.upsert({
    where: { id: "clx00000000000000000000s3" },
    update: {},
    create: {
      id: "clx00000000000000000000s3",
      name: "Tani Segar Farm",
      nib: "/uploads/nib/tani-segar-2026.pdf",
      phone: "081234567892",
      address: "Jl. Raya Subang-Bandung Km 12",
      province: "JAWA_BARAT",
      regency: "SUBANG",
      district: "SUBANG",
      village: "Karanganyar",
      postalCode: "41211",
      latitude: -6.5703,
      longitude: 107.7634,
    },
  });

  const supplier4 = await prisma.supplier.upsert({
    where: { id: "clx00000000000000000000s4" },
    update: {},
    create: {
      id: "clx00000000000000000000s4",
      name: "UD. Berkah Pangan",
      nib: "/uploads/nib/berkah-pangan-2026.pdf",
      phone: "081234567893",
      address: "Jl. Raya Wanayasa Km 3",
      province: "JAWA_BARAT",
      regency: "PURWAKARTA",
      district: "WANAYASA",
      village: "Wanayasa",
      postalCode: "41152",
      latitude: -6.503,
      longitude: 107.453,
    },
  });

  const supplier5 = await prisma.supplier.upsert({
    where: { id: "clx00000000000000000000s5" },
    update: {},
    create: {
      id: "clx00000000000000000000s5",
      name: "UD. Jaya Abadi",
      nib: "/uploads/nib/jaya-abadi-2026.pdf",
      phone: "081234567894",
      address: "Jl. Ir. H. Juanda No. 15",
      province: "JAWA_BARAT",
      regency: "PURWAKARTA",
      district: "PURWAKARTA",
      village: "Ciseureuh",
      postalCode: "41111",
      latitude: -6.555,
      longitude: 107.447,
    },
  });
  console.log("✅ Suppliers upserted with NIB + address + GPS");

  // Update supplier user with supplierId
  await prisma.user.update({
    where: { id: supplierUser.id },
    data: { supplierId: supplier1.id },
  });

  // ============================================================================
  // 4. Create Supplier Items
  // ============================================================================

  // All 5 suppliers sell "Beras Premium" → IQR mature market path (≥5 samples)
  // Ayam sold by s1+s2+s4+s5 = 4 suppliers → cold start
  // Telur sold by s2+s4+s5 = 3 suppliers → cold start
  const items = [
    // Supplier 1 — UD. Sumber Rejeki (Wanayasa)
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 12000,
      description: "Beras premium kualitas terbaik untuk masakan sehari-hari",
      minOrderQty: 5,
      orderStep: 0.5,
      supplierId: supplier1.id,
    },
    {
      name: "Ayam Potong",
      unit: "kg",
      basePrice: 35000,
      description: "Ayam potong segar pilihan",
      minOrderQty: 2,
      orderStep: 0.5,
      supplierId: supplier1.id,
    },
    {
      name: "Sayur Bayam",
      unit: "kg",
      basePrice: 8000,
      description: "Bayam segar dari petani lokal",
      minOrderQty: 1,
      orderStep: 0.5,
      supplierId: supplier1.id,
    },
    // Supplier 2 — UD. Murah Jaya (Purwakarta center)
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 11000,
      description: "Beras premium harga bersaing",
      minOrderQty: 10,
      orderStep: 1,
      supplierId: supplier2.id,
    },
    {
      name: "Ayam Potong",
      unit: "kg",
      basePrice: 33000,
      description: "Ayam potong segar",
      minOrderQty: 3,
      orderStep: 0.5,
      supplierId: supplier2.id,
    },
    {
      name: "Telur Ayam",
      unit: "pcs",
      basePrice: 28000,
      description: "Telur ayam kampung segar per kg",
      minOrderQty: 1,
      orderStep: 0.5,
      supplierId: supplier2.id,
    },
    // Supplier 3 — Tani Segar Farm (Subang) — EXPENSIVE (outlier for testing)
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 22000,
      description: "Beras organik premium, jarak jauh dari Subang",
      minOrderQty: 5,
      orderStep: 1,
      supplierId: supplier3.id,
    },
    {
      name: "Sayur Kangkung",
      unit: "kg",
      basePrice: 6000,
      description: "Kangkung segar dari kebun",
      minOrderQty: 1,
      orderStep: 0.5,
      supplierId: supplier3.id,
    },
    {
      name: "Wortel",
      unit: "kg",
      basePrice: 10000,
      description: "Wortel segar kaya vitamin A",
      minOrderQty: 2,
      orderStep: 0.5,
      supplierId: supplier3.id,
    },
    // Supplier 4 — UD. Berkah Pangan (Wanayasa)
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 11800,
      description: "Beras premium berkualitas, harga kompetitif",
      minOrderQty: 5,
      orderStep: 0.5,
      supplierId: supplier4.id,
    },
    {
      name: "Ayam Potong",
      unit: "kg",
      basePrice: 36000,
      description: "Ayam potong segar dari peternak lokal",
      minOrderQty: 2,
      orderStep: 0.5,
      supplierId: supplier4.id,
    },
    {
      name: "Telur Ayam",
      unit: "pcs",
      basePrice: 29000,
      description: "Telur ayam segar grade A",
      minOrderQty: 1,
      orderStep: 0.5,
      supplierId: supplier4.id,
    },
    // Supplier 5 — UD. Jaya Abadi (Ciseureuh, Purwakarta)
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 12200,
      description: "Beras premium pilihan, dekat dengan SPPG",
      minOrderQty: 5,
      orderStep: 0.5,
      supplierId: supplier5.id,
    },
    {
      name: "Ayam Potong",
      unit: "kg",
      basePrice: 38000,
      description: "Ayam potong segar premium",
      minOrderQty: 2,
      orderStep: 0.5,
      supplierId: supplier5.id,
    },
    {
      name: "Telur Ayam",
      unit: "pcs",
      basePrice: 30000,
      description: "Telur ayam kampung segar, nutrisi tinggi",
      minOrderQty: 1,
      orderStep: 0.5,
      supplierId: supplier5.id,
    },
  ];

  const createdItems: {
    id: string;
    name: string;
    unit: string;
    basePrice: number;
    supplierId: string;
  }[] = [];
  for (const item of items) {
    const created = await prisma.supplierItem.create({ data: item });
    createdItems.push(created);
  }
  console.log("✅ Supplier items created:", createdItems.length, "items");

  // ============================================================================
  // 5. Create Beneficiaries
  // ============================================================================

  await prisma.beneficiary.upsert({
    where: { id: "clx00000000000000000000b1" },
    update: {},
    create: {
      id: "clx00000000000000000000b1",
      name: "Penerima Manfaat SDN 1",
      institution: "SDN 1 Purwakarta",
      institutionType: "SEKOLAH",
      totalBeneficiary: 150,
      address: "Jl. Sudirman No. 1, Purwakarta",
      contactPhone: "081234567801",
      sppgId: sppg.id,
    },
  });

  await prisma.beneficiary.upsert({
    where: { id: "clx00000000000000000000b2" },
    update: {},
    create: {
      id: "clx00000000000000000000b2",
      name: "Penerima Manfaat SDN 2",
      institution: "SDN 2 Purwakarta",
      institutionType: "SEKOLAH",
      totalBeneficiary: 120,
      address: "Jl. Ahmad Yani No. 5, Purwakarta",
      contactPhone: "081234567802",
      sppgId: sppg.id,
    },
  });

  await prisma.beneficiary.upsert({
    where: { id: "clx00000000000000000000b3" },
    update: {},
    create: {
      id: "clx00000000000000000000b3",
      name: "Penerima Manfaat SMPN 1",
      institution: "SMPN 1 Purwakarta",
      institutionType: "SEKOLAH",
      totalBeneficiary: 200,
      address: "Jl. Veteran No. 10, Purwakarta",
      contactPhone: "081234567803",
      sppgId: sppg.id,
    },
  });

  await prisma.beneficiary.upsert({
    where: { id: "clx00000000000000000000b4" },
    update: {},
    create: {
      id: "clx00000000000000000000b4",
      name: "Penerima Manfaat Panti Asuhan",
      institution: "Panti Asuhan Harapan",
      institutionType: "PANTI_ASUHAN",
      totalBeneficiary: 50,
      address: "Jl. Melati No. 3, Purwakarta",
      contactPhone: "081234567804",
      sppgId: sppg.id,
    },
  });
  console.log("✅ Beneficiaries upserted:", 4, "institutions");

  // ============================================================================
  // 6. Create MoU (Sample partnership agreement)
  // ============================================================================

  const mou = await prisma.mou.upsert({
    where: { id: "clx00000000000000000000m1" },
    update: {},
    create: {
      id: "clx00000000000000000000m1",
      mouNumber: "MOU-20260710-001",
      sppgId: sppg.id,
      supplierId: supplier1.id,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-12-31"),
      status: "ACTIVE",
      title: "Kerjasama Penyediaan Bahan Baku Q3-Q4 2026",
      nibSnapshot: supplier1.nib,
      terms: {
        paymentTerms: "NET-30",
        deliverySchedule: "Setiap Senin & Kamis",
        penaltyLateDelivery: "5% per hari keterlambatan",
        penaltyDefect: "Penggantian 2x lipat",
        minOrderAmount: 500000,
        maxOrderAmount: 50000000,
        customTerms: "Denda maksimal 10% dari total order",
      },
      documentUrl: "/uploads/mou/mou-sumber-rejeki-2026.pdf",
      createdById: admin.id,
      items: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium dari Supplier 1
            agreedPrice: 11500, // Harga khusus (lebih murah dari basePrice 12000)
            minOrderQty: 10,
            maxOrderQty: 500,
          },
          {
            itemId: createdItems[1].id, // Ayam Potong dari Supplier 1
            agreedPrice: 34000,
            minOrderQty: 5,
            maxOrderQty: 200,
          },
          {
            itemId: createdItems[2].id, // Sayur Bayam dari Supplier 1
            agreedPrice: 7500,
            minOrderQty: 5,
            maxOrderQty: 100,
          },
        ],
      },
    },
  });
  console.log("✅ MoU upserted:", mou.mouNumber, "- Status:", mou.status);

  // ============================================================================
  // 7. Create Orders (3 orders for report + price validation testing)
  //    All set to COMPLETED + paidAt on 2026-07-14 for daily report
  // ============================================================================

  // ── Order 1: All items VALID, linked to MoU ──
  const order1 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o1" },
    update: {
      status: "COMPLETED",
      paidAt: new Date("2026-07-14T10:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T08:00:00Z"),
    },
    create: {
      id: "clx00000000000000000000o1",
      status: "COMPLETED",
      total: 512500, // 230000 + 170000 + 112500
      sppgId: sppg.id,
      supplierId: supplier1.id,
      createdById: admin.id,
      mouId: mou.id,
      paidAt: new Date("2026-07-14T10:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T08:00:00Z"),
      notes: "Pesanan bahan baku minggu ini via MoU",
      items: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium s1
            quantity: 20,
            unitPrice: 11500, // Harga MoU (valid: 11500 ≈ median 12000)
            subtotal: 230000,
            marketMedianAtPurchase: 12000,
            isWarningBypass: false,
            justificationNote: "Semua harga valid sesuai data pasar",
          },
          {
            itemId: createdItems[1].id, // Ayam Potong s1
            quantity: 5,
            unitPrice: 34000, // Harga MoU (cold start, master ref 40000, valid)
            subtotal: 170000,
            marketMedianAtPurchase: 40000,
            isWarningBypass: false,
            justificationNote: "Semua harga valid sesuai data pasar",
          },
          {
            itemId: createdItems[2].id, // Sayur Bayam s1
            quantity: 15,
            unitPrice: 7500,
            subtotal: 112500,
            marketMedianAtPurchase: 8000,
            isWarningBypass: false,
            justificationNote: "Semua harga valid sesuai data pasar",
          },
        ],
      },
    },
    include: { items: true },
  });

  // Status history: PENDING → CONFIRMED → DELIVERED → COMPLETED
  const orderHistoryData: {
    orderId: string;
    fromStatus: string | null;
    toStatus: string;
    changedById: string;
    notes: string;
    createdAt: Date;
  }[] = [
    {
      orderId: order1.id,
      fromStatus: null as string | null,
      toStatus: "PENDING" as const,
      changedById: admin.id,
      notes: "Order berhasil dibuat dan menunggu konfirmasi dari supplier",
      createdAt: new Date("2026-07-14T06:00:00Z"),
    },
    {
      orderId: order1.id,
      fromStatus: "PENDING" as const,
      toStatus: "CONFIRMED" as const,
      changedById: supplierUser.id,
      notes: "Konfirmasi dari supplier",
      createdAt: new Date("2026-07-14T06:30:00Z"),
    },
    {
      orderId: order1.id,
      fromStatus: "CONFIRMED" as const,
      toStatus: "DELIVERED" as const,
      changedById: supplierUser.id,
      notes: "Pengiriman selesai",
      createdAt: new Date("2026-07-14T08:00:00Z"),
    },
    {
      orderId: order1.id,
      fromStatus: "DELIVERED" as const,
      toStatus: "COMPLETED" as const,
      changedById: admin.id,
      notes: "Semua harga valid sesuai data pasar. Pembayaran dikonfirmasi",
      createdAt: new Date("2026-07-14T10:00:00Z"),
    },
  ];

  console.log(
    "✅ Order 1 upserted:",
    order1.id,
    "COMPLETED via MoU:",
    mou.mouNumber,
  );

  // ── Order 2: WARNING bypass — Ayam at Rp 55,000 (market median ~37,000) ──
  const order2 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o2" },
    update: {
      status: "COMPLETED",
      paidAt: new Date("2026-07-14T14:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T11:00:00Z"),
    },
    create: {
      id: "clx00000000000000000000o2",
      status: "COMPLETED",
      total: 275000,
      sppgId: sppg.id,
      supplierId: supplier3.id, // Tani Segar Farm (Subang, expensive)
      createdById: admin.id,
      paidAt: new Date("2026-07-14T14:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T11:00:00Z"),
      notes: "Ayam dari Subang, stok lokal langka",
      items: {
        create: [
          {
            itemId: createdItems[10].id, // Ayam Potong s4 (Rp 36,000)
            quantity: 5,
            unitPrice: 55000, // Harga tinggi → WARNING bypass
            subtotal: 275000,
            marketMedianAtPurchase: 37000, // Median dari s1+s2+s4+s5 = (35+33+36+38)/4 = 35500 ≈ 37000
            isWarningBypass: true,
            justificationNote:
              "[Price Validation Justification] Stok lokal langka, supplier terdekat hanya ini yang tersedia. Jarak Subang ~34km",
          },
        ],
      },
    },
    include: { items: true },
  });

  orderHistoryData.push(
    {
      orderId: order2.id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin.id,
      notes: "Order ayam dari Tani Segar Farm (Subang)",
      createdAt: new Date("2026-07-14T09:00:00Z"),
    },
    {
      orderId: order2.id,
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      changedById: supplierUser.id,
      notes: "Konfirmasi supplier",
      createdAt: new Date("2026-07-14T09:30:00Z"),
    },
    {
      orderId: order2.id,
      fromStatus: "CONFIRMED",
      toStatus: "DELIVERED",
      changedById: supplierUser.id,
      notes: "Pengiriman dari Subang",
      createdAt: new Date("2026-07-14T11:00:00Z"),
    },
    {
      orderId: order2.id,
      fromStatus: "DELIVERED",
      toStatus: "COMPLETED",
      changedById: admin.id,
      notes:
        "[Price Validation Justification] Stok lokal langka, supplier terdekat hanya ini yang tersedia. Pembayaran dikonfirmasi",
      createdAt: new Date("2026-07-14T14:00:00Z"),
    },
  );

  console.log(
    "✅ Order 2 upserted:",
    order2.id,
    "COMPLETED — WARNING bypass: Ayam @ Rp 55,000",
  );

  // ── Order 3: Mixed valid items (Beras + Telur, both valid) ──
  const order3 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o3" },
    update: {
      status: "COMPLETED",
      paidAt: new Date("2026-07-14T16:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T14:00:00Z"),
    },
    create: {
      id: "clx00000000000000000000o3",
      status: "COMPLETED",
      total: 500000, // 360000 + 140000
      sppgId: sppg.id,
      supplierId: supplier1.id, // UD. Sumber Rejeki
      createdById: admin.id,
      paidAt: new Date("2026-07-14T16:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T14:00:00Z"),
      notes: "Beras + Telur untuk batch minggu ini",
      items: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium s1 (Rp 12,000, valid)
            quantity: 30,
            unitPrice: 12000, // basePrice, valid: 12000 ≈ median
            subtotal: 360000, // 30 × 12000 = 360000
            marketMedianAtPurchase: 12000,
            isWarningBypass: false,
            justificationNote: "Semua harga valid sesuai data pasar",
          },
          {
            itemId: createdItems[5].id, // Telur Ayam s2 (Rp 28,000, cold start, master ref 28000)
            quantity: 5,
            unitPrice: 28000, // master ref = 28000, valid
            subtotal: 140000, // 5 × 28000 = 140000
            marketMedianAtPurchase: 28000,
            isWarningBypass: false,
            justificationNote: "Semua harga valid sesuai data pasar",
          },
        ],
      },
    },
    include: { items: true },
  });

  orderHistoryData.push(
    {
      orderId: order3.id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin.id,
      notes: "Order beras dan telur",
      createdAt: new Date("2026-07-14T12:00:00Z"),
    },
    {
      orderId: order3.id,
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      changedById: supplierUser.id,
      notes: "Konfirmasi supplier",
      createdAt: new Date("2026-07-14T12:30:00Z"),
    },
    {
      orderId: order3.id,
      fromStatus: "CONFIRMED",
      toStatus: "DELIVERED",
      changedById: supplierUser.id,
      notes: "Pengiriman selesai",
      createdAt: new Date("2026-07-14T14:00:00Z"),
    },
    {
      orderId: order3.id,
      fromStatus: "DELIVERED",
      toStatus: "COMPLETED",
      changedById: admin.id,
      notes: "Semua harga valid sesuai data pasar. Pembayaran dikonfirmasi",
      createdAt: new Date("2026-07-14T16:00:00Z"),
    },
  );

  console.log(
    "✅ Order 3 upserted:",
    order3.id,
    "COMPLETED — mixed valid: Beras + Telur",
  );

  // ── Order 4: PENDING — Baru dibuat, menunggu konfirmasi supplier ──
  const order4 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o4" },
    update: {},
    create: {
      id: "clx00000000000000000000o4",
      status: "PENDING",
      total: 240000,
      sppgId: sppg.id,
      supplierId: supplier1.id, // UD. Sumber Rejeki
      createdById: admin.id,
      mouId: mou.id,
      expectedDeliveryDate: new Date("2026-07-16T08:00:00Z"),
      notes: "Order beras untuk batch minggu depan",
      items: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium s1
            quantity: 20,
            unitPrice: 12000,
            subtotal: 240000,
            marketMedianAtPurchase: 12000,
            isWarningBypass: false,
            justificationNote: "Harga sesuai pasar",
          },
        ],
      },
    },
    include: { items: true },
  });

  orderHistoryData.push({
    orderId: order4.id,
    fromStatus: null,
    toStatus: "PENDING",
    changedById: admin.id,
    notes: "Order beras untuk batch minggu depan",
    createdAt: new Date("2026-07-15T06:00:00Z"),
  });

  console.log(
    "✅ Order 4 upserted:",
    order4.id,
    "PENDING — Beras 20kg, menunggu konfirmasi",
  );

  // ── Order 5: CONFIRMED — Dikonfirmasi supplier, menunggu pengiriman ──
  const order5 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o5" },
    update: {},
    create: {
      id: "clx00000000000000000000o5",
      status: "CONFIRMED",
      total: 350000,
      sppgId: sppg.id,
      supplierId: supplier1.id, // UD. Sumber Rejeki
      createdById: admin.id,
      expectedDeliveryDate: new Date("2026-07-16T10:00:00Z"),
      notes: "Ayam untuk persediaan minggu ini",
      items: {
        create: [
          {
            itemId: createdItems[1].id, // Ayam Potong s1
            quantity: 10,
            unitPrice: 35000,
            subtotal: 350000,
            marketMedianAtPurchase: 35500,
            isWarningBypass: false,
            justificationNote: "Harga sesuai pasar",
          },
        ],
      },
    },
    include: { items: true },
  });

  orderHistoryData.push(
    {
      orderId: order5.id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin.id,
      notes: "Order ayam untuk persediaan minggu ini",
      createdAt: new Date("2026-07-15T07:00:00Z"),
    },
    {
      orderId: order5.id,
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      changedById: supplierUser.id,
      notes: "Konfirmasi dari supplier, pengiriman dijadwalkan besok",
      createdAt: new Date("2026-07-15T08:00:00Z"),
    },
  );

  console.log(
    "✅ Order 5 upserted:",
    order5.id,
    "CONFIRMED — Ayam 10kg, menunggu pengiriman",
  );

  // ── Order 6: DELIVERED — Sudah dikirim, menunggu verifikasi SPPG ──
  const order6 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o6" },
    update: {},
    create: {
      id: "clx00000000000000000000o6",
      status: "DELIVERED",
      total: 247500,
      sppgId: sppg.id,
      supplierId: supplier1.id, // UD. Sumber Rejeki
      createdById: admin.id,
      mouId: mou.id,
      expectedDeliveryDate: new Date("2026-07-15T08:00:00Z"),
      actualDeliveryDate: new Date("2026-07-15T07:30:00Z"),
      deliveryEvidence: "/uploads/evidence/delivery-o6.jpg",
      notes: "Beras + Bayam untuk batch besok",
      items: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium s1
            quantity: 15,
            unitPrice: 11500, // Harga MoU
            subtotal: 172500,
            marketMedianAtPurchase: 12000,
            isWarningBypass: false,
            justificationNote: "Harga sesuai MoU",
          },
          {
            itemId: createdItems[2].id, // Sayur Bayam s1
            quantity: 10,
            unitPrice: 7500, // Harga MoU
            subtotal: 75000,
            marketMedianAtPurchase: 8000,
            isWarningBypass: false,
            justificationNote: "Harga sesuai MoU",
          },
        ],
      },
    },
    include: { items: true },
  });

  orderHistoryData.push(
    {
      orderId: order6.id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin.id,
      notes: "Order beras + bayam untuk batch besok",
      createdAt: new Date("2026-07-14T14:00:00Z"),
    },
    {
      orderId: order6.id,
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      changedById: supplierUser.id,
      notes: "Konfirmasi supplier, siap dikirim",
      createdAt: new Date("2026-07-14T14:30:00Z"),
    },
    {
      orderId: order6.id,
      fromStatus: "CONFIRMED",
      toStatus: "DELIVERED",
      changedById: supplierUser.id,
      notes: "Pengiriman selesai, menunggu verifikasi SPPG",
      createdAt: new Date("2026-07-15T07:30:00Z"),
    },
  );

  console.log(
    "✅ Order 6 upserted:",
    order6.id,
    "DELIVERED — Beras + Bayam, menunggu verifikasi",
  );

  // ── Order 7: CANCELLED — Dibatalkan (stok tidak mencukupi) ──
  const order7 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o7" },
    update: {},
    create: {
      id: "clx00000000000000000000o7",
      status: "CANCELLED",
      total: 300000,
      sppgId: sppg.id,
      supplierId: supplier1.id, // UD. Sumber Rejeki
      createdById: admin.id,
      expectedDeliveryDate: new Date("2026-07-14T08:00:00Z"),
      cancelledAt: new Date("2026-07-13T16:00:00Z"),
      cancelledReason:
        "Stok dari supplier tidak mencukupi untuk memenuhi pesanan 25kg beras",
      cancelledById: supplierUser.id,
      notes: "Order beras untuk stok cadangan",
      items: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium s1
            quantity: 25,
            unitPrice: 12000,
            subtotal: 300000,
            marketMedianAtPurchase: 12000,
            isWarningBypass: false,
            justificationNote: "Harga sesuai pasar",
          },
        ],
      },
    },
    include: { items: true },
  });

  orderHistoryData.push(
    {
      orderId: order7.id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin.id,
      notes: "Order beras untuk stok cadangan",
      createdAt: new Date("2026-07-13T10:00:00Z"),
    },
    {
      orderId: order7.id,
      fromStatus: "PENDING" as const,
      toStatus: "CANCELLED" as const,
      changedById: supplierUser.id,
      notes:
        "Stok dari supplier tidak mencukupi untuk memenuhi pesanan 25kg beras",
      createdAt: new Date("2026-07-13T16:00:00Z"),
    },
  );

  console.log(
    "✅ Order 7 upserted:",
    order7.id,
    "CANCELLED — Beras 25kg, stok tidak mencukupi",
  );

  // ── Batch-create all OrderStatusHistory entries ──
  for (const h of orderHistoryData) {
    await prisma.orderStatusHistory.create({ data: h as any });
  }
  console.log(
    "✅ OrderStatusHistory created:",
    orderHistoryData.length,
    "entries",
  );

  // ============================================================================
  // 8. Create Batches (3 batches on 2026-07-14 for daily report)
  // ============================================================================

  // ── Batch 1: Nasi Ayam Bakar + Sayur Bayam ──
  const batch1 = await prisma.batch.upsert({
    where: { id: "clx00000000000000000000bt1" },
    update: {},
    create: {
      id: "clx00000000000000000000bt1",
      batchNumber: "BATCH-20260714-001",
      reportKey: "A7X9K2M4",
      date: new Date("2026-07-14T06:00:00Z"),
      menu: "Nasi Ayam Bakar + Sayur Bayam",
      nutrition: { calories: 450, protein: 25, fat: 15, carbs: 50 },
      allergens: ["Gluten"],
      beneficiaryCount: 150,
      beneficiaryNames: [
        "SDN 01 Purwakarta",
        "SDN 02 Purwakarta",
        "SDN 03 Purwakarta",
      ],
      costPerPortion: 0,
      totalCost: 0,
      costPerPortionStandard: 10000,
      totalBudget: 1500000,
      budgetVariance: 0,
      sppgId: sppg.id,
      createdById: admin.id,
      batchItems: {
        create: [
          {
            itemId: createdItems[0].id,
            name: "Beras Premium 15kg",
            unit: "kg",
            quantity: 15,
            unitPrice: 11500,
            subtotal: 172500,
            createdById: admin.id,
          },
          {
            itemId: createdItems[1].id,
            name: "Ayam Potong 3kg",
            unit: "kg",
            quantity: 3,
            unitPrice: 34000,
            subtotal: 102000,
            createdById: admin.id,
          },
          {
            itemId: createdItems[2].id,
            name: "Sayur Bayam 15kg",
            unit: "kg",
            quantity: 15,
            unitPrice: 7500,
            subtotal: 112500,
            createdById: admin.id,
          },
        ],
      },
    },
  });

  // Compute totalCost from BatchItems
  const batch1WithItems = await prisma.batch.findUnique({
    where: { id: batch1.id },
    include: { batchItems: true },
  });
  if (!batch1WithItems) throw new Error("Batch 1 not found");

  const totalCost1 = batch1WithItems.batchItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );
  const costPerPortion1 = batch1WithItems.beneficiaryCount
    ? totalCost1 / batch1WithItems.beneficiaryCount
    : 0;

  await prisma.batch.update({
    where: { id: batch1.id },
    data: {
      totalCost: totalCost1,
      costPerPortion: costPerPortion1,
      budgetVariance: totalCost1 - 1500000,
    },
  });
  console.log("✅ Batch 1:", batch1.batchNumber, "Total:", totalCost1);

  // ── Batch 2: Nasi Ikan Goreng + Wortel ──
  const batch2 = await prisma.batch.upsert({
    where: { id: "clx00000000000000000000bt2" },
    update: {},
    create: {
      id: "clx00000000000000000000bt2",
      batchNumber: "BATCH-20260714-002",
      reportKey: "B8Y3L5N1",
      date: new Date("2026-07-14T07:00:00Z"),
      menu: "Nasi Ikan Goreng + Wortel Rebus",
      nutrition: { calories: 520, protein: 30, fat: 18, carbs: 55 },
      allergens: ["Ikan"],
      beneficiaryCount: 120,
      beneficiaryNames: ["SDN 04 Purwakarta", "SDN 05 Purwakarta"],
      costPerPortion: 0,
      totalCost: 0,
      costPerPortionStandard: 10000,
      totalBudget: 1200000,
      budgetVariance: 0,
      sppgId: sppg.id,
      createdById: admin.id,
      batchItems: {
        create: [
          {
            itemId: createdItems[0].id,
            name: "Beras Premium 12kg",
            unit: "kg",
            quantity: 12,
            unitPrice: 11500,
            subtotal: 138000,
            createdById: admin.id,
          },
          {
            itemId: createdItems[8].id,
            name: "Wortel 6kg",
            unit: "kg",
            quantity: 6,
            unitPrice: 10000,
            subtotal: 60000,
            createdById: admin.id,
          },
          {
            itemId: createdItems[7].id,
            name: "Sayur Kangkung 8kg",
            unit: "kg",
            quantity: 8,
            unitPrice: 6000,
            subtotal: 48000,
            createdById: admin.id,
          },
        ],
      },
    },
  });

  const batch2WithItems = await prisma.batch.findUnique({
    where: { id: batch2.id },
    include: { batchItems: true },
  });
  if (!batch2WithItems) throw new Error("Batch 2 not found");

  const totalCost2 = batch2WithItems.batchItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );
  const costPerPortion2 = batch2WithItems.beneficiaryCount
    ? totalCost2 / batch2WithItems.beneficiaryCount
    : 0;

  await prisma.batch.update({
    where: { id: batch2.id },
    data: {
      totalCost: totalCost2,
      costPerPortion: costPerPortion2,
      budgetVariance: totalCost2 - 1200000,
    },
  });
  console.log("✅ Batch 2:", batch2.batchNumber, "Total:", totalCost2);

  // ── Batch 3: Nasi Tahu Tempe + Telur ──
  const batch3 = await prisma.batch.upsert({
    where: { id: "clx00000000000000000000bt3" },
    update: {},
    create: {
      id: "clx00000000000000000000bt3",
      batchNumber: "BATCH-20260714-003",
      reportKey: "C9Z4M6P2",
      date: new Date("2026-07-14T08:00:00Z"),
      menu: "Nasi Tahu Tempe + Telur Dadar",
      nutrition: { calories: 480, protein: 22, fat: 16, carbs: 52 },
      allergens: ["Kedelai", "Telur"],
      beneficiaryCount: 100,
      beneficiaryNames: [
        "SDN 06 Purwakarta",
        "SDN 07 Purwakarta",
        "SDN 08 Purwakarta",
        "SDN 09 Purwakarta",
      ],
      costPerPortion: 0,
      totalCost: 0,
      costPerPortionStandard: 10000,
      totalBudget: 1000000,
      budgetVariance: 0,
      sppgId: sppg.id,
      createdById: admin.id,
      batchItems: {
        create: [
          {
            itemId: createdItems[0].id,
            name: "Beras Premium 10kg",
            unit: "kg",
            quantity: 10,
            unitPrice: 11500,
            subtotal: 115000,
            createdById: admin.id,
          },
          {
            itemId: createdItems[5].id,
            name: "Telur Ayam 5kg",
            unit: "kg",
            quantity: 5,
            unitPrice: 28000,
            subtotal: 140000, // 5 × 28000 = 140000
            createdById: admin.id,
          },
          {
            itemId: createdItems[4].id,
            name: "Ayam Potong 2kg",
            unit: "kg",
            quantity: 2,
            unitPrice: 33000,
            subtotal: 66000,
            createdById: admin.id,
          },
        ],
      },
    },
  });

  const batch3WithItems = await prisma.batch.findUnique({
    where: { id: batch3.id },
    include: { batchItems: true },
  });
  if (!batch3WithItems) throw new Error("Batch 3 not found");

  const totalCost3 = batch3WithItems.batchItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );
  const costPerPortion3 = batch3WithItems.beneficiaryCount
    ? totalCost3 / batch3WithItems.beneficiaryCount
    : 0;

  await prisma.batch.update({
    where: { id: batch3.id },
    data: {
      totalCost: totalCost3,
      costPerPortion: costPerPortion3,
      budgetVariance: totalCost3 - 1000000,
    },
  });
  console.log("✅ Batch 3:", batch3.batchNumber, "Total:", totalCost3);

  // ============================================================================
  // 9. Create Sample Complaints
  // ============================================================================

  await prisma.complaint.upsert({
    where: { id: "clx00000000000000000000c1" },
    update: {},
    create: {
      id: "clx00000000000000000000c1",
      reportKey: "A7X9K2M4",
      description:
        "Nasi terasa agak basi dan kurang hangat saat diterima oleh penerima manfaat",
      batchId: batch1.id,
    },
  });

  await prisma.complaint.upsert({
    where: { id: "clx00000000000000000000c2" },
    update: {},
    create: {
      id: "clx00000000000000000000c2",
      reportKey: "B8Y3L5N1",
      description: "Ikan goreng kurang garing, sedikit lembek",
      batchId: batch2.id,
    },
  });
  console.log("✅ Complaints upserted:", 2);

  // ============================================================================
  // 9A. Create Inventory Stocks (lot-based stok bahan baku per SPPG)
  //     Harga purchasePrice dikunci dari OrderItem.unitPrice saat order COMPLETED
  // ============================================================================

  // inv1: Beras Premium dari Order 1 (20kg @11,500, sisa 15kg — 5kg dipakai Batch 1)
  const inv1 = await prisma.inventoryStock.upsert({
    where: { id: "clx00000000000000000000inv1" },
    update: {},
    create: {
      id: "clx00000000000000000000inv1",
      sppgId: sppg.id,
      itemId: createdItems[0].id, // Beras Premium
      orderItemId: order1.items[0].id, // dari Order 1
      source: "SYSTEM_ORDER",
      purchasePrice: 11500,
      initialQty: 20,
      remainingQty: 15, // 5kg sudah dipakai di Batch 1
      createdById: admin.id,
      notes: "Stok dari Order 1 (UD. Sumber Rejeki) — via MoU",
    },
  });

  // inv2: Ayam Potong dari Order 1 (5kg @34,000, sisa 2kg — 3kg dipakai Batch 1)
  const inv2 = await prisma.inventoryStock.upsert({
    where: { id: "clx00000000000000000000inv2" },
    update: {},
    create: {
      id: "clx00000000000000000000inv2",
      sppgId: sppg.id,
      itemId: createdItems[1].id, // Ayam Potong
      orderItemId: order1.items[1].id, // dari Order 1
      source: "SYSTEM_ORDER",
      purchasePrice: 34000,
      initialQty: 5,
      remainingQty: 2, // 3kg sudah dipakai di Batch 1
      createdById: admin.id,
      notes: "Stok dari Order 1 (UD. Sumber Rejeki) — via MoU",
    },
  });

  // inv3: Sayur Bayam dari Order 1 (15kg @7,500, sisa 0 — semua dipakai Batch 1)
  const inv3 = await prisma.inventoryStock.upsert({
    where: { id: "clx00000000000000000000inv3" },
    update: {},
    create: {
      id: "clx00000000000000000000inv3",
      sppgId: sppg.id,
      itemId: createdItems[2].id, // Sayur Bayam
      orderItemId: order1.items[2].id, // dari Order 1
      source: "SYSTEM_ORDER",
      purchasePrice: 7500,
      initialQty: 15,
      remainingQty: 0, // 15kg sudah dipakai di Batch 1 (habis)
      createdById: admin.id,
      notes: "Stok dari Order 1 (UD. Sumber Rejeki) — via MoU",
    },
  });

  // inv4: Beras Premium dari Order 3 (30kg @12,000, sisa 30kg — belum terpakai)
  const inv4 = await prisma.inventoryStock.upsert({
    where: { id: "clx00000000000000000000inv4" },
    update: {},
    create: {
      id: "clx00000000000000000000inv4",
      sppgId: sppg.id,
      itemId: createdItems[0].id, // Beras Premium
      orderItemId: order3.items[0].id, // dari Order 3
      source: "SYSTEM_ORDER",
      purchasePrice: 12000,
      initialQty: 30,
      remainingQty: 30, // Stok baru, belum terpakai
      createdById: admin.id,
      notes: "Stok dari Order 3 (UD. Sumber Rejeki)",
    },
  });

  // inv5: Telur Ayam dari Order 3 (5kg @28,000, sisa 0 — semua dipakai Batch 3)
  const inv5 = await prisma.inventoryStock.upsert({
    where: { id: "clx00000000000000000000inv5" },
    update: {},
    create: {
      id: "clx00000000000000000000inv5",
      sppgId: sppg.id,
      itemId: createdItems[5].id, // Telur Ayam
      orderItemId: order3.items[1].id, // dari Order 3
      source: "SYSTEM_ORDER",
      purchasePrice: 28000,
      initialQty: 5,
      remainingQty: 0, // 5kg sudah dipakai di Batch 3 (habis)
      createdById: admin.id,
      notes: "Stok dari Order 3 (UD. Sumber Rejeki)",
    },
  });

  console.log(
    "✅ Inventory stocks upserted: 5 lots (Beras 2, Ayam 1, Bayam 1, Telur 1)",
  );

  // ============================================================================
  // 9B. Create Inventory Adjustment Log (SPOILAGE event on Ayam)
  // ============================================================================

  await prisma.inventoryAdjustmentLog.upsert({
    where: { id: "clx00000000000000000000adj1" },
    update: {},
    create: {
      id: "clx00000000000000000000adj1",
      inventoryStockId: inv2.id, // Ayam Potong
      adjustmentQty: -1,
      reason: "SPOILAGE",
      description: "Ayam rusak akibat cold chain terganggu saat pengiriman",
      changedById: admin.id,
      createdAt: new Date("2026-07-14T12:00:00Z"),
    },
  });

  console.log(
    "✅ Inventory adjustment log upserted: 1 SPOILAGE event (Ayam -1 unit)",
  );

  // ============================================================================
  // 10. Create Operational Expenses (for OpEx in reports)
  // ============================================================================

  await prisma.operationalExpense.upsert({
    where: { id: "clx00000000000000000000oe1" },
    update: {},
    create: {
      id: "clx00000000000000000000oe1",
      sppgId: sppg.id,
      category: "TRANSPORTATION",
      amount: 150000,
      expenseDate: new Date("2026-07-14T00:00:00Z"),
      description: "Pengantaran bahan baku mingguan dari 3 supplier",
      createdById: admin.id,
    },
  });

  await prisma.operationalExpense.upsert({
    where: { id: "clx00000000000000000000oe2" },
    update: {},
    create: {
      id: "clx00000000000000000000oe2",
      sppgId: sppg.id,
      category: "FUEL",
      amount: 75000,
      expenseDate: new Date("2026-07-14T00:00:00Z"),
      description: "BBM pengantaran harian ke penerima manfaat",
      createdById: admin.id,
    },
  });
  console.log("✅ Operational expenses upserted:", 2);

  // ============================================================================
  // Summary
  // ============================================================================

  console.log("\n🎉 Seeding completed!");
  console.log("\n📊 Summary:");
  console.log("   - 1 SPPG (SPPG Purwakarta) — with GPS coordinates");
  console.log("   - 2 Users (1 admin Budi Santoso, 1 supplier)");
  console.log("   - 5 Suppliers — with NIB + structured address + GPS");
  console.log("   - 15 Supplier Items (5x Beras, 4x Ayam, 3x Telur, 3x Sayur)");
  console.log("   - 4 Beneficiaries");
  console.log("   - 1 MoU (ACTIVE) — partnership with agreed prices");
  console.log("   - 7 Orders (4 UD. Sumber Rejeki, varied statuses):");
  console.log("     - o1: COMPLETED (Sumber Rejeki, Rp 512,500) — via MoU");
  console.log("     - o2: COMPLETED (Tani Segar, Rp 275,000) — WARNING bypass");
  console.log("     - o3: COMPLETED (Sumber Rejeki, Rp 500,000) — mixed valid");
  console.log("     - o4: PENDING (Sumber Rejeki, Rp 240,000) — Beras 20kg");
  console.log("     - o5: CONFIRMED (Sumber Rejeki, Rp 350,000) — Ayam 10kg");
  console.log("     - o6: DELIVERED (Sumber Rejeki, Rp 247,500) — Beras+Bayam");
  console.log(
    "     - o7: CANCELLED (Sumber Rejeki, Rp 300,000) — stok tidak cukup",
  );
  console.log("   - 3 Batches (all on 2026-07-14)");
  console.log(
    "     - bt1: Nasi Ayam Bakar (150 porsi, Rp",
    totalCost1.toLocaleString(),
    ")",
  );
  console.log(
    "     - bt2: Nasi Ikan Goreng (120 porsi, Rp",
    totalCost2.toLocaleString(),
    ")",
  );
  console.log(
    "     - bt3: Nasi Tahu Tempe (100 porsi, Rp",
    totalCost3.toLocaleString(),
    ")",
  );
  console.log("   - 2 Complaints");
  console.log("   - 5 Inventory Lots (SPPG Purwakarta):");
  console.log("     - Beras: 2 lots (15 + 30 = 45 kg tersedia)");
  console.log("     - Ayam: 1 lot (2 kg tersedia)");
  console.log("     - Bayam: 1 lot (0 kg, habis)");
  console.log("     - Telur: 1 lot (0 kg, habis)");
  console.log("   - 1 Adjustment Log (SPOILAGE on Ayam -1 unit)");
  console.log("   - 2 Operational Expenses (TRANSPORTATION + FUEL)");
  console.log("   - 20 OrderStatusHistory entries");
  console.log("\n📍 GPS Data:");
  console.log("   - SPPG Purwakarta: -6.5547, 107.4461");
  console.log("   - Supplier 1 (Wanayasa): -6.5025, 107.4523 (~6km)");
  console.log("   - Supplier 2 (Purwakarta): -6.5560, 107.4480 (~0.2km)");
  console.log("   - Supplier 3 (Subang): -6.5703, 107.7634 (~34km)");
  console.log("   - Supplier 4 (Wanayasa): -6.5030, 107.4530 (~6km)");
  console.log("   - Supplier 5 (Ciseureuh): -6.5550, 107.4470 (~0.1km)");
  console.log("\n🧪 Price Validation Test Scenarios:");
  console.log("   - Beras Premium: 5 suppliers → IQR mature market");
  console.log("     Sorted: [11000, 11800, 12000, 12200, 22000]");
  console.log("     Supplier 3 @ 22000 = outlier (above IQR upper bound)");
  console.log(
    "   - Ayam Potong: 4 suppliers → cold start (master ref Rp 40,000)",
  );
  console.log(
    "   - Telur Ayam: 3 suppliers → cold start (master ref Rp 28,000)",
  );
  console.log("\n📄 Report Test:");
  console.log("   - Call GET /api/reports/daily?date=2026-07-14");
  console.log(
    "   - Expected: COGS ~9 entries, PROCUREMENT 7 entries, OPEX 2 entries",
  );
  console.log("   - warningBypassCount: 1 (Order 2 Ayam)");
  console.log("   - PDF audit table will render bypassed items");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
