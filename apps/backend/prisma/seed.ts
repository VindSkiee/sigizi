import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================================
  // 1. Create SPPG
  // ============================================================================

  const sppg = await prisma.sppg.upsert({
    where: { id: "clx0000000000000000000001" },
    update: {},
    create: {
      id: "clx0000000000000000000001",
      name: "SPPG Purwakarta",
      address: "Jl. Nasional III, Purwakarta, Jawa Barat",
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
    },
  });
  console.log("✅ Supplier user upserted:", supplierUser.email);

  // ============================================================================
  // 3. Create Suppliers
  // ============================================================================

  const supplier1 = await prisma.supplier.upsert({
    where: { npwp: "321400123456001" },
    update: {},
    create: {
      name: "UD. Sumber Rejeki",
      npwp: "321400123456001",
      phone: "081234567890",
      address: "Purwakarta",
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { npwp: "321400123456002" },
    update: {},
    create: {
      name: "UD. Murah Jaya",
      npwp: "321400123456002",
      phone: "081234567891",
      address: "Purwakarta",
    },
  });

  const supplier3 = await prisma.supplier.upsert({
    where: { npwp: "321400123456003" },
    update: {},
    create: {
      name: "Tani Segar Farm",
      npwp: "321400123456003",
      phone: "081234567892",
      address: "Subang",
    },
  });
  console.log("✅ Suppliers upserted");

  // Update supplier user with supplierId
  await prisma.user.update({
    where: { id: supplierUser.id },
    data: { supplierId: supplier1.id },
  });

  // ============================================================================
  // 4. Create Supplier Items (dengan field baru)
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

  const createdItems: { id: string; name: string; unit: string; basePrice: number }[] = [];
  for (const item of items) {
    const created = await prisma.supplierItem.create({ data: item });
    createdItems.push(created);
  }
  console.log("✅ Supplier items created:", createdItems.length, "items");

  // ============================================================================
  // 5. Create Beneficiaries (dengan field baru)
  // ============================================================================

  const beneficiaries = [
    {
      name: "Penerima Manfaat SDN 1",
      institution: "SDN 1 Purwakarta",
      institutionType: "SEKOLAH",
      totalBeneficiary: 150,
      address: "Jl. Sudirman No. 1, Purwakarta",
      contactPhone: "081234567801",
      sppgId: sppg.id,
    },
    {
      name: "Penerima Manfaat SDN 2",
      institution: "SDN 2 Purwakarta",
      institutionType: "SEKOLAH",
      totalBeneficiary: 120,
      address: "Jl. Ahmad Yani No. 5, Purwakarta",
      contactPhone: "081234567802",
      sppgId: sppg.id,
    },
    {
      name: "Penerima Manfaat SMPN 1",
      institution: "SMPN 1 Purwakarta",
      institutionType: "SEKOLAH",
      totalBeneficiary: 200,
      address: "Jl. Veteran No. 10, Purwakarta",
      contactPhone: "081234567803",
      sppgId: sppg.id,
    },
    {
      name: "Penerima Manfaat Panti Asuhan",
      institution: "Panti Asuhan Harapan",
      institutionType: "PANTI_ASUHAN",
      totalBeneficiary: 50,
      address: "Jl. Melati No. 3, Purwakarta",
      contactPhone: "081234567804",
      sppgId: sppg.id,
    },
  ];

  for (const ben of beneficiaries) {
    await prisma.beneficiary.create({ data: ben });
  }
  console.log("✅ Beneficiaries created:", beneficiaries.length, "institutions");

  // ============================================================================
  // 6. Create Orders & StockLots (dengan snapshot harga)
  // ============================================================================

  // Order 1: SPPG memesan dari Supplier 1
  const order1 = await prisma.order.create({
    data: {
      total: 615000, // 240000 + 175000 + 200000
      sppgId: sppg.id,
      supplierId: supplier1.id,
      createdById: admin.id,
      items: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium
            quantity: 20,
            unitPrice: 12000,    // Snapshot harga catalogue
            purchasePrice: 12000, // Harga final (sama untuk MVP)
            subtotal: 240000,
          },
          {
            itemId: createdItems[1].id, // Ayam Potong
            quantity: 5,
            unitPrice: 35000,
            purchasePrice: 35000,
            subtotal: 175000,
          },
          {
            itemId: createdItems[2].id, // Sayur Bayam
            quantity: 25,
            unitPrice: 8000,
            purchasePrice: 8000,
            subtotal: 200000,
          },
        ],
      },
    },
    include: { items: true },
  });
  console.log("✅ Order 1 created:", order1.id);

  // Create Order Status History for Order 1
  await prisma.orderStatusHistory.createMany({
    data: [
      {
        orderId: order1.id,
        fromStatus: "PENDING",
        toStatus: "CONFIRMED",
        notes: "Supplier mengkonfirmasi ketersediaan stok",
        changedById: admin.id,
      },
      {
        orderId: order1.id,
        fromStatus: "CONFIRMED",
        toStatus: "DELIVERED",
        notes: "Barang dikirim ke gudang SPPG",
        evidenceUrl: "https://example.com/delivery-proof-001.jpg",
        changedById: admin.id,
      },
      {
        orderId: order1.id,
        fromStatus: "DELIVERED",
        toStatus: "COMPLETED",
        notes: "Barang sudah diterima dan diverifikasi",
        changedById: admin.id,
      },
    ],
  });
  console.log("✅ Order Status History created");

  // StockLots dari Order 1 (barang sudah diterima)
  // remainingQty = originalQty (belum dipakai batch)
  const stockLot1 = await prisma.stockLot.create({
    data: {
      supplierId: supplier1.id,
      itemId: createdItems[0].id, // Beras Premium
      orderId: order1.id,
      orderItemId: order1.items[0].id,
      purchasePrice: 12000, // FROZEN dari OrderItem
      unit: "kg",
      originalQty: 20,
      remainingQty: 20, // Belum dipakai
      createdById: admin.id,
    },
  });

  const stockLot2 = await prisma.stockLot.create({
    data: {
      supplierId: supplier1.id,
      itemId: createdItems[1].id, // Ayam Potong
      orderId: order1.id,
      orderItemId: order1.items[1].id,
      purchasePrice: 35000,
      unit: "kg",
      originalQty: 5,
      remainingQty: 5, // Belum dipakai
      createdById: admin.id,
    },
  });

  const stockLot3 = await prisma.stockLot.create({
    data: {
      supplierId: supplier1.id,
      itemId: createdItems[2].id, // Sayur Bayam
      orderId: order1.id,
      orderItemId: order1.items[2].id,
      purchasePrice: 8000,
      unit: "kg",
      originalQty: 25,
      remainingQty: 25, // Belum dipakai
      createdById: admin.id,
    },
  });
  console.log("✅ StockLots created from Order 1");

  // InventoryTransactions untuk Order 1 (IN)
  await prisma.inventoryTransaction.createMany({
    data: [
      {
        type: "IN",
        stockLotId: stockLot1.id,
        quantity: 20,
        referenceType: "ORDER_DELIVERY",
        referenceId: order1.id,
        createdById: admin.id,
      },
      {
        type: "IN",
        stockLotId: stockLot2.id,
        quantity: 5,
        referenceType: "ORDER_DELIVERY",
        referenceId: order1.id,
        createdById: admin.id,
      },
      {
        type: "IN",
        stockLotId: stockLot3.id,
        quantity: 25,
        referenceType: "ORDER_DELIVERY",
        referenceId: order1.id,
        createdById: admin.id,
      },
    ],
  });
  console.log("✅ InventoryTransactions (IN) created for Order 1");

  // ============================================================================
  // 7. Create Batch (dengan BatchItems — harga dari StockLot)
  // ============================================================================

  const batch1 = await prisma.batch.create({
    data: {
      batchNumber: "BATCH-20260710-001",
      reportKey: "A7X9K2M4",
      menu: "Nasi Ayam Bakar + Sayur Bayam",
      nutrition: { calories: 450, protein: 25, fat: 15, carbs: 50 },
      allergens: ["gluten"],
      beneficiaryCount: 150,
      costPerPortion: 0, // Placeholder, akan di-update
      totalCost: 0, // Placeholder, akan di-update
      sppgId: sppg.id,
      createdById: admin.id,
      batchItems: {
        create: [
          {
            stockLotId: stockLot1.id, // Beras dari Lot 1
            itemId: createdItems[0].id,
            quantity: 15, // 15kg beras
            unitPrice: 12000, // FROZEN dari StockLot
            subtotal: 180000,
            createdById: admin.id,
          },
          {
            stockLotId: stockLot2.id, // Ayam dari Lot 2
            itemId: createdItems[1].id,
            quantity: 3, // 3kg ayam
            unitPrice: 35000, // FROZEN dari StockLot
            subtotal: 105000,
            createdById: admin.id,
          },
          {
            stockLotId: stockLot3.id, // Bayam dari Lot 3
            itemId: createdItems[2].id,
            quantity: 15, // 15kg bayam
            unitPrice: 8000, // FROZEN dari StockLot
            subtotal: 120000,
            createdById: admin.id,
          },
        ],
      },
    },
    include: { batchItems: true },
  });

  // Fetch batch with batchItems included
  const batch1WithItems = await prisma.batch.findUnique({
    where: { id: batch1.id },
    include: { batchItems: true },
  });
  if (!batch1WithItems) throw new Error("Batch not found");

  // Update totalCost (computed dari BatchItems)
  const totalCost = batch1WithItems.batchItems.reduce((sum, item) => sum + item.subtotal, 0);
  const costPerPortion = batch1WithItems.beneficiaryCount
    ? totalCost / batch1WithItems.beneficiaryCount
    : 0;

  await prisma.batch.update({
    where: { id: batch1.id },
    data: { totalCost, costPerPortion },
  });
  console.log("✅ Batch 1 created:", batch1.batchNumber, "Total:", totalCost);

  // InventoryTransactions untuk Batch 1 (OUT)
  await prisma.inventoryTransaction.createMany({
    data: batch1WithItems.batchItems.map((item) => ({
      type: "OUT" as const,
      stockLotId: item.stockLotId,
      batchItemId: item.id,
      quantity: item.quantity,
      referenceType: "BATCH_CONSUMPTION",
      referenceId: batch1.id,
      createdById: admin.id,
    })),
  });
  console.log("✅ InventoryTransactions (OUT) created for Batch 1");

  // Update StockLot remainingQty (dikurangi karena sudah dipakai batch)
  await prisma.stockLot.update({
    where: { id: stockLot1.id },
    data: { remainingQty: { decrement: 15 } }, // 20 - 15 = 5
  });
  await prisma.stockLot.update({
    where: { id: stockLot2.id },
    data: { remainingQty: { decrement: 3 } }, // 5 - 3 = 2
  });
  await prisma.stockLot.update({
    where: { id: stockLot3.id },
    data: { remainingQty: { decrement: 15 } }, // 25 - 15 = 10
  });
  console.log("✅ StockLot remainingQty updated");

  // ============================================================================
  // 8. Create Sample Complaint
  // ============================================================================

  await prisma.complaint.create({
    data: {
      reportKey: "A7X9K2M4",
      description: "Nasi terasa agak basi dan kurang hangat saat diterima oleh penerima manfaat",
      batchId: batch1.id,
    },
  });
  console.log("✅ Complaint created");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📊 Summary:");
  console.log("   - 1 SPPG (SPPG Purwakarta)");
  console.log("   - 2 Users (1 admin, 1 supplier)");
  console.log("   - 3 Suppliers");
  console.log("   - 9 Supplier Items (dengan minOrderQty & orderStep)");
  console.log("   - 4 Beneficiaries (dengan institution & totalBeneficiary)");
  console.log("   - 1 Order (3 items) + 3 OrderStatusHistory");
  console.log("   - 3 StockLots (snapshot harga dari Order)");
  console.log("   - 3 InventoryTransactions (IN)");
  console.log("   - 1 Batch (3 BatchItems)");
  console.log("   - 3 InventoryTransactions (OUT)");
  console.log("   - 1 Complaint");
  console.log("\n💰 Anti-Fraud Verification:");
  console.log("   - Batch totalCost computed from BatchItems: Rp", totalCost.toLocaleString());
  console.log("   - costPerPortion computed: Rp", costPerPortion.toLocaleString());
  console.log("   - All prices frozen (snapshot from StockLot)");
  console.log("   - StockLot remainingQty: Beras=5kg, Ayam=2kg, Bayam=10kg");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
