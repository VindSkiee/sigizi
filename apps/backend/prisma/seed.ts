import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcrypt";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = hashSync("password123", 10);

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================================
  // 1. Create SPPG (3 SPPG di Cirebon)
  // ============================================================================

  const sppg1 = await prisma.sppg.upsert({
    where: { id: "clx_sppg_cirebon_utara" },
    update: {},
    create: {
      id: "clx_sppg_cirebon_utara",
      name: "SPPG Cirebon Utara",
      address: "Jl. Slamet Riyadi No. 45, Cirebon",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "SUMBER",
      village: "Sumber",
      postalCode: "45611",
      latitude: -6.7015,
      longitude: 108.553,
    },
  });

  const sppg2 = await prisma.sppg.upsert({
    where: { id: "clx_sppg_cirebon_selatan" },
    update: {},
    create: {
      id: "clx_sppg_cirebon_selatan",
      name: "SPPG Cirebon Selatan",
      address: "Jl. Raya Weru No. 78, Cirebon",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "WERU",
      village: "Weru",
      postalCode: "45155",
      latitude: -6.732,
      longitude: 108.578,
    },
  });

  const sppg3 = await prisma.sppg.upsert({
    where: { id: "clx_sppg_cirebon_barat" },
    update: {},
    create: {
      id: "clx_sppg_cirebon_barat",
      name: "SPPG Cirebon Barat",
      address: "Jl. Emplak No. 12, Arjawinangun",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "ARJAWINANGUN",
      village: "Arjawinangun",
      postalCode: "45162",
      latitude: -6.758,
      longitude: 108.492,
    },
  });

  console.log("✅ SPPG upserted:", 3);

  // ============================================================================
  // 2. Create Users (3 admin + 18 supplier = 21 users)
  // ============================================================================

  // Admin SPPG
  const admin1 = await prisma.user.upsert({
    where: { email: "admin-cirebon-utara@sigizi.go.id" },
    update: {},
    create: {
      email: "admin-cirebon-utara@sigizi.go.id",
      name: "Ahmad Hidayat",
      role: "SPPG_ADMIN",
      password: DEFAULT_PASSWORD,
      sppgId: sppg1.id,
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: "admin-cirebon-selatan@sigizi.go.id" },
    update: {},
    create: {
      email: "admin-cirebon-selatan@sigizi.go.id",
      name: "Siti Nurhaliza",
      role: "SPPG_ADMIN",
      password: DEFAULT_PASSWORD,
      sppgId: sppg2.id,
    },
  });

  const admin3 = await prisma.user.upsert({
    where: { email: "admin-cirebon-barat@sigizi.go.id" },
    update: {},
    create: {
      email: "admin-cirebon-barat@sigizi.go.id",
      name: "Dedi Mulyadi",
      role: "SPPG_ADMIN",
      password: DEFAULT_PASSWORD,
      sppgId: sppg3.id,
    },
  });

  console.log("✅ Admin users upserted:", 3);

  // ============================================================================
  // 3. Create Suppliers (18: 9 market sellers + 9 non-market sellers)
  // ============================================================================

  // Market Sellers (9)
  const suppliers: any[] = [];

  // 1. Toko Berkah - Pasar Ciledug
  suppliers[0] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_01" },
    update: {},
    create: {
      id: "clx_supplier_01",
      name: "Toko Berkah",
      nib: "1000000000001",
      phone: "081234567001",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "SUMBER",
      latitude: -6.702,
      longitude: 108.554,
      isMarketSeller: true,
      marketName: "Pasar Ciledug",
    },
  });

  // 2. UD. Segar Makmur - Pasar Weru
  suppliers[1] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_02" },
    update: {},
    create: {
      id: "clx_supplier_02",
      name: "UD. Segar Makmur",
      nib: "1000000000002",
      phone: "081234567002",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "WERU",
      latitude: -6.733,
      longitude: 108.579,
      isMarketSeller: true,
      marketName: "Pasar Weru",
    },
  });

  // 3. Sumber Rejeki - Pasar Arjawinangun
  suppliers[2] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_03" },
    update: {},
    create: {
      id: "clx_supplier_03",
      name: "Sumber Rejeki",
      nib: "1000000000003",
      phone: "081234567003",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "ARJAWINANGUN",
      latitude: -6.759,
      longitude: 108.493,
      isMarketSeller: true,
      marketName: "Pasar Arjawinangun",
    },
  });

  // 4. Tani Jaya - Pasar Plumbon
  suppliers[3] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_04" },
    update: {},
    create: {
      id: "clx_supplier_04",
      name: "Tani Jaya",
      nib: "1000000000004",
      phone: "081234567004",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "PLUMBON",
      latitude: -6.745,
      longitude: 108.562,
      isMarketSeller: true,
      marketName: "Pasar Plumbon",
    },
  });

  // 5. Berkah Tani - Pasar Depok
  suppliers[4] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_05" },
    update: {},
    create: {
      id: "clx_supplier_05",
      name: "Berkah Tani",
      nib: "1000000000005",
      phone: "081234567005",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "DEPOK",
      latitude: -6.728,
      longitude: 108.545,
      isMarketSeller: true,
      marketName: "Pasar Depok",
    },
  });

  // 6. Maju Jaya - Pasar Talun
  suppliers[5] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_06" },
    update: {},
    create: {
      id: "clx_supplier_06",
      name: "Maju Jaya",
      nib: "1000000000006",
      phone: "081234567006",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "TALUN",
      latitude: -6.768,
      longitude: 108.512,
      isMarketSeller: true,
      marketName: "Pasar Talun",
    },
  });

  // 7. UD. Sentosa Pasar - Pasar Astanajapura
  suppliers[6] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_07" },
    update: {},
    create: {
      id: "clx_supplier_07",
      name: "UD. Sentosa Pasar",
      nib: "1000000000007",
      phone: "081234567007",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "ASTANAJAPURA",
      latitude: -6.785,
      longitude: 108.528,
      isMarketSeller: true,
      marketName: "Pasar Astanajapura",
    },
  });

  // 8. Jaya Abadi - Pasar Plered
  suppliers[7] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_08" },
    update: {},
    create: {
      id: "clx_supplier_08",
      name: "Jaya Abadi",
      nib: "1000000000008",
      phone: "081234567008",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "PLERED",
      latitude: -6.772,
      longitude: 108.498,
      isMarketSeller: true,
      marketName: "Pasar Plered",
    },
  });

  // 9. Makmur Sejahtera - Pasar Kapetakan
  suppliers[8] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_09" },
    update: {},
    create: {
      id: "clx_supplier_09",
      name: "Makmur Sejahtera",
      nib: "1000000000009",
      phone: "081234567009",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "KAPETAKAN",
      latitude: -6.718,
      longitude: 108.568,
      isMarketSeller: true,
      marketName: "Pasar Kapetakan",
    },
  });

  // Non-Market Sellers (9)
  // 10. UD. Murah Jaya - Sumber
  suppliers[9] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_10" },
    update: {},
    create: {
      id: "clx_supplier_10",
      name: "UD. Murah Jaya",
      nib: "1000000000010",
      phone: "081234567010",
      address: "Jl. Raya Sumber Km 3",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "SUMBER",
      village: "Sumber",
      postalCode: "45611",
      latitude: -6.703,
      longitude: 108.555,
      isMarketSeller: false,
    },
  });

  // 11. CV. Pangan Sejahtera - Weru
  suppliers[10] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_11" },
    update: {},
    create: {
      id: "clx_supplier_11",
      name: "CV. Pangan Sejahtera",
      nib: "1000000000011",
      phone: "081234567011",
      address: "Jl. Raya Weru No. 22",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "WERU",
      village: "Weru",
      postalCode: "45155",
      latitude: -6.734,
      longitude: 108.58,
      isMarketSeller: false,
    },
  });

  // 12. UD. Makmur Abadi - Arjawinangun
  suppliers[11] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_12" },
    update: {},
    create: {
      id: "clx_supplier_12",
      name: "UD. Makmur Abadi",
      nib: "1000000000012",
      phone: "081234567012",
      address: "Jl. Emplak No. 45",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "ARJAWINANGUN",
      village: "Arjawinangun",
      postalCode: "45162",
      latitude: -6.76,
      longitude: 108.494,
      isMarketSeller: false,
    },
  });

  // 13. CV. Berkah Pangan - Plumbon
  suppliers[12] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_13" },
    update: {},
    create: {
      id: "clx_supplier_13",
      name: "CV. Berkah Pangan",
      nib: "1000000000013",
      phone: "081234567013",
      address: "Jl. Plumbon Raya No. 8",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "PLUMBON",
      village: "Plumbon",
      postalCode: "45155",
      latitude: -6.746,
      longitude: 108.563,
      isMarketSeller: false,
    },
  });

  // 14. UD. Jaya Abadi - Depok
  suppliers[13] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_14" },
    update: {},
    create: {
      id: "clx_supplier_14",
      name: "UD. Jaya Abadi",
      nib: "1000000000014",
      phone: "081234567014",
      address: "Jl. Depok Raya No. 15",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "DEPOK",
      village: "Depok",
      postalCode: "45153",
      latitude: -6.729,
      longitude: 108.546,
      isMarketSeller: false,
    },
  });

  // 15. UD. Rejeki Nom - Talun
  suppliers[14] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_15" },
    update: {},
    create: {
      id: "clx_supplier_15",
      name: "UD. Rejeki Nom",
      nib: "1000000000015",
      phone: "081234567015",
      address: "Jl. Talun No. 33",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "TALUN",
      village: "Talun",
      postalCode: "45163",
      latitude: -6.769,
      longitude: 108.513,
      isMarketSeller: false,
    },
  });

  // 16. CV. Sumber Makmur - Astanajapura
  suppliers[15] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_16" },
    update: {},
    create: {
      id: "clx_supplier_16",
      name: "CV. Sumber Makmur",
      nib: "1000000000016",
      phone: "081234567016",
      address: "Jl. Astanajapura No. 55",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "ASTANAJAPURA",
      village: "Astanajapura",
      postalCode: "45181",
      latitude: -6.786,
      longitude: 108.529,
      isMarketSeller: false,
    },
  });

  // 17. UD. Tani Sejahtera - Plered
  suppliers[16] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_17" },
    update: {},
    create: {
      id: "clx_supplier_17",
      name: "UD. Tani Sejahtera",
      nib: "1000000000017",
      phone: "081234567017",
      address: "Jl. Plered No. 77",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "PLERED",
      village: "Plered",
      postalCode: "45164",
      latitude: -6.773,
      longitude: 108.499,
      isMarketSeller: false,
    },
  });

  // 18. CV. Pangan Lestari - Kapetakan
  suppliers[17] = await prisma.supplier.upsert({
    where: { id: "clx_supplier_18" },
    update: {},
    create: {
      id: "clx_supplier_18",
      name: "CV. Pangan Lestari",
      nib: "1000000000018",
      phone: "081234567018",
      address: "Jl. Kapetakan No. 19",
      province: "JAWA_BARAT",
      regency: "CIREBON",
      district: "KAPETAKAN",
      village: "Kapetakan",
      postalCode: "45172",
      latitude: -6.719,
      longitude: 108.569,
      isMarketSeller: false,
    },
  });

  console.log("✅ Suppliers upserted:", 18);

  // Create supplier users
  const supplierUsers: any[] = [];
  for (let i = 0; i < 18; i++) {
    const supplier = suppliers[i];
    const user = await prisma.user.upsert({
      where: {
        email: `supplier-${String(i + 1).padStart(2, "0")}@sigizi.go.id`,
      },
      update: { supplierId: supplier.id },
      create: {
        email: `supplier-${String(i + 1).padStart(2, "0")}@sigizi.go.id`,
        name: supplier.name,
        role: "SUPPLIER",
        password: DEFAULT_PASSWORD,
        supplierId: supplier.id,
      },
    });
    supplierUsers[i] = user;
  }

  console.log("✅ Supplier users upserted:", 18);

  // ============================================================================
  // 4. Create Supplier Items (~85 items for realistic market simulation)
  // ============================================================================

  const items: Array<{
    name: string;
    unit: string;
    basePrice: number;
    description: string;
    minOrderQty: number;
    orderStep: number;
    supplierId: string;
  }> = [];
  let itemIndex = 0;

  // Helper function to add items
  const addItem = (
    supplierIdx: number,
    name: string,
    unit: string,
    basePrice: number,
    description: string,
    minOrderQty: number = 1,
    orderStep: number = 0.5,
  ) => {
    items.push({
      name,
      unit,
      basePrice,
      description,
      minOrderQty,
      orderStep,
      supplierId: suppliers[supplierIdx].id,
    });
    itemIndex++;
  };

  // BERAS PREMIUM (14 suppliers) - Mature market
  addItem(0, "Beras Premium", "kg", 12000, "Beras premium kualitas terbaik");
  addItem(1, "Beras Premium", "kg", 12500, "Beras premium pilihan");
  addItem(2, "Beras Premium", "kg", 11800, "Beras premium harga bersaing");
  addItem(3, "Beras Premium", "kg", 13000, "Beras premium grade A");
  addItem(4, "Beras Premium", "kg", 12200, "Beras premium lokal");
  addItem(5, "Beras Premium", "kg", 12800, "Beras premium super");
  addItem(6, "Beras Premium", "kg", 11500, "Beras premium ekonomis");
  addItem(7, "Beras Premium", "kg", 13500, "Beras premium organik");
  addItem(8, "Beras Premium", "kg", 12300, "Beras premium standar");
  addItem(9, "Beras Premium", "kg", 12600, "Beras premium kemasan");
  addItem(10, "Beras Premium", "kg", 14500, "Beras premium import"); // outlier
  addItem(11, "Beras Premium", "kg", 11900, "Beras premium bulk");
  addItem(12, "Beras Premium", "kg", 12400, "Beras premium pilihan");
  addItem(13, "Beras Premium", "kg", 12100, "Beras premium lokal");

  // AYAM POTONG (12 suppliers) - Mature market
  addItem(0, "Ayam Potong", "kg", 35000, "Ayam potong segar");
  addItem(1, "Ayam Potong", "kg", 36000, "Ayam potong pilihan");
  addItem(2, "Ayam Potong", "kg", 34000, "Ayam potong segar harian");
  addItem(3, "Ayam Potong", "kg", 37000, "Ayam potong premium");
  addItem(4, "Ayam Potong", "kg", 35500, "Ayam potong lokal");
  addItem(5, "Ayam Potong", "kg", 38000, "Ayam potong super");
  addItem(6, "Ayam Potong", "kg", 33000, "Ayam potong ekonomis");
  addItem(7, "Ayam Potong", "kg", 42000, "Ayam potong organik"); // outlier
  addItem(8, "Ayam Potong", "kg", 36500, "Ayam potong standar");
  addItem(9, "Ayam Potong", "kg", 34500, "Ayam potong segar");
  addItem(10, "Ayam Potong", "kg", 37500, "Ayam potong pilihan");
  addItem(11, "Ayam Potong", "kg", 35000, "Ayam potong harian");

  // TELUR AYAM (10 suppliers) - Mature market
  addItem(0, "Telur Ayam", "kg", 28000, "Telur ayam segar");
  addItem(1, "Telur Ayam", "kg", 29000, "Telur ayam pilihan");
  addItem(2, "Telur Ayam", "kg", 27000, "Telur ayam grade A");
  addItem(3, "Telur Ayam", "kg", 30000, "Telur ayam premium");
  addItem(4, "Telur Ayam", "kg", 28500, "Telur ayam lokal");
  addItem(5, "Telur Ayam", "kg", 32000, "Telur ayam super"); // outlier
  addItem(6, "Telur Ayam", "kg", 26000, "Telur ayam ekonomis");
  addItem(7, "Telur Ayam", "kg", 29500, "Telur ayam segar");
  addItem(8, "Telur Ayam", "kg", 28000, "Telur ayam standar");
  addItem(9, "Telur Ayam", "kg", 27500, "Telur ayam harian");

  // TAHU PUTIH (8 suppliers) - Mature market
  addItem(0, "Tahu Putih", "kg", 8000, "Tahu putih segar");
  addItem(1, "Tahu Putih", "kg", 8500, "Tahu putih pilihan");
  addItem(2, "Tahu Putih", "kg", 7500, "Tahu putih lokal");
  addItem(3, "Tahu Putih", "kg", 9000, "Tahu putih premium");
  addItem(4, "Tahu Putih", "kg", 8200, "Tahu putih standar");
  addItem(5, "Tahu Putih", "kg", 10000, "Tahu putih organik"); // outlier
  addItem(6, "Tahu Putih", "kg", 7800, "Tahu putih ekonomis");
  addItem(7, "Tahu Putih", "kg", 8300, "Tahu putih segar harian");

  // TEMPE (8 suppliers) - Mature market
  addItem(0, "Tempe", "kg", 10000, "Tempe segar");
  addItem(1, "Tempe", "kg", 10500, "Tempe pilihan");
  addItem(2, "Tempe", "kg", 9500, "Tempe lokal");
  addItem(3, "Tempe", "kg", 11000, "Tempe premium");
  addItem(4, "Tempe", "kg", 10200, "Tempe standar");
  addItem(5, "Tempe", "kg", 12000, "Tempe organik"); // outlier
  addItem(6, "Tempe", "kg", 9800, "Tempe ekonomis");
  addItem(7, "Tempe", "kg", 10300, "Tempe segar harian");

  // SAYUR BAYAM (8 suppliers) - Mature market
  addItem(0, "Sayur Bayam", "kg", 7000, "Bayam segar");
  addItem(1, "Sayur Bayam", "kg", 7500, "Bayam pilihan");
  addItem(2, "Sayur Bayam", "kg", 6500, "Bayam lokal");
  addItem(3, "Sayur Bayam", "kg", 8000, "Bayam premium");
  addItem(4, "Sayur Bayam", "kg", 7200, "Bayam standar");
  addItem(5, "Sayur Bayam", "kg", 9000, "Bayam organik"); // outlier
  addItem(6, "Sayur Bayam", "kg", 6800, "Bayam ekonomis");
  addItem(7, "Sayur Bayam", "kg", 7300, "Bayam segar harian");

  // WORTEL (7 suppliers) - Mature market
  addItem(0, "Wortel", "kg", 10000, "Wortel segar");
  addItem(1, "Wortel", "kg", 10500, "Wortel pilihan");
  addItem(2, "Wortel", "kg", 9500, "Wortel lokal");
  addItem(3, "Wortel", "kg", 11000, "Wortel premium");
  addItem(4, "Wortel", "kg", 10200, "Wortel standar");
  addItem(5, "Wortel", "kg", 13000, "Wortel organik"); // outlier
  addItem(6, "Wortel", "kg", 9800, "Wortel ekonomis");

  // MINYAK GORENG (6 suppliers) - Mature market
  addItem(0, "Minyak Goreng", "liter", 16000, "Minyak goreng sawit");
  addItem(1, "Minyak Goreng", "liter", 16500, "Minyak goreng pilihan");
  addItem(2, "Minyak Goreng", "liter", 15500, "Minyak goreng lokal");
  addItem(3, "Minyak Goreng", "liter", 17000, "Minyak goreng premium");
  addItem(4, "Minyak Goreng", "liter", 16200, "Minyak goreng standar");
  addItem(5, "Minyak Goreng", "liter", 18000, "Minyak goreng organik"); // outlier

  // KENTANG (5 suppliers) - Mature market
  addItem(0, "Kentang", "kg", 12000, "Kentang segar");
  addItem(1, "Kentang", "kg", 12500, "Kentang pilihan");
  addItem(2, "Kentang", "kg", 11500, "Kentang lokal");
  addItem(3, "Kentang", "kg", 13000, "Kentang premium");
  addItem(4, "Kentang", "kg", 15000, "Kentang import"); // outlier

  // SAYUR KANGKUNG (4 suppliers) - Cold start
  addItem(0, "Sayur Kangkung", "kg", 5000, "Kangkung segar");
  addItem(1, "Sayur Kangkung", "kg", 5500, "Kangkung pilihan");
  addItem(2, "Sayur Kangkung", "kg", 4800, "Kangkung lokal");
  addItem(3, "Sayur Kangkung", "kg", 6000, "Kangkung premium");

  // IKAN TONGKOL (3 suppliers) - Cold start
  addItem(0, "Ikan Tongkol", "kg", 28000, "Ikan tongkol segar");
  addItem(1, "Ikan Tongkol", "kg", 30000, "Ikan tongkol pilihan");
  addItem(2, "Ikan Tongkol", "kg", 35000, "Ikan tongkol premium");

  // Create all items
  const createdItems: any[] = [];
  for (const item of items) {
    const created = await prisma.supplierItem.create({ data: item });
    createdItems.push(created);
  }

  console.log("✅ Supplier items created:", createdItems.length);

  // ============================================================================
  // 5. Create Beneficiaries (6: 2 per SPPG)
  // ============================================================================

  await prisma.beneficiary.upsert({
    where: { id: "clx_beneficiary_01" },
    update: {},
    create: {
      id: "clx_beneficiary_01",
      name: "SDN 1 Sumber",
      institution: "SDN 1 Sumber",
      institutionType: "SEKOLAH",
      totalBeneficiary: 150,
      address: "Jl. Raya Sumber No. 1",
      contactPhone: "081234567101",
      sppgId: sppg1.id,
    },
  });

  await prisma.beneficiary.upsert({
    where: { id: "clx_beneficiary_02" },
    update: {},
    create: {
      id: "clx_beneficiary_02",
      name: "SDN 2 Sumber",
      institution: "SDN 2 Sumber",
      institutionType: "SEKOLAH",
      totalBeneficiary: 120,
      address: "Jl. Raya Sumber No. 45",
      contactPhone: "081234567102",
      sppgId: sppg1.id,
    },
  });

  await prisma.beneficiary.upsert({
    where: { id: "clx_beneficiary_03" },
    update: {},
    create: {
      id: "clx_beneficiary_03",
      name: "SDN 1 Weru",
      institution: "SDN 1 Weru",
      institutionType: "SEKOLAH",
      totalBeneficiary: 180,
      address: "Jl. Raya Weru No. 10",
      contactPhone: "081234567103",
      sppgId: sppg2.id,
    },
  });

  await prisma.beneficiary.upsert({
    where: { id: "clx_beneficiary_04" },
    update: {},
    create: {
      id: "clx_beneficiary_04",
      name: "SMPN 1 Weru",
      institution: "SMPN 1 Weru",
      institutionType: "SEKOLAH",
      totalBeneficiary: 200,
      address: "Jl. Raya Weru No. 25",
      contactPhone: "081234567104",
      sppgId: sppg2.id,
    },
  });

  await prisma.beneficiary.upsert({
    where: { id: "clx_beneficiary_05" },
    update: {},
    create: {
      id: "clx_beneficiary_05",
      name: "SDN 1 Arjawinangun",
      institution: "SDN 1 Arjawinangun",
      institutionType: "SEKOLAH",
      totalBeneficiary: 160,
      address: "Jl. Emplak No. 5",
      contactPhone: "081234567105",
      sppgId: sppg3.id,
    },
  });

  await prisma.beneficiary.upsert({
    where: { id: "clx_beneficiary_06" },
    update: {},
    create: {
      id: "clx_beneficiary_06",
      name: "Panti Asuhan Al-Hikmah",
      institution: "Panti Asuhan Al-Hikmah",
      institutionType: "PANTI_ASUHAN",
      totalBeneficiary: 45,
      address: "Jl. Arjawinangun No. 88",
      contactPhone: "081234567106",
      sppgId: sppg3.id,
    },
  });

  console.log("✅ Beneficiaries upserted:", 6);

  // ============================================================================
  // 6. Create MoU (2 MoU)
  // ============================================================================

  const mou1 = await prisma.mou.upsert({
    where: { id: "clx_mou_01" },
    update: {},
    create: {
      id: "clx_mou_01",
      mouNumber: "MOU-20260710-001",
      sppgId: sppg1.id,
      supplierId: suppliers[0].id,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-12-31"),
      status: "ACTIVE",
      title: "Kerjasama Penyediaan Bahan Baku Q3-Q4 2026",
      nibSnapshot: suppliers[0].nib,
      terms: {
        paymentTerms: "NET-30",
        deliverySchedule: "Setiap Senin & Kamis",
        penaltyLateDelivery: "5% per hari keterlambatan",
        penaltyDefect: "Penggantian 2x lipat",
        minOrderAmount: 500000,
        maxOrderAmount: 50000000,
        customTerms: "Denda maksimal 10% dari total order",
      },
      documentUrl: "/uploads/mou/mou-toko-berkah-2026.pdf",
      createdById: admin1.id,
      items: {
        create: [
          {
            itemId: createdItems[0].id,
            agreedPrice: 11500,
            minOrderQty: 10,
            maxOrderQty: 500,
          },
          {
            itemId: createdItems[14].id,
            agreedPrice: 34000,
            minOrderQty: 5,
            maxOrderQty: 200,
          },
        ],
      },
    },
  });

  const mou2 = await prisma.mou.upsert({
    where: { id: "clx_mou_02" },
    update: {},
    create: {
      id: "clx_mou_02",
      mouNumber: "MOU-20260710-002",
      sppgId: sppg2.id,
      supplierId: suppliers[9].id,
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-12-31"),
      status: "ACTIVE",
      title: "Kerjasama Penyediaan Bahan Baku 2026",
      nibSnapshot: suppliers[9].nib,
      terms: {
        paymentTerms: "NET-15",
        deliverySchedule: "Setiap Selasa & Jumat",
        penaltyLateDelivery: "3% per hari keterlambatan",
        penaltyDefect: "Penggantian 1.5x lipat",
        minOrderAmount: 300000,
        maxOrderAmount: 30000000,
        customTerms: null,
      },
      documentUrl: "/uploads/mou/mou-murah-jaya-2026.pdf",
      createdById: admin2.id,
      items: {
        create: [
          {
            itemId: createdItems[9].id,
            agreedPrice: 12000,
            minOrderQty: 10,
            maxOrderQty: 300,
          },
        ],
      },
    },
  });

  console.log("✅ MoU upserted:", 2);

  // ============================================================================
  // 7. Create Orders (7 orders with varied statuses)
  // ============================================================================

  const orders: any[] = [];

  // Order 1: COMPLETED - sppg1 + supplier1 via MoU
  orders[0] = await prisma.order.upsert({
    where: { id: "clx_order_01" },
    update: {
      status: "COMPLETED",
      paidAt: new Date("2026-07-14T10:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T08:00:00Z"),
    },
    create: {
      id: "clx_order_01",
      status: "COMPLETED",
      total: 455000,
      sppgId: sppg1.id,
      supplierId: suppliers[0].id,
      createdById: admin1.id,
      mouId: mou1.id,
      paidAt: new Date("2026-07-14T10:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T08:00:00Z"),
      notes: "Pesanan bahan baku mingguan via MoU",
      items: {
        create: [
          {
            itemId: createdItems[0].id,
            quantity: 20,
            unitPrice: 11500,
            subtotal: 230000,
            marketMedianAtPurchase: 12000,
            isWarningBypass: false,
            justificationNote: "Semua harga valid sesuai data pasar",
          },
          {
            itemId: createdItems[14].id,
            quantity: 5,
            unitPrice: 34000,
            subtotal: 170000,
            marketMedianAtPurchase: 35000,
            isWarningBypass: false,
            justificationNote: "Semua harga valid sesuai data pasar",
          },
        ],
      },
    },
    include: { items: true },
  });

  // Order 2: COMPLETED - sppg2 + supplier9 (WARNING bypass)
  orders[1] = await prisma.order.upsert({
    where: { id: "clx_order_02" },
    update: {
      status: "COMPLETED",
      paidAt: new Date("2026-07-14T14:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T11:00:00Z"),
    },
    create: {
      id: "clx_order_02",
      status: "COMPLETED",
      total: 200000,
      sppgId: sppg2.id,
      supplierId: suppliers[9].id,
      createdById: admin2.id,
      paidAt: new Date("2026-07-14T14:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T11:00:00Z"),
      notes: "Ayam dari supplier terdekat",
      items: {
        create: [
          {
            itemId: createdItems[26].id,
            quantity: 5,
            unitPrice: 40000,
            subtotal: 200000,
            marketMedianAtPurchase: 35000,
            isWarningBypass: true,
            justificationNote:
              "[Price Validation Justification] Stok lokal langka",
          },
        ],
      },
    },
    include: { items: true },
  });

  // Order 3: COMPLETED - sppg1 + supplier1
  orders[2] = await prisma.order.upsert({
    where: { id: "clx_order_03" },
    update: {
      status: "COMPLETED",
      paidAt: new Date("2026-07-14T16:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T14:00:00Z"),
    },
    create: {
      id: "clx_order_03",
      status: "COMPLETED",
      total: 380000,
      sppgId: sppg1.id,
      supplierId: suppliers[0].id,
      createdById: admin1.id,
      paidAt: new Date("2026-07-14T16:00:00Z"),
      actualDeliveryDate: new Date("2026-07-14T14:00:00Z"),
      notes: "Beras + Telur untuk batch",
      items: {
        create: [
          {
            itemId: createdItems[0].id,
            quantity: 20,
            unitPrice: 12000,
            subtotal: 240000,
            marketMedianAtPurchase: 12000,
            isWarningBypass: false,
            justificationNote: "Semua harga valid",
          },
          {
            itemId: createdItems[36].id,
            quantity: 5,
            unitPrice: 28000,
            subtotal: 140000,
            marketMedianAtPurchase: 28000,
            isWarningBypass: false,
            justificationNote: "Semua harga valid",
          },
        ],
      },
    },
    include: { items: true },
  });

  // Order 4: PENDING
  orders[3] = await prisma.order.upsert({
    where: { id: "clx_order_04" },
    update: {},
    create: {
      id: "clx_order_04",
      status: "PENDING",
      total: 240000,
      sppgId: sppg1.id,
      supplierId: suppliers[0].id,
      createdById: admin1.id,
      mouId: mou1.id,
      expectedDeliveryDate: new Date("2026-07-16T08:00:00Z"),
      notes: "Order beras untuk minggu depan",
      items: {
        create: [
          {
            itemId: createdItems[0].id,
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

  // Order 5: CONFIRMED
  orders[4] = await prisma.order.upsert({
    where: { id: "clx_order_05" },
    update: {},
    create: {
      id: "clx_order_05",
      status: "CONFIRMED",
      total: 350000,
      sppgId: sppg1.id,
      supplierId: suppliers[0].id,
      createdById: admin1.id,
      expectedDeliveryDate: new Date("2026-07-16T10:00:00Z"),
      notes: "Ayam untuk persediaan",
      items: {
        create: [
          {
            itemId: createdItems[14].id,
            quantity: 10,
            unitPrice: 35000,
            subtotal: 350000,
            marketMedianAtPurchase: 35000,
            isWarningBypass: false,
            justificationNote: "Harga sesuai pasar",
          },
        ],
      },
    },
    include: { items: true },
  });

  // Order 6: DELIVERED
  orders[5] = await prisma.order.upsert({
    where: { id: "clx_order_06" },
    update: {},
    create: {
      id: "clx_order_06",
      status: "DELIVERED",
      total: 247500,
      sppgId: sppg1.id,
      supplierId: suppliers[0].id,
      createdById: admin1.id,
      mouId: mou1.id,
      expectedDeliveryDate: new Date("2026-07-15T08:00:00Z"),
      actualDeliveryDate: new Date("2026-07-15T07:30:00Z"),
      deliveryEvidence: "/uploads/evidence/delivery-o6.jpg",
      notes: "Beras + Bayam untuk batch",
      items: {
        create: [
          {
            itemId: createdItems[0].id,
            quantity: 15,
            unitPrice: 11500,
            subtotal: 172500,
            marketMedianAtPurchase: 12000,
            isWarningBypass: false,
            justificationNote: "Harga sesuai MoU",
          },
          {
            itemId: createdItems[62].id,
            quantity: 10,
            unitPrice: 7500,
            subtotal: 75000,
            marketMedianAtPurchase: 7000,
            isWarningBypass: false,
            justificationNote: "Harga sesuai pasar",
          },
        ],
      },
    },
    include: { items: true },
  });

  // Order 7: CANCELLED
  orders[6] = await prisma.order.upsert({
    where: { id: "clx_order_07" },
    update: {},
    create: {
      id: "clx_order_07",
      status: "CANCELLED",
      total: 300000,
      sppgId: sppg1.id,
      supplierId: suppliers[0].id,
      createdById: admin1.id,
      expectedDeliveryDate: new Date("2026-07-14T08:00:00Z"),
      cancelledAt: new Date("2026-07-13T16:00:00Z"),
      cancelledReason: "Stok tidak mencukupi",
      cancelledById: supplierUsers[0].id,
      notes: "Order beras cadangan",
      items: {
        create: [
          {
            itemId: createdItems[0].id,
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

  console.log("✅ Orders upserted:", 7);

  // ============================================================================
  // 8. Create OrderStatusHistory
  // ============================================================================

  const orderHistoryData: any[] = [];

  // Order 1 history
  orderHistoryData.push(
    {
      orderId: orders[0].id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin1.id,
      notes: "Order dibuat",
      createdAt: new Date("2026-07-14T06:00:00Z"),
    },
    {
      orderId: orders[0].id,
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      changedById: supplierUsers[0].id,
      notes: "Konfirmasi supplier",
      createdAt: new Date("2026-07-14T06:30:00Z"),
    },
    {
      orderId: orders[0].id,
      fromStatus: "CONFIRMED",
      toStatus: "DELIVERED",
      changedById: supplierUsers[0].id,
      notes: "Pengiriman selesai",
      createdAt: new Date("2026-07-14T08:00:00Z"),
    },
    {
      orderId: orders[0].id,
      fromStatus: "DELIVERED",
      toStatus: "COMPLETED",
      changedById: admin1.id,
      notes: "Pembayaran dikonfirmasi",
      createdAt: new Date("2026-07-14T10:00:00Z"),
    },
  );

  // Order 2 history
  orderHistoryData.push(
    {
      orderId: orders[1].id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin2.id,
      notes: "Order ayam",
      createdAt: new Date("2026-07-14T09:00:00Z"),
    },
    {
      orderId: orders[1].id,
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      changedById: supplierUsers[9].id,
      notes: "Konfirmasi",
      createdAt: new Date("2026-07-14T09:30:00Z"),
    },
    {
      orderId: orders[1].id,
      fromStatus: "CONFIRMED",
      toStatus: "DELIVERED",
      changedById: supplierUsers[9].id,
      notes: "Pengiriman",
      createdAt: new Date("2026-07-14T11:00:00Z"),
    },
    {
      orderId: orders[1].id,
      fromStatus: "DELIVERED",
      toStatus: "COMPLETED",
      changedById: admin2.id,
      notes: "Pembayaran dikonfirmasi",
      createdAt: new Date("2026-07-14T14:00:00Z"),
    },
  );

  // Order 3 history
  orderHistoryData.push(
    {
      orderId: orders[2].id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin1.id,
      notes: "Order beras + telur",
      createdAt: new Date("2026-07-14T12:00:00Z"),
    },
    {
      orderId: orders[2].id,
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      changedById: supplierUsers[0].id,
      notes: "Konfirmasi",
      createdAt: new Date("2026-07-14T12:30:00Z"),
    },
    {
      orderId: orders[2].id,
      fromStatus: "CONFIRMED",
      toStatus: "DELIVERED",
      changedById: supplierUsers[0].id,
      notes: "Pengiriman",
      createdAt: new Date("2026-07-14T14:00:00Z"),
    },
    {
      orderId: orders[2].id,
      fromStatus: "DELIVERED",
      toStatus: "COMPLETED",
      changedById: admin1.id,
      notes: "Pembayaran dikonfirmasi",
      createdAt: new Date("2026-07-14T16:00:00Z"),
    },
  );

  // Order 4 history
  orderHistoryData.push({
    orderId: orders[3].id,
    fromStatus: null,
    toStatus: "PENDING",
    changedById: admin1.id,
    notes: "Order beras",
    createdAt: new Date("2026-07-15T06:00:00Z"),
  });

  // Order 5 history
  orderHistoryData.push(
    {
      orderId: orders[4].id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin1.id,
      notes: "Order ayam",
      createdAt: new Date("2026-07-15T07:00:00Z"),
    },
    {
      orderId: orders[4].id,
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      changedById: supplierUsers[0].id,
      notes: "Konfirmasi",
      createdAt: new Date("2026-07-15T08:00:00Z"),
    },
  );

  // Order 6 history
  orderHistoryData.push(
    {
      orderId: orders[5].id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin1.id,
      notes: "Order beras + bayam",
      createdAt: new Date("2026-07-14T14:00:00Z"),
    },
    {
      orderId: orders[5].id,
      fromStatus: "PENDING",
      toStatus: "CONFIRMED",
      changedById: supplierUsers[0].id,
      notes: "Konfirmasi",
      createdAt: new Date("2026-07-14T14:30:00Z"),
    },
    {
      orderId: orders[5].id,
      fromStatus: "CONFIRMED",
      toStatus: "DELIVERED",
      changedById: supplierUsers[0].id,
      notes: "Pengiriman selesai",
      createdAt: new Date("2026-07-15T07:30:00Z"),
    },
  );

  // Order 7 history
  orderHistoryData.push(
    {
      orderId: orders[6].id,
      fromStatus: null,
      toStatus: "PENDING",
      changedById: admin1.id,
      notes: "Order beras cadangan",
      createdAt: new Date("2026-07-13T10:00:00Z"),
    },
    {
      orderId: orders[6].id,
      fromStatus: "PENDING",
      toStatus: "CANCELLED",
      changedById: supplierUsers[0].id,
      notes: "Stok tidak mencukupi",
      createdAt: new Date("2026-07-13T16:00:00Z"),
    },
  );

  for (const h of orderHistoryData) {
    await prisma.orderStatusHistory.create({ data: h });
  }

  console.log("✅ OrderStatusHistory created:", orderHistoryData.length);

  // ============================================================================
  // 9. Create Batches (3 batches)
  // ============================================================================

  const batch1 = await prisma.batch.upsert({
    where: { id: "clx_batch_01" },
    update: {},
    create: {
      id: "clx_batch_01",
      batchNumber: "BATCH-20260714-001",
      reportKey: "A7X9K2M4",
      date: new Date("2026-07-14T06:00:00Z"),
      menu: "Nasi Ayam Bakar + Sayur Bayam",
      nutrition: { calories: 450, protein: 25, fat: 15, carbs: 50 },
      allergens: ["Gluten"],
      beneficiaryCount: 150,
      beneficiaryNames: ["SDN 1 Sumber", "SDN 2 Sumber"],
      costPerPortion: 0,
      totalCost: 0,
      costPerPortionStandard: 10000,
      totalBudget: 1500000,
      budgetVariance: 0,
      sppgId: sppg1.id,
      createdById: admin1.id,
      batchItems: {
        create: [
          {
            itemId: createdItems[0].id,
            name: "Beras Premium 15kg",
            unit: "kg",
            quantity: 15,
            unitPrice: 11500,
            subtotal: 172500,
            createdById: admin1.id,
          },
          {
            itemId: createdItems[14].id,
            name: "Ayam Potong 3kg",
            unit: "kg",
            quantity: 3,
            unitPrice: 34000,
            subtotal: 102000,
            createdById: admin1.id,
          },
          {
            itemId: createdItems[62].id,
            name: "Sayur Bayam 10kg",
            unit: "kg",
            quantity: 10,
            unitPrice: 7000,
            subtotal: 70000,
            createdById: admin1.id,
          },
        ],
      },
    },
  });

  const batch1WithItems = await prisma.batch.findUnique({
    where: { id: batch1.id },
    include: { batchItems: true },
  });
  if (batch1WithItems) {
    const totalCost1 = batch1WithItems.batchItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    await prisma.batch.update({
      where: { id: batch1.id },
      data: {
        totalCost: totalCost1,
        costPerPortion: totalCost1 / 150,
        budgetVariance: totalCost1 - 1500000,
      },
    });
  }

  const batch2 = await prisma.batch.upsert({
    where: { id: "clx_batch_02" },
    update: {},
    create: {
      id: "clx_batch_02",
      batchNumber: "BATCH-20260714-002",
      reportKey: "B8Y3L5N1",
      date: new Date("2026-07-14T07:00:00Z"),
      menu: "Nasi Ikan Goreng + Wortel",
      nutrition: { calories: 520, protein: 30, fat: 18, carbs: 55 },
      allergens: ["Ikan"],
      beneficiaryCount: 120,
      beneficiaryNames: ["SDN 1 Weru", "SMPN 1 Weru"],
      costPerPortion: 0,
      totalCost: 0,
      costPerPortionStandard: 10000,
      totalBudget: 1200000,
      budgetVariance: 0,
      sppgId: sppg2.id,
      createdById: admin2.id,
      batchItems: {
        create: [
          {
            itemId: createdItems[9].id,
            name: "Beras Premium 12kg",
            unit: "kg",
            quantity: 12,
            unitPrice: 12000,
            subtotal: 144000,
            createdById: admin2.id,
          },
          {
            itemId: createdItems[80].id,
            name: "Wortel 6kg",
            unit: "kg",
            quantity: 6,
            unitPrice: 10000,
            subtotal: 60000,
            createdById: admin2.id,
          },
          {
            itemId: createdItems[76].id,
            name: "Sayur Kangkung 8kg",
            unit: "kg",
            quantity: 8,
            unitPrice: 5000,
            subtotal: 40000,
            createdById: admin2.id,
          },
        ],
      },
    },
  });

  const batch2WithItems = await prisma.batch.findUnique({
    where: { id: batch2.id },
    include: { batchItems: true },
  });
  if (batch2WithItems) {
    const totalCost2 = batch2WithItems.batchItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    await prisma.batch.update({
      where: { id: batch2.id },
      data: {
        totalCost: totalCost2,
        costPerPortion: totalCost2 / 120,
        budgetVariance: totalCost2 - 1200000,
      },
    });
  }

  const batch3 = await prisma.batch.upsert({
    where: { id: "clx_batch_03" },
    update: {},
    create: {
      id: "clx_batch_03",
      batchNumber: "BATCH-20260714-003",
      reportKey: "C9Z4M6P2",
      date: new Date("2026-07-14T08:00:00Z"),
      menu: "Nasi Tahu Tempe + Telur",
      nutrition: { calories: 480, protein: 22, fat: 16, carbs: 52 },
      allergens: ["Kedelai", "Telur"],
      beneficiaryCount: 100,
      beneficiaryNames: ["SDN 1 Arjawinangun", "Panti Asuhan Al-Hikmah"],
      costPerPortion: 0,
      totalCost: 0,
      costPerPortionStandard: 10000,
      totalBudget: 1000000,
      budgetVariance: 0,
      sppgId: sppg3.id,
      createdById: admin3.id,
      batchItems: {
        create: [
          {
            itemId: createdItems[2].id,
            name: "Beras Premium 10kg",
            unit: "kg",
            quantity: 10,
            unitPrice: 11800,
            subtotal: 118000,
            createdById: admin3.id,
          },
          {
            itemId: createdItems[36].id,
            name: "Telur Ayam 5kg",
            unit: "kg",
            quantity: 5,
            unitPrice: 27000,
            subtotal: 135000,
            createdById: admin3.id,
          },
          {
            itemId: createdItems[46].id,
            name: "Tahu Putih 3kg",
            unit: "kg",
            quantity: 3,
            unitPrice: 7500,
            subtotal: 22500,
            createdById: admin3.id,
          },
        ],
      },
    },
  });

  const batch3WithItems = await prisma.batch.findUnique({
    where: { id: batch3.id },
    include: { batchItems: true },
  });
  if (batch3WithItems) {
    const totalCost3 = batch3WithItems.batchItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    await prisma.batch.update({
      where: { id: batch3.id },
      data: {
        totalCost: totalCost3,
        costPerPortion: totalCost3 / 100,
        budgetVariance: totalCost3 - 1000000,
      },
    });
  }

  console.log("✅ Batches upserted:", 3);

  // ============================================================================
  // 10. Create Complaints (2)
  // ============================================================================

  await prisma.complaint.upsert({
    where: { id: "clx_complaint_01" },
    update: {},
    create: {
      id: "clx_complaint_01",
      reportKey: "A7X9K2M4",
      description: "Nasi terasa agak basi saat diterima",
      batchId: batch1.id,
    },
  });

  await prisma.complaint.upsert({
    where: { id: "clx_complaint_02" },
    update: {},
    create: {
      id: "clx_complaint_02",
      reportKey: "B8Y3L5N1",
      description: "Ikan goreng kurang garing",
      batchId: batch2.id,
    },
  });

  console.log("✅ Complaints upserted:", 2);

  // ============================================================================
  // 11. Create Inventory Stocks (5 lots)
  // ============================================================================

  await prisma.inventoryStock.upsert({
    where: { id: "clx_inventory_01" },
    update: {},
    create: {
      id: "clx_inventory_01",
      sppgId: sppg1.id,
      itemId: createdItems[0].id,
      orderItemId: orders[0].items[0].id,
      source: "SYSTEM_ORDER",
      purchasePrice: 11500,
      initialQty: 20,
      remainingQty: 15,
      createdById: admin1.id,
      notes: "Stok dari Order 1 (Toko Berkah) - via MoU",
    },
  });

  await prisma.inventoryStock.upsert({
    where: { id: "clx_inventory_02" },
    update: {},
    create: {
      id: "clx_inventory_02",
      sppgId: sppg1.id,
      itemId: createdItems[14].id,
      orderItemId: orders[0].items[1].id,
      source: "SYSTEM_ORDER",
      purchasePrice: 34000,
      initialQty: 5,
      remainingQty: 2,
      createdById: admin1.id,
      notes: "Stok dari Order 1 (Toko Berkah) - via MoU",
    },
  });

  await prisma.inventoryStock.upsert({
    where: { id: "clx_inventory_03" },
    update: {},
    create: {
      id: "clx_inventory_03",
      sppgId: sppg1.id,
      itemId: createdItems[62].id,
      orderItemId: orders[0].items[1].id,
      source: "SYSTEM_ORDER",
      purchasePrice: 7000,
      initialQty: 10,
      remainingQty: 0,
      createdById: admin1.id,
      notes: "Stok dari Order 1 - habis dipakai Batch 1",
    },
  });

  await prisma.inventoryStock.upsert({
    where: { id: "clx_inventory_04" },
    update: {},
    create: {
      id: "clx_inventory_04",
      sppgId: sppg1.id,
      itemId: createdItems[0].id,
      orderItemId: orders[2].items[0].id,
      source: "SYSTEM_ORDER",
      purchasePrice: 12000,
      initialQty: 20,
      remainingQty: 20,
      createdById: admin1.id,
      notes: "Stok dari Order 3 (Toko Berkah)",
    },
  });

  await prisma.inventoryStock.upsert({
    where: { id: "clx_inventory_05" },
    update: {},
    create: {
      id: "clx_inventory_05",
      sppgId: sppg1.id,
      itemId: createdItems[36].id,
      orderItemId: orders[2].items[1].id,
      source: "SYSTEM_ORDER",
      purchasePrice: 28000,
      initialQty: 5,
      remainingQty: 0,
      createdById: admin1.id,
      notes: "Stok dari Order 3 - habis dipakai Batch 3",
    },
  });

  console.log("✅ Inventory stocks upserted:", 5);

  // ============================================================================
  // 12. Create Inventory Adjustment Log (1)
  // ============================================================================

  await prisma.inventoryAdjustmentLog.upsert({
    where: { id: "clx_adjustment_01" },
    update: {},
    create: {
      id: "clx_adjustment_01",
      inventoryStockId: "clx_inventory_02",
      adjustmentQty: -1,
      reason: "SPOILAGE",
      description: "Ayam rusak akibat cold chain terganggu",
      changedById: admin1.id,
      createdAt: new Date("2026-07-14T12:00:00Z"),
    },
  });

  console.log("✅ Inventory adjustment log upserted:", 1);

  // ============================================================================
  // 13. Create Operational Expenses (2)
  // ============================================================================

  await prisma.operationalExpense.upsert({
    where: { id: "clx_opex_01" },
    update: {},
    create: {
      id: "clx_opex_01",
      sppgId: sppg1.id,
      category: "TRANSPORTATION",
      amount: 150000,
      expenseDate: new Date("2026-07-14T00:00:00Z"),
      description: "Pengantaran bahan baku mingguan",
      createdById: admin1.id,
    },
  });

  await prisma.operationalExpense.upsert({
    where: { id: "clx_opex_02" },
    update: {},
    create: {
      id: "clx_opex_02",
      sppgId: sppg1.id,
      category: "FUEL",
      amount: 75000,
      expenseDate: new Date("2026-07-14T00:00:00Z"),
      description: "BBM pengantaran harian",
      createdById: admin1.id,
    },
  });

  console.log("✅ Operational expenses upserted:", 2);

  // ============================================================================
  // Summary
  // ============================================================================

  console.log("\n🎉 Seeding completed!");
  console.log("\n📊 Summary:");
  console.log("   - 3 SPPG (Cirebon Utara, Selatan, Barat)");
  console.log("   - 21 Users (3 admin + 18 supplier)");
  console.log("   - 18 Suppliers (9 market + 9 non-market)");
  console.log(`   - ${createdItems.length} Supplier Items`);
  console.log("   - 6 Beneficiaries");
  console.log("   - 2 MoU (ACTIVE)");
  console.log("   - 7 Orders (varied statuses)");
  console.log("   - 3 Batches");
  console.log("   - 2 Complaints");
  console.log("   - 5 Inventory Lots");
  console.log("   - 1 Adjustment Log");
  console.log("   - 2 Operational Expenses");
  console.log(`   - ${orderHistoryData.length} OrderStatusHistory entries`);
  console.log("\n📍 Location: Cirebon, Jawa Barat");
  console.log("\n🧪 Test Accounts:");
  console.log("   Admin:");
  console.log("     - admin-cirebon-utara@sigizi.go.id / password123");
  console.log("     - admin-cirebon-selatan@sigizi.go.id / password123");
  console.log("     - admin-cirebon-barat@sigizi.go.id / password123");
  console.log("   Suppliers:");
  console.log(
    "     - supplier-01@sigizi.go.id / password123 (Toko Berkah - Market)",
  );
  console.log(
    "     - supplier-10@sigizi.go.id / password123 (UD. Murah Jaya - Non-Market)",
  );
  console.log("     ... (supplier-01 to supplier-18)");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
