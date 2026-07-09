import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create SPPG
  const sppg = await prisma.sppg.create({
    data: {
      name: 'SPPG Purwakarta',
      address: 'Jl. Nasional III, Purwakarta, Jawa Barat',
    },
  });
  console.log('✅ SPPG created:', sppg.name);

  // Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sppg-purwakarta.go.id',
      name: 'Budi Santoso',
      role: Role.SPPG_ADMIN,
      sppgId: sppg.id,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'UD. Sumber Rejeki',
      npwp: '3214001234560001',
      phone: '081234567890',
      address: 'Purwakarta',
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'UD. Murah Jaya',
      npwp: '3214001234560002',
      phone: '081234567891',
      address: 'Purwakarta',
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      name: 'Tani Segar Farm',
      npwp: '3214001234560003',
      phone: '081234567892',
      address: 'Subang',
    },
  });
  console.log('✅ Suppliers created');

  // Create Supplier Items
  const items = [
    { name: 'Beras Premium', unit: 'kg', basePrice: 12000, supplierId: supplier1.id },
    { name: 'Ayam Potong', unit: 'kg', basePrice: 35000, supplierId: supplier1.id },
    { name: 'Sayur Bayam', unit: 'kg', basePrice: 8000, supplierId: supplier1.id },
    { name: 'Beras Premium', unit: 'kg', basePrice: 11500, supplierId: supplier2.id },
    { name: 'Ayam Potong', unit: 'kg', basePrice: 33000, supplierId: supplier2.id },
    { name: 'Telur Ayam', unit: 'kg', basePrice: 28000, supplierId: supplier2.id },
    { name: 'Beras Premium', unit: 'kg', basePrice: 15000, supplierId: supplier3.id },
    { name: 'Sayur Kangkung', unit: 'kg', basePrice: 6000, supplierId: supplier3.id },
    { name: 'Wortel', unit: 'kg', basePrice: 10000, supplierId: supplier3.id },
  ];

  for (const item of items) {
    await prisma.supplierItem.create({ data: item });
  }
  console.log('✅ Supplier items created');

  // Create Beneficiaries
  const beneficiaries = [
    { name: 'SDN 1 Purwakarta', school: 'SDN 1 Purwakarta', sppgId: sppg.id },
    { name: 'SDN 2 Purwakarta', school: 'SDN 2 Purwakarta', sppgId: sppg.id },
    { name: 'SMPN 1 Purwakarta', school: 'SMPN 1 Purwakarta', sppgId: sppg.id },
  ];

  for (const ben of beneficiaries) {
    await prisma.beneficiary.create({ data: ben });
  }
  console.log('✅ Beneficiaries created');

  // Create Sample Batches
  const batch1 = await prisma.batch.create({
    data: {
      batchNumber: 'BATCH-20260709-001',
      reportKey: 'A7X9K2M4',
      menu: 'Nasi Ayam Bakar + Sayur Bayam',
      nutrition: { calories: 450, protein: 25, fat: 15, carbs: 50 },
      allergens: ['gluten'],
      costPerPortion: 8000,
      totalCost: 800000,
      sppgId: sppg.id,
    },
  });

  const batch2 = await prisma.batch.create({
    data: {
      batchNumber: 'BATCH-20260709-002',
      reportKey: 'B8Y7L3N5',
      menu: 'Nasi Ikan Goreng + Sayur Sop',
      nutrition: { calories: 420, protein: 22, fat: 18, carbs: 45 },
      allergens: ['seafood'],
      costPerPortion: 7500,
      totalCost: 750000,
      sppgId: sppg.id,
    },
  });
  console.log('✅ Batches created');

  // Create Sample Complaint
  await prisma.complaint.create({
    data: {
      reportKey: 'A7X9K2M4',
      description: 'Nasi terasa agak basi',
      batchId: batch1.id,
    },
  });
  console.log('✅ Complaint created');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
