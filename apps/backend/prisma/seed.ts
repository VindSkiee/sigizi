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
  // 4. Create Supplier Items
  // ============================================================================

  const items = [
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
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 11500,
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
      unit: "kg",
      basePrice: 28000,
      description: "Telur ayam kampung segar",
      minOrderQty: 1,
      orderStep: 0.5,
      supplierId: supplier2.id,
    },
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 15000,
      description: "Beras organik premium",
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
  // 7. Create Order (linked to MoU) — unitPrice dari MoU agreed prices
  // ============================================================================

  const order1 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o1" },
    update: {},
    create: {
      id: "clx00000000000000000000o1",
      total: 615000, // 20*11500 + 5*34000 + 25*7500 = 230000+170000+187500 = 587500
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
    "linked to MoU:",
    mou.mouNumber,
  );

  // ============================================================================
  // 8. Set Order → COMPLETED (trigger InventoryStock creation)
  // ============================================================================

  await prisma.order.update({
    where: { id: order1.id },
    data: { status: "COMPLETED" },
  });

  // Buat InventoryStock manual (menggantikan logic di OrderService)
  for (const orderItem of order1.items) {
    await prisma.inventoryStock.create({
      data: {
        sppgId: sppg.id,
        itemId: orderItem.itemId,
        orderItemId: orderItem.id,
        purchasePrice: orderItem.unitPrice,
        initialQty: orderItem.quantity,
        remainingQty: orderItem.quantity,
      },
    });
  }
  console.log("✅ Order set to COMPLETED + InventoryStock created");

  // ============================================================================
  // 9. Create Batch (FIFO consume dari InventoryStock)
  // ============================================================================

  // Ambil semua inventory stock untuk SPPG ini (FIFO)
  const inventoryLots = await prisma.inventoryStock.findMany({
    where: { sppgId: sppg.id, remainingQty: { gt: 0 } },
    orderBy: { createdAt: "asc" },
  });

  // Definisikan item yang dibutuhkan batch
  const batchItemRequests = [
    {
      itemId: createdItems[0].id,
      quantity: 15,
      name: "Beras Premium 15kg",
      unit: "kg",
    },
    {
      itemId: createdItems[1].id,
      quantity: 3,
      name: "Ayam Potong 3kg",
      unit: "kg",
    },
    {
      itemId: createdItems[2].id,
      quantity: 15,
      name: "Sayur Bayam 15kg",
      unit: "kg",
    },
  ];

  let totalCost = 0;
  const batchItemsData: {
    itemId: string;
    inventoryStockId: string;
    name: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    createdById: string;
  }[] = [];

  for (const request of batchItemRequests) {
    const availableLots = inventoryLots.filter(
      (lot) => lot.itemId === request.itemId && lot.remainingQty > 0,
    );

    let quantityNeeded = request.quantity;

    for (const lot of availableLots) {
      if (quantityNeeded <= 0) break;

      const consumeQty = Math.min(lot.remainingQty, quantityNeeded);
      const unitPrice = lot.purchasePrice;
      const subtotal = consumeQty * unitPrice;

      // Kurangi remainingQty di lot
      await prisma.inventoryStock.update({
        where: { id: lot.id },
        data: { remainingQty: { decrement: consumeQty } },
      });

      batchItemsData.push({
        itemId: request.itemId,
        inventoryStockId: lot.id,
        name: request.name,
        unit: request.unit,
        quantity: consumeQty,
        unitPrice,
        subtotal,
        createdById: admin.id,
      });

      totalCost += subtotal;
      quantityNeeded -= consumeQty;

      // Update local lot remainingQty
      lot.remainingQty -= consumeQty;
    }
  }

  const beneficiaryCount = 150;
  const costPerPortion = totalCost / beneficiaryCount;
  const totalBudget = 10000 * beneficiaryCount;

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
      beneficiaryCount,
      costPerPortion,
      totalCost,
      costPerPortionStandard: 10000,
      totalBudget,
      budgetVariance: totalCost - totalBudget,
      sppgId: sppg.id,
      createdById: admin.id,
      batchItems: {
        create: batchItemsData,
      },
    },
  });
  console.log("✅ Batch 1 upserted:", batch1.batchNumber, "Total:", totalCost);

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
  // Summary
  // ============================================================================

  console.log("\n🎉 Seeding completed!");
  console.log("\n📊 Summary:");
  console.log("   - 1 SPPG (SPPG Purwakarta) — with GPS coordinates");
  console.log("   - 2 Users (1 admin, 1 supplier)");
  console.log("   - 3 Suppliers — with NIB + structured address + GPS");
  console.log(
    "   - 9 Supplier Items (with description, minOrderQty, orderStep)",
  );
  console.log("   - 4 Beneficiaries");
  console.log("   - 1 MoU (ACTIVE) — partnership with agreed prices");
  console.log("   - 1 Order (3 items, COMPLETED)");
  console.log("   - 3 InventoryStock lots (from Order → COMPLETED)");
  console.log("   - 1 Batch (3 BatchItems via FIFO)");
  console.log("   - 1 Complaint");
  console.log("\n💰 Cost Verification:");
  console.log(
    "   - Batch totalCost (FIFO locked prices): Rp",
    totalCost.toLocaleString(),
  );
  console.log(
    "   - costPerPortion computed: Rp",
    costPerPortion.toLocaleString(),
  );
  console.log(
    "   - budgetVariance: Rp",
    (totalCost - totalBudget).toLocaleString(),
  );
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
