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
  // 7. Create Order (linked to MoU)
  // ============================================================================

  const order1 = await prisma.order.upsert({
    where: { id: "clx00000000000000000000o1" },
    update: {},
    create: {
      id: "clx00000000000000000000o1",
      total: 615000,
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
  // 8. Create Batch (with BatchItems)
  // ============================================================================

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
      sppgId: sppg.id,
      createdById: admin.id,
      batchItems: {
        create: [
          {
            itemId: createdItems[0].id, // Beras Premium
            quantity: 15,
            unitPrice: 11500,
            subtotal: 172500,
            createdById: admin.id,
          },
          {
            itemId: createdItems[1].id, // Ayam Potong
            quantity: 3,
            unitPrice: 34000,
            subtotal: 102000,
            createdById: admin.id,
          },
          {
            itemId: createdItems[2].id, // Sayur Bayam
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
  if (!batch1WithItems) throw new Error("Batch not found");

  const totalCost = batch1WithItems.batchItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );
  const costPerPortion = batch1WithItems.beneficiaryCount
    ? totalCost / batch1WithItems.beneficiaryCount
    : 0;

  await prisma.batch.update({
    where: { id: batch1.id },
    data: { totalCost, costPerPortion },
  });
  console.log("✅ Batch 1 upserted:", batch1.batchNumber, "Total:", totalCost);

  // ============================================================================
  // 9. Create Sample Complaint
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
  console.log("   - 1 Order (3 items, linked to MoU)");
  console.log("   - 1 Batch (3 BatchItems)");
  console.log("   - 1 Complaint");
  console.log("\n📍 GPS Data:");
  console.log("   - SPPG Purwakarta: -6.5547, 107.4461");
  console.log("   - Supplier 1 (Wanayasa): -6.5025, 107.4523 (~6km)");
  console.log("   - Supplier 2 (Purwakarta): -6.5560, 107.4480 (~0.2km)");
  console.log("   - Supplier 3 (Subang): -6.5703, 107.7634 (~34km)");
  console.log("\n💰 Cost Verification:");
  console.log(
    "   - Batch totalCost computed from BatchItems: Rp",
    totalCost.toLocaleString(),
  );
  console.log(
    "   - costPerPortion computed: Rp",
    costPerPortion.toLocaleString(),
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
