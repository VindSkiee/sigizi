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
  console.log("✅ Suppliers upserted with NIB + address + GPS");

  // Update supplier user with supplierId
  await prisma.user.update({
    where: { id: supplierUser.id },
    data: { supplierId: supplier1.id },
  });

  // ============================================================================
  // 4. Create Supplier Items (with minThreshold for low stock alerts)
  // ============================================================================

  const items = [
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 12000,
      description: "Beras premium kualitas terbaik untuk masakan sehari-hari",
      minOrderQty: 5,
      orderStep: 0.5,
      minThreshold: 50, // Low stock alert jika sisa < 50 kg
      supplierId: supplier1.id,
    },
    {
      name: "Ayam Potong",
      unit: "kg",
      basePrice: 35000,
      description: "Ayam potong segar pilihan",
      minOrderQty: 2,
      orderStep: 0.5,
      minThreshold: 20, // Low stock alert jika sisa < 20 kg
      supplierId: supplier1.id,
    },
    {
      name: "Sayur Bayam",
      unit: "kg",
      basePrice: 8000,
      description: "Bayam segar dari petani lokal",
      minOrderQty: 1,
      orderStep: 0.5,
      minThreshold: 10, // Low stock alert jika sisa < 10 kg
      supplierId: supplier1.id,
    },
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 11500,
      description: "Beras premium harga bersaing",
      minOrderQty: 10,
      orderStep: 1,
      minThreshold: 50,
      supplierId: supplier2.id,
    },
    {
      name: "Ayam Potong",
      unit: "kg",
      basePrice: 33000,
      description: "Ayam potong segar",
      minOrderQty: 3,
      orderStep: 0.5,
      minThreshold: 20,
      supplierId: supplier2.id,
    },
    {
      name: "Telur Ayam",
      unit: "kg",
      basePrice: 28000,
      description: "Telur ayam kampung segar",
      minOrderQty: 1,
      orderStep: 0.5,
      minThreshold: 30,
      supplierId: supplier2.id,
    },
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 15000,
      description: "Beras organik premium",
      minOrderQty: 5,
      orderStep: 1,
      minThreshold: 50,
      supplierId: supplier3.id,
    },
    {
      name: "Sayur Kangkung",
      unit: "kg",
      basePrice: 6000,
      description: "Kangkung segar dari kebun",
      minOrderQty: 1,
      orderStep: 0.5,
      minThreshold: 10,
      supplierId: supplier3.id,
    },
    {
      name: "Wortel",
      unit: "kg",
      basePrice: 10000,
      description: "Wortel segar kaya vitamin A",
      minOrderQty: 2,
      orderStep: 0.5,
      minThreshold: 15,
      supplierId: supplier3.id,
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
    const created = await prisma.supplierItem.upsert({
      where: { id: `clx00000000000000000000i${createdItems.length + 1}` },
      update: {},
      create: {
        id: `clx00000000000000000000i${createdItems.length + 1}`,
        ...item,
      },
    });
    createdItems.push(created);
  }
  console.log(
    "✅ Supplier items created:",
    createdItems.length,
    "items (with minThreshold)",
  );

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
  // 7. Create Orders
  // ============================================================================

  // Order 1: PENDING (untuk demo pending state)
  const order1 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o1" },
    update: {},
    create: {
      id: "clx00000000000000000000o1",
      status: "PENDING",
      total: 615000,
      notes: "Pesanan bahan baku minggu ini",
      expectedDeliveryDate: new Date("2026-07-15"),
      sppgId: sppg.id,
      supplierId: supplier1.id,
      createdById: admin.id,
      mouId: mou.id,
      items: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium
            quantity: 20,
            unitPrice: 11500, // Harga MoU (bukan basePrice)
            subtotal: 230000,
          },
          {
            itemId: createdItems[1].id, // Ayam Potong
            quantity: 5,
            unitPrice: 34000, // Harga MoU
            subtotal: 170000,
          },
          {
            itemId: createdItems[2].id, // Sayur Bayam
            quantity: 25,
            unitPrice: 7500, // Harga MoU
            subtotal: 187500,
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log(
    "✅ Order 1 upserted:",
    order1.id,
    "Status:",
    order1.status,
    "linked to MoU:",
    mou.mouNumber,
  );

  // Order 2: COMPLETED (untuk demo flow + InventoryStock creation)
  const order2 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o2" },
    update: {},
    create: {
      id: "clx00000000000000000000o2",
      status: "COMPLETED",
      total: 567500,
      notes: "Pesanan sudah selesai dan dibayar",
      expectedDeliveryDate: new Date("2026-07-12"),
      actualDeliveryDate: new Date("2026-07-12"),
      paidAt: new Date("2026-07-13T08:00:00Z"),
      paymentEvidenceUrl: "/uploads/bukti-bayar/order2.jpg",
      sppgId: sppg.id,
      supplierId: supplier1.id,
      createdById: admin.id,
      mouId: mou.id,
      items: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium
            quantity: 15,
            unitPrice: 11500,
            subtotal: 172500,
          },
          {
            itemId: createdItems[1].id, // Ayam Potong
            quantity: 5,
            unitPrice: 34000,
            subtotal: 170000,
          },
          {
            itemId: createdItems[2].id, // Sayur Bayam
            quantity: 29,
            unitPrice: 7500,
            subtotal: 217500,
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log(
    "✅ Order 2 upserted:",
    order2.id,
    "Status:",
    order2.status,
    "(COMPLETED with payment)",
  );

  // Create OrderStatusHistory for Order 2 (COMPLETED)
  await prisma.orderStatusHistory.upsert({
    where: { id: "clx00000000000000000000osh1" },
    update: {},
    create: {
      id: "clx00000000000000000000osh1",
      orderId: order2.id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin.id,
      notes: "Order berhasil dibuat dan menunggu konfirmasi dari supplier",
      createdAt: new Date("2026-07-10T08:00:00Z"),
    },
  });
  await prisma.orderStatusHistory.upsert({
    where: { id: "clx00000000000000000000osh2" },
    update: {},
    create: {
      id: "clx00000000000000000000osh2",
      orderId: order2.id,
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      changedById: supplierUser.id,
      notes: "Konfirmasi dari supplier, barang akan dikirim sesuai jadwal",
      createdAt: new Date("2026-07-10T10:00:00Z"),
    },
  });
  await prisma.orderStatusHistory.upsert({
    where: { id: "clx00000000000000000000osh3" },
    update: {},
    create: {
      id: "clx00000000000000000000osh3",
      orderId: order2.id,
      fromStatus: "CONFIRMED",
      toStatus: "DELIVERED",
      changedById: supplierUser.id,
      notes: "Barang sudah dikirim, menunggu verifikasi dan pembayaran",
      createdAt: new Date("2026-07-12T07:00:00Z"),
    },
  });
  await prisma.orderStatusHistory.upsert({
    where: { id: "clx00000000000000000000osh4" },
    update: {},
    create: {
      id: "clx00000000000000000000osh4",
      orderId: order2.id,
      fromStatus: "DELIVERED",
      toStatus: "COMPLETED",
      changedById: admin.id,
      notes: "Pembayaran telah diverifikasi dan diselesaikan",
      evidenceUrl: "/uploads/bukti-bayar/order2.jpg",
      createdAt: new Date("2026-07-13T08:00:00Z"),
    },
  });
  console.log(
    "✅ Order 2 status history created (4 entries: PENDING → CONFIRMED → DELIVERED → COMPLETED)",
  );

  // ============================================================================
  // 8. Create InventoryStock lots
  // ============================================================================

  // Lot 1: SYSTEM_ORDER dari Order 2 - Beras Premium
  const invLot1 = await prisma.inventoryStock.upsert({
    where: { id: "clx00000000000000000000inv1" },
    update: {},
    create: {
      id: "clx00000000000000000000inv1",
      sppgId: sppg.id,
      itemId: createdItems[0].id, // Beras Premium
      orderItemId: order2.items[0].id,
      source: "SYSTEM_ORDER",
      purchasePrice: 11500, // Harga lock dari MoU
      initialQty: 15,
      remainingQty: 15, // Belum terpakai
      createdById: admin.id,
      notes: "Stok dari order ORDER-20260710-002 (Beras Premium 15kg)",
    },
  });
  console.log(
    "✅ Inventory lot 1 created: Beras Premium (SYSTEM_ORDER, 15kg @ Rp11,500)",
  );

  // Lot 2: SYSTEM_ORDER dari Order 2 - Ayam Potong
  const invLot2 = await prisma.inventoryStock.upsert({
    where: { id: "clx00000000000000000000inv2" },
    update: {},
    create: {
      id: "clx00000000000000000000inv2",
      sppgId: sppg.id,
      itemId: createdItems[1].id, // Ayam Potong
      orderItemId: order2.items[1].id,
      source: "SYSTEM_ORDER",
      purchasePrice: 34000, // Harga lock dari MoU
      initialQty: 5,
      remainingQty: 5, // Belum terpakai
      createdById: admin.id,
      notes: "Stok dari order ORDER-20260710-002 (Ayam Potong 5kg)",
    },
  });
  console.log(
    "✅ Inventory lot 2 created: Ayam Potong (SYSTEM_ORDER, 5kg @ Rp34,000)",
  );

  // Lot 3: MANUAL_ADJUSTMENT - Sayur Bayam (stok manual dari supplier)
  const invLot3 = await prisma.inventoryStock.upsert({
    where: { id: "clx00000000000000000000inv3" },
    update: {},
    create: {
      id: "clx00000000000000000000inv3",
      sppgId: sppg.id,
      itemId: createdItems[2].id, // Sayur Bayam
      source: "MANUAL_ADJUSTMENT",
      purchasePrice: 7500,
      initialQty: 30,
      remainingQty: 15, // Sebagian sudah terpakai (15kg untuk batch1)
      expiredAt: new Date("2026-07-20"), // Perishable: expired dalam 7 hari
      createdById: admin.id,
      notes: "Stok manual dari petani lokal (bayam segar)",
    },
  });
  console.log(
    "✅ Inventory lot 3 created: Sayur Bayam (MANUAL_ADJUSTMENT, 30kg @ Rp7,500, expired 20 Juli)",
  );

  // Create InventoryAdjustmentLog untuk lot 3 (pengurangan karena batch1)
  await prisma.inventoryAdjustmentLog.upsert({
    where: { id: "clx00000000000000000000adj1" },
    update: {},
    create: {
      id: "clx00000000000000000000adj1",
      inventoryStockId: invLot3.id,
      adjustmentQty: -15, // Pengurangan 15kg untuk batch1
      reason: "BATCH_CONSUMPTION",
      description:
        "Penggunaan stok untuk batch BATCH-20260710-001 (Nasi Ayam Bakar + Sayur Bayam)",
      changedById: admin.id,
      createdAt: new Date("2026-07-10T14:00:00Z"),
    },
  });
  console.log("✅ Inventory adjustment log created: -15kg Bayam untuk batch1");

  // ============================================================================
  // 9. Create Batches
  // ============================================================================

  // Batch 1: ACTIVE (menggunakan stok dari lot3 - Sayur Bayam)
  const batch1 = await prisma.batch.upsert({
    where: { id: "clx00000000000000000000bt1" },
    update: {},
    create: {
      id: "clx00000000000000000000bt1",
      batchNumber: "BATCH-20260710-001",
      reportKey: "A7X9K2M4",
      menu: "Nasi Ayam Bakar + Sayur Bayam",
      nutrition: { calories: 450, protein: 25, fat: 15, carbs: 50 },
      allergens: ["gluten"],
      beneficiaryCount: 150,
      costPerPortion: 0,
      totalCost: 0,
      costPerPortionStandard: 10000,
      totalBudget: 1500000, // 10000 * 150
      budgetVariance: 0, // Will be computed after creation
      sppgId: sppg.id,
      status: "ACTIVE",
      createdById: admin.id,
      batchItems: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium
            name: "Beras Premium 15kg",
            unit: "kg",
            quantity: 15,
            unitPrice: 11500, // Hardcoded untuk batch active (bypass FIFO untuk seed)
            subtotal: 172500,
            createdById: admin.id,
          },
          {
            itemId: createdItems[1].id, // Ayam Potong
            name: "Ayam Potong 3kg",
            unit: "kg",
            quantity: 3,
            unitPrice: 34000,
            subtotal: 102000,
            createdById: admin.id,
          },
          {
            itemId: createdItems[2].id, // Sayur Bayam
            name: "Sayur Bayam 15kg",
            unit: "kg",
            quantity: 15,
            unitPrice: 7500,
            subtotal: 112500,
            inventoryStockId: invLot3.id, // Linked ke lot3
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
  if (!batch1WithItems) throw new Error("Batch not found");

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
  console.log(
    "✅ Batch 1 upserted:",
    batch1.batchNumber,
    "Status:",
    batch1.status,
    "Total:",
    totalCost1,
  );

  // Batch 2: COMPLETED (menggunakan FIFO dari lot1 & lot2)
  const batch2 = await prisma.batch.upsert({
    where: { id: "clx00000000000000000000bt2" },
    update: {},
    create: {
      id: "clx00000000000000000000bt2",
      batchNumber: "BATCH-20260711-001",
      reportKey: "B8Y3L5N7",
      menu: "Nasi Putih + Ayam Goreng + Bayam Cah",
      nutrition: { calories: 520, protein: 30, fat: 18, carbs: 55 },
      allergens: [],
      beneficiaryCount: 100,
      costPerPortion: 0,
      totalCost: 0,
      costPerPortionStandard: 10000,
      totalBudget: 1000000, // 10000 * 100
      budgetVariance: 0,
      sppgId: sppg.id,
      status: "COMPLETED",
      createdById: admin.id,
      batchItems: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium
            name: "Beras Premium 10kg",
            unit: "kg",
            quantity: 10,
            unitPrice: 11500, // Harga dari lot1 (FIFO)
            subtotal: 115000,
            inventoryStockId: invLot1.id, // Linked ke lot1
            createdById: admin.id,
          },
          {
            itemId: createdItems[1].id, // Ayam Potong
            name: "Ayam Potong 4kg",
            unit: "kg",
            quantity: 4,
            unitPrice: 34000, // Harga dari lot2 (FIFO)
            subtotal: 136000,
            inventoryStockId: invLot2.id, // Linked ke lot2
            createdById: admin.id,
          },
          {
            itemId: createdItems[2].id, // Sayur Bayam
            name: "Sayur Bayam 10kg",
            unit: "kg",
            quantity: 10,
            unitPrice: 7500,
            subtotal: 75000,
            createdById: admin.id,
          },
        ],
      },
    },
  });

  // Compute totalCost from BatchItems
  const batch2WithItems = await prisma.batch.findUnique({
    where: { id: batch2.id },
    include: { batchItems: true },
  });
  if (!batch2WithItems) throw new Error("Batch not found");

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
      budgetVariance: totalCost2 - 1000000,
    },
  });
  console.log(
    "✅ Batch 2 upserted:",
    batch2.batchNumber,
    "Status:",
    batch2.status,
    "Total:",
    totalCost2,
  );

  // Update InventoryStock remainingQty setelah batch2 menggunakan stok
  // Lot 1: 15 - 10 = 5 kg tersisa
  await prisma.inventoryStock.update({
    where: { id: invLot1.id },
    data: { remainingQty: 5 },
  });
  // Lot 2: 5 - 4 = 1 kg tersisa
  await prisma.inventoryStock.update({
    where: { id: invLot2.id },
    data: { remainingQty: 1 },
  });
  console.log(
    "✅ Inventory stock updated: Lot1 (Beras) remaining 5kg, Lot2 (Ayam) remaining 1kg",
  );

  // ============================================================================
  // 10. Create Sample Complaint
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
  console.log("✅ Complaint upserted");

  // ============================================================================
  // 11. Create Operational Expenses (for financial report demo)
  // ============================================================================

  await prisma.operationalExpense.upsert({
    where: { id: "clx00000000000000000000ope1" },
    update: {},
    create: {
      id: "clx00000000000000000000ope1",
      sppgId: sppg.id,
      category: "TRANSPORTATION",
      amount: 125000,
      expenseDate: new Date("2026-07-10T09:00:00Z"),
      description: "Biaya transportasi pengambilan bahan baku ke supplier",
      evidenceUrl: "/uploads/opex/transport-20260710.jpg",
      notes: "Demo biaya transportasi harian",
      createdById: admin.id,
    },
  });

  await prisma.operationalExpense.upsert({
    where: { id: "clx00000000000000000000ope2" },
    update: {},
    create: {
      id: "clx00000000000000000000ope2",
      sppgId: sppg.id,
      category: "FUEL",
      amount: 175000,
      expenseDate: new Date("2026-07-11T14:00:00Z"),
      description: "Pengeluaran bensin mobil pengantar",
      evidenceUrl: "/uploads/opex/fuel-20260711.jpg",
      notes: "Demo biaya bensin mingguan",
      createdById: admin.id,
    },
  });

  await prisma.operationalExpense.upsert({
    where: { id: "clx00000000000000000000ope3" },
    update: {},
    create: {
      id: "clx00000000000000000000ope3",
      sppgId: sppg.id,
      category: "VEHICLE_MAINTENANCE",
      amount: 350000,
      expenseDate: new Date("2026-07-12T11:30:00Z"),
      description: "Maintenance kendaraan pengantaran",
      evidenceUrl: "/uploads/opex/maintenance-20260712.jpg",
      notes: "Servis berkala mobil pengantar",
      createdById: admin.id,
    },
  });

  await prisma.operationalExpense.upsert({
    where: { id: "clx00000000000000000000ope4" },
    update: {},
    create: {
      id: "clx00000000000000000000ope4",
      sppgId: sppg.id,
      category: "ADMINISTRATIVE",
      amount: 90000,
      expenseDate: new Date("2026-07-13T08:30:00Z"),
      description: "Pengeluaran administrasi operasional",
      notes: "ATK dan fotokopi dokumen laporan",
      createdById: admin.id,
    },
  });
  console.log("✅ Operational expenses upserted: 4 demo records");

  // ============================================================================
  // Summary
  // ============================================================================

  console.log("\n🎉 Seeding completed!");
  console.log("\n📊 Summary:");
  console.log("   - 1 SPPG (SPPG Purwakarta) — with GPS coordinates");
  console.log("   - 2 Users (1 admin, 1 supplier)");
  console.log("   - 3 Suppliers — with NIB + structured address + GPS");
  console.log("   - 9 Supplier Items (with minThreshold for low stock alerts)");
  console.log("   - 4 Beneficiaries");
  console.log("   - 1 MoU (ACTIVE) — partnership with agreed prices");
  console.log("   - 2 Orders (1 PENDING, 1 COMPLETED with payment)");
  console.log(
    "   - 3 InventoryStock lots (2 SYSTEM_ORDER, 1 MANUAL_ADJUSTMENT)",
  );
  console.log("   - 1 InventoryAdjustmentLog entry");
  console.log("   - 4 OrderStatusHistory entries (for COMPLETED order)");
  console.log("   - 2 Batches (1 ACTIVE, 1 COMPLETED)");
  console.log("   - 1 Complaint");
  console.log("   - 4 OperationalExpense records (transport, fuel, maintenance, admin)");
  console.log("\n📍 GPS Data:");
  console.log("   - SPPG Purwakarta: -6.5547, 107.4461");
  console.log("   - Supplier 1 (Wanayasa): -6.5025, 107.4523 (~6km)");
  console.log("   - Supplier 2 (Purwakarta): -6.5560, 107.4480 (~0.2km)");
  console.log("   - Supplier 3 (Subang): -6.5703, 107.7634 (~34km)");
  console.log("\n💰 Cost Verification:");
  console.log(
    "   - Batch 1 (ACTIVE) totalCost computed from BatchItems: Rp",
    totalCost1.toLocaleString(),
  );
  console.log(
    "   - Batch 1 costPerPortion computed: Rp",
    costPerPortion1.toLocaleString(),
  );
  console.log(
    "   - Batch 2 (COMPLETED) totalCost computed from BatchItems: Rp",
    totalCost2.toLocaleString(),
  );
  console.log(
    "   - Batch 2 costPerPortion computed: Rp",
    costPerPortion2.toLocaleString(),
  );
  console.log("\n📦 Inventory Stock Status:");
  console.log(
    "   - Lot 1 (Beras Premium): 5kg remaining dari 15kg (10kg terpakai untuk batch2)",
  );
  console.log(
    "   - Lot 2 (Ayam Potong): 1kg remaining dari 5kg (4kg terpakai untuk batch2)",
  );
  console.log(
    "   - Lot 3 (Sayur Bayam): 15kg remaining dari 30kg (15kg terpakai untuk batch1)",
  );
  console.log("   - Lot 3 expiredAt: 20 Juli 2026 (perishable)");
  console.log("\n🔄 Order Workflow Demo:");
  console.log("   - Order 1 (PENDING): Menunggu konfirmasi supplier");
  console.log(
    "   - Order 2 (COMPLETED): Full flow PENDING → CONFIRMED → DELIVERED → COMPLETED",
  );
  console.log("     → InventoryStock otomatis dibuat saat COMPLETED");
  console.log("     → Status history: 4 entries tercatat");
  console.log("\n📄 Report Demo Data:");
  console.log("   - Daily / weekly / monthly reports now have COGS, procurement, and OPEX samples");
  console.log("   - ReportSnapshot will be created at runtime by the report flow or scheduler");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
