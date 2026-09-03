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
  addItem(0, "Daging Ayam", "kg", 35000, "Ayam potong segar");
  addItem(1, "Daging Ayam", "kg", 36000, "Ayam potong pilihan");
  addItem(2, "Daging Ayam", "kg", 34000, "Ayam potong segar harian");
  addItem(3, "Daging Ayam", "kg", 37000, "Ayam potong premium");
  addItem(4, "Daging Ayam", "kg", 35500, "Ayam potong lokal");
  addItem(5, "Daging Ayam", "kg", 38000, "Ayam potong super");
  addItem(6, "Daging Ayam", "kg", 33000, "Ayam potong ekonomis");
  addItem(7, "Daging Ayam", "kg", 42000, "Ayam potong organik"); // outlier
  addItem(8, "Daging Ayam", "kg", 36500, "Ayam potong standar");
  addItem(9, "Daging Ayam", "kg", 34500, "Ayam potong segar");
  addItem(10, "Daging Ayam", "kg", 37500, "Ayam potong pilihan");
  addItem(11, "Daging Ayam", "kg", 35000, "Ayam potong harian");

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

  // IKAN LELE (9 suppliers) - Mature market
  addItem(0, "Ikan Lele", "kg", 25000, "Ikan lele segar");
  addItem(1, "Ikan Lele", "kg", 27000, "Ikan lele pilihan");
  addItem(2, "Ikan Lele", "kg", 24000, "Ikan lele lokal");
  addItem(3, "Ikan Lele", "kg", 28000, "Ikan lele premium");
  addItem(4, "Ikan Lele", "kg", 26000, "Ikan lele segar harian");
  addItem(5, "Ikan Lele", "kg", 30000, "Ikan lele super");
  addItem(6, "Ikan Lele", "kg", 23000, "Ikan lele ekonomis");
  addItem(7, "Ikan Lele", "kg", 40000, "Ikan lele organik"); // outlier
  addItem(8, "Ikan Lele", "kg", 26500, "Ikan lele standar");

  // TEPUNG TERIGU (9 suppliers) - Mature market
  addItem(0, "Tepung Terigu", "kg", 10000, "Tepung terigu segar");
  addItem(1, "Tepung Terigu", "kg", 11000, "Tepung terigu pilihan");
  addItem(2, "Tepung Terigu", "kg", 9500, "Tepung terigu lokal");
  addItem(3, "Tepung Terigu", "kg", 12000, "Tepung terigu premium");
  addItem(4, "Tepung Terigu", "kg", 10500, "Tepung terigu standar");
  addItem(5, "Tepung Terigu", "kg", 13000, "Tepung terigu super");
  addItem(6, "Tepung Terigu", "kg", 9000, "Tepung terigu ekonomis");
  addItem(7, "Tepung Terigu", "kg", 18000, "Tepung terigu organik"); // outlier
  addItem(8, "Tepung Terigu", "kg", 10800, "Tepung terigu harian");

  // ============================================================================
  // TAMBAHAN ITEMS UNTUK SETIAP PASAR (Realistic Market Simulation)
  // ============================================================================

  // BERAS PREMIUM - Tambahan untuk supplier 5-8
  addItem(5, "Beras Premium", "kg", 12700, "Beras premium super grade A");
  addItem(6, "Beras Premium", "kg", 11600, "Beras premium ekonomis lokal");
  addItem(7, "Beras Premium", "kg", 13200, "Beras premium organik pilihan");
  addItem(8, "Beras Premium", "kg", 12400, "Beras premium standar kualitas");

  // AYAM POTONG - Tambahan untuk supplier 5-8
  addItem(5, "Daging Ayam", "kg", 36800, "Ayam potong super segar");
  addItem(6, "Daging Ayam", "kg", 33500, "Ayam potong ekonomis harian");
  addItem(7, "Daging Ayam", "kg", 37200, "Ayam potong premium pilihan");
  addItem(8, "Daging Ayam", "kg", 35800, "Ayam potong standar segar");

  // TELUR AYAM - Tambahan untuk supplier 5-8
  addItem(5, "Telur Ayam", "kg", 29800, "Telur ayam super pilihan");
  addItem(6, "Telur Ayam", "kg", 26500, "Telur ayam ekonomis lokal");
  addItem(7, "Telur Ayam", "kg", 30200, "Telur ayam premium segar");
  addItem(8, "Telur Ayam", "kg", 28300, "Telur ayam standar harian");

  // TAHU PUTIH - Tambahan untuk supplier 5-8
  addItem(5, "Tahu Putih", "kg", 8800, "Tahu putih premium pilihan");
  addItem(6, "Tahu Putih", "kg", 7600, "Tahu putih ekonomis lokal");
  addItem(7, "Tahu Putih", "kg", 9200, "Tahu putih organik segar");
  addItem(8, "Tahu Putih", "kg", 8100, "Tahu putih standar harian");

  // TEMPE - Tambahan untuk supplier 5-8
  addItem(5, "Tempe", "kg", 10800, "Tempe premium pilihan");
  addItem(6, "Tempe", "kg", 9600, "Tempe ekonomis lokal");
  addItem(7, "Tempe", "kg", 11500, "Tempe organik segar");
  addItem(8, "Tempe", "kg", 10100, "Tempe standar harian");

  // SAYUR BAYAM - Tambahan untuk supplier 5-8
  addItem(5, "Sayur Bayam", "kg", 7800, "Bayam premium pilihan");
  addItem(6, "Sayur Bayam", "kg", 6600, "Bayam ekonomis lokal");
  addItem(7, "Sayur Bayam", "kg", 8500, "Bayam organik segar");
  addItem(8, "Sayur Bayam", "kg", 7100, "Bayam standar harian");

  // WORTEL - Tambahan untuk supplier 5-8
  addItem(5, "Wortel", "kg", 10800, "Wortel premium pilihan");
  addItem(6, "Wortel", "kg", 9600, "Wortel ekonomis lokal");
  addItem(7, "Wortel", "kg", 11800, "Wortel organik segar");
  addItem(8, "Wortel", "kg", 10100, "Wortel standar harian");

  // MINYAK GORENG - Tambahan untuk supplier 5-8
  addItem(5, "Minyak Goreng", "liter", 16800, "Minyak goreng premium pilihan");
  addItem(6, "Minyak Goreng", "liter", 15600, "Minyak goreng ekonomis lokal");
  addItem(7, "Minyak Goreng", "liter", 17500, "Minyak goreng organik segar");
  addItem(8, "Minyak Goreng", "liter", 16100, "Minyak goreng standar harian");

  // KENTANG - Tambahan untuk supplier 5-8
  addItem(5, "Kentang", "kg", 12800, "Kentang premium pilihan");
  addItem(6, "Kentang", "kg", 11600, "Kentang ekonomis lokal");
  addItem(7, "Kentang", "kg", 13800, "Kentang organik segar");
  addItem(8, "Kentang", "kg", 12200, "Kentang standar harian");

  // DAGING SAPI - Items baru untuk semua supplier (5-8)
  addItem(0, "Daging Sapi", "kg", 120000, "Daging sapi segar pilihan");
  addItem(1, "Daging Sapi", "kg", 125000, "Daging sapi premium");
  addItem(2, "Daging Sapi", "kg", 118000, "Daging sapi lokal segar");
  addItem(3, "Daging Sapi", "kg", 130000, "Daging sapi grade A");
  addItem(4, "Daging Sapi", "kg", 122000, "Daging sapi ekonomis");
  addItem(5, "Daging Sapi", "kg", 128000, "Daging sapi super");
  addItem(6, "Daging Sapi", "kg", 115000, "Daging sapi bulk");
  addItem(7, "Daging Sapi", "kg", 135000, "Daging sapi organik");
  addItem(8, "Daging Sapi", "kg", 123000, "Daging sapi standar");

  // BAWANG MERAH - Items baru untuk semua supplier (5-8)
  addItem(0, "Bawang Merah", "kg", 28000, "Bawang merah segar pilihan");
  addItem(1, "Bawang Merah", "kg", 30000, "Bawang merah premium");
  addItem(2, "Bawang Merah", "kg", 26000, "Bawang merah lokal");
  addItem(3, "Bawang Merah", "kg", 32000, "Bawang merah grade A");
  addItem(4, "Bawang Merah", "kg", 27000, "Bawang merah ekonomis");
  addItem(5, "Bawang Merah", "kg", 31000, "Bawang merah super");
  addItem(6, "Bawang Merah", "kg", 25000, "Bawang merah bulk");
  addItem(7, "Bawang Merah", "kg", 35000, "Bawang merah organik");
  addItem(8, "Bawang Merah", "kg", 29000, "Bawang merah standar");

  // CABAI MERAH - Items baru untuk semua supplier (5-8)
  addItem(0, "Cabai Merah", "kg", 38000, "Cabai merah segar pilihan");
  addItem(1, "Cabai Merah", "kg", 40000, "Cabai merah premium");
  addItem(2, "Cabai Merah", "kg", 36000, "Cabai merah lokal");
  addItem(3, "Cabai Merah", "kg", 42000, "Cabai merah grade A");
  addItem(4, "Cabai Merah", "kg", 37000, "Cabai merah ekonomis");
  addItem(5, "Cabai Merah", "kg", 41000, "Cabai merah super");
  addItem(6, "Cabai Merah", "kg", 35000, "Cabai merah bulk");
  addItem(7, "Cabai Merah", "kg", 45000, "Cabai merah organik");
  addItem(8, "Cabai Merah", "kg", 39000, "Cabai merah standar");

  // GULA PASIR - Items baru untuk semua supplier (5-8)
  addItem(0, "Gula Pasir", "kg", 14000, "Gula pasir putih pilihan");
  addItem(1, "Gula Pasir", "kg", 14500, "Gula pasir premium");
  addItem(2, "Gula Pasir", "kg", 13500, "Gula pasir lokal");
  addItem(3, "Gula Pasir", "kg", 15000, "Gula pasir grade A");
  addItem(4, "Gula Pasir", "kg", 13800, "Gula pasir ekonomis");
  addItem(5, "Gula Pasir", "kg", 14800, "Gula pasir super");
  addItem(6, "Gula Pasir", "kg", 13200, "Gula pasir bulk");
  addItem(7, "Gula Pasir", "kg", 15500, "Gula pasir organik");
  addItem(8, "Gula Pasir", "kg", 14200, "Gula pasir standar");

  // GARAM - Items baru untuk semua supplier (5-8)
  addItem(0, "Garam", "kg", 5000, "Garam dapur pilihan");
  addItem(1, "Garam", "kg", 5500, "Garam premium");
  addItem(2, "Garam", "kg", 4800, "Garam lokal");
  addItem(3, "Garam", "kg", 6000, "Garam grade A");
  addItem(4, "Garam", "kg", 5200, "Garam ekonomis");
  addItem(5, "Garam", "kg", 5800, "Garam super");
  addItem(6, "Garam", "kg", 4600, "Garam bulk");
  addItem(7, "Garam", "kg", 6500, "Garam organik");
  addItem(8, "Garam", "kg", 5100, "Garam standar");

  // Create all items
  const createdItems: any[] = [];
  for (const item of items) {
    const created = await prisma.supplierItem.create({ data: item });
    createdItems.push(created);
  }

  console.log("✅ Supplier items created:", createdItems.length);

  // ============================================================================
  // 4B. Generate Additional Market Sellers (60 suppliers across 9 markets)
  // ============================================================================

  // --- Market Configurations ---
  interface MarketConfig {
    name: string;
    district: string;
    centerLat: number;
    centerLng: number;
    supplierCount: number;
  }

  const MARKET_CONFIGS: MarketConfig[] = [
    {
      name: "Pasar Ciledug",
      district: "SUMBER",
      centerLat: -6.702,
      centerLng: 108.554,
      supplierCount: 7,
    },
    {
      name: "Pasar Weru",
      district: "WERU",
      centerLat: -6.733,
      centerLng: 108.579,
      supplierCount: 7,
    },
    {
      name: "Pasar Arjawinangun",
      district: "ARJAWINANGUN",
      centerLat: -6.759,
      centerLng: 108.493,
      supplierCount: 7,
    },
    {
      name: "Pasar Plumbon",
      district: "PLUMBON",
      centerLat: -6.745,
      centerLng: 108.562,
      supplierCount: 7,
    },
    {
      name: "Pasar Depok",
      district: "DEPOK",
      centerLat: -6.728,
      centerLng: 108.545,
      supplierCount: 7,
    },
    {
      name: "Pasar Talun",
      district: "TALUN",
      centerLat: -6.768,
      centerLng: 108.512,
      supplierCount: 6,
    },
    {
      name: "Pasar Astanajapura",
      district: "ASTANAJAPURA",
      centerLat: -6.785,
      centerLng: 108.528,
      supplierCount: 6,
    },
    {
      name: "Pasar Plered",
      district: "PLERED",
      centerLat: -6.772,
      centerLng: 108.498,
      supplierCount: 7,
    },
    {
      name: "Pasar Kapetakan",
      district: "KAPETAKAN",
      centerLat: -6.718,
      centerLng: 108.568,
      supplierCount: 6,
    },
  ];

  // --- Item Catalog (16 types with base prices) ---
  interface ItemCatalogEntry {
    name: string;
    unit: string;
    basePrice: number;
    minOrderQty: number;
    orderStep: number;
    frequency: number; // 0-1 probability of being included per supplier
  }

  const ITEM_CATALOG: ItemCatalogEntry[] = [
    {
      name: "Beras Premium",
      unit: "kg",
      basePrice: 12000,
      minOrderQty: 5,
      orderStep: 0.5,
      frequency: 0.9,
    },
    {
      name: "Daging Ayam",
      unit: "kg",
      basePrice: 35000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.85,
    },
    {
      name: "Telur Ayam",
      unit: "kg",
      basePrice: 28000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.8,
    },
    {
      name: "Tahu Putih",
      unit: "kg",
      basePrice: 8000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.65,
    },
    {
      name: "Tempe",
      unit: "kg",
      basePrice: 10000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.65,
    },
    {
      name: "Sayur Bayam",
      unit: "kg",
      basePrice: 7000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.6,
    },
    {
      name: "Wortel",
      unit: "kg",
      basePrice: 10000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.55,
    },
    {
      name: "Minyak Goreng",
      unit: "liter",
      basePrice: 16000,
      minOrderQty: 1,
      orderStep: 1,
      frequency: 0.55,
    },
    {
      name: "Kentang",
      unit: "kg",
      basePrice: 12000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.5,
    },
    {
      name: "Sayur Kangkung",
      unit: "kg",
      basePrice: 5000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.35,
    },
    {
      name: "Ikan Tongkol",
      unit: "kg",
      basePrice: 30000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.3,
    },
    {
      name: "Ikan Lele",
      unit: "kg",
      basePrice: 26000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.5,
    },
    {
      name: "Tepung Terigu",
      unit: "kg",
      basePrice: 10500,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.5,
    },
    {
      name: "Daging Sapi",
      unit: "kg",
      basePrice: 120000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.5,
    },
    {
      name: "Bawang Merah",
      unit: "kg",
      basePrice: 28000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.5,
    },
    {
      name: "Cabai Merah",
      unit: "kg",
      basePrice: 38000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.5,
    },
    {
      name: "Gula Pasir",
      unit: "kg",
      basePrice: 14000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.5,
    },
    {
      name: "Garam",
      unit: "kg",
      basePrice: 5000,
      minOrderQty: 1,
      orderStep: 0.5,
      frequency: 0.5,
    },
  ];

  // --- Deterministic pseudo-random (seeded by supplier index) ---
  function seededRandom(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  }

  // --- Supplier name prefixes & suffixes ---
  const SUPPLIER_PREFIXES = [
    "Toko",
    "UD.",
    "CV.",
    "Kios",
    "Warung",
    "Barokah",
    "Mitra",
  ];
  const SUPPLIER_SUFFIXES = [
    "Berkah Jaya",
    "Makmur",
    "Sejahtera",
    "Pangan Indah",
    "Segar Makmur",
    "Tani Subur",
    "Raya Market",
    "Pasar Jaya",
    "Bersama",
    "Sentosa",
    "Langgeng",
    "Abadi",
    "Prima",
    "Utama",
    "Jaya",
    "Lestari",
    "Maju",
    "Pangan Sehat",
    "BasSegar",
    "Dua Saudara",
    "Putra Jaya",
    "Sumber Rejeki",
  ];

  // --- Street names per district ---
  const STREET_NAMES: Record<string, string[]> = {
    SUMBER: ["Jl. Raya Sumber", "Jl. Sumber Utama", "Jl. Pahlawan"],
    WERU: ["Jl. Raya Weru", "Jl. Weru Timur", "Jl. Pasar Weru"],
    ARJAWINANGUN: ["Jl. Emplak", "Jl. Arjawinangun Raya", "Jl. Kantor"],
    PLUMBON: ["Jl. Plumbon Raya", "Jl. Pasar Plumbon", "Jl. Cirebon-Plumbon"],
    DEPOK: ["Jl. Depok Raya", "Jl. Depok Utama", "Jl. Raya Depok"],
    TALUN: ["Jl. Talun", "Jl. Raya Talun", "Jl. Talun Barat"],
    ASTANAJAPURA: ["Jl. Astanajapura", "Jl. Raya Astana", "Jl. Pantura"],
    PLERED: ["Jl. Plered", "Jl. Raya Plered", "Jl. Plered Utara"],
    KAPETAKAN: ["Jl. Kapetakan", "Jl. Raya Kapetakan", "Jl. Pantura Kapetakan"],
  };

  // --- Generate new market suppliers and their items ---
  let globalSupplierIdx = 19; // start after existing 18 suppliers
  const newSuppliers: any[] = [];
  const newItems: typeof items = [];

  for (let mktIdx = 0; mktIdx < MARKET_CONFIGS.length; mktIdx++) {
    const mkt = MARKET_CONFIGS[mktIdx];
    const streets = STREET_NAMES[mkt.district];

    for (let sIdx = 0; sIdx < mkt.supplierCount; sIdx++) {
      const seed = mktIdx * 100 + sIdx;
      const r = seededRandom(seed);
      const prefix =
        SUPPLIER_PREFIXES[
          Math.floor(seededRandom(seed + 1) * SUPPLIER_PREFIXES.length)
        ];
      const suffix =
        SUPPLIER_SUFFIXES[
          Math.floor(seededRandom(seed + 2) * SUPPLIER_SUFFIXES.length)
        ];

      const supplierId = `clx_supplier_${String(globalSupplierIdx).padStart(2, "0")}`;
      const nib = `1000000000${String(globalSupplierIdx).padStart(4, "0")}`;
      const phone = `08123456${String(7000 + globalSupplierIdx).padStart(4, "0")}`;
      const street =
        streets[Math.floor(seededRandom(seed + 3) * streets.length)];
      const streetNum = Math.floor(seededRandom(seed + 4) * 80) + 1;
      const latOffset = (seededRandom(seed + 5) - 0.5) * 0.006; // ~300m radius
      const lngOffset = (seededRandom(seed + 6) - 0.5) * 0.006;
      const villageNum = Math.floor(seededRandom(seed + 7) * 30) + 1;

      const supplier = await prisma.supplier.upsert({
        where: { id: supplierId },
        update: {},
        create: {
          id: supplierId,
          name: `${prefix} ${suffix}`,
          nib,
          phone,
          address: `${street} No. ${streetNum}`,
          province: "JAWA_BARAT",
          regency: "CIREBON",
          district: mkt.district,
          village: `${mkt.district} ${villageNum}`,
          postalCode: `45${String(Math.floor(seededRandom(seed + 8) * 90) + 10)}`,
          latitude: mkt.centerLat + latOffset,
          longitude: mkt.centerLng + lngOffset,
          isMarketSeller: true,
          marketName: mkt.name,
        },
      });

      // Create user for this supplier
      const userEmail = `supplier-market-${mktIdx + 1}-${sIdx + 1}@sigizi.go.id`;
      await prisma.user.upsert({
        where: { email: userEmail },
        update: { supplierId: supplier.id },
        create: {
          email: userEmail,
          name: supplier.name,
          role: "SUPPLIER",
          password: DEFAULT_PASSWORD,
          supplierId: supplier.id,
        },
      });

      // Assign items to this supplier (random subset based on frequency)
      for (let itemIdx = 0; itemIdx < ITEM_CATALOG.length; itemIdx++) {
        const itemSeed = seed * 100 + itemIdx + 50;
        const itemR = seededRandom(itemSeed);
        if (itemR < ITEM_CATALOG[itemIdx].frequency) {
          const catalog = ITEM_CATALOG[itemIdx];
          // Price variation: ±20% from base, with 5% chance of outlier
          const isOutlier = seededRandom(itemSeed + 10) < 0.05;
          let priceMultiplier: number;
          if (isOutlier) {
            priceMultiplier = seededRandom(itemSeed + 11) > 0.5 ? 1.5 : 0.5;
          } else {
            priceMultiplier = 0.8 + seededRandom(itemSeed + 12) * 0.4; // 0.80 to 1.20
          }
          const finalPrice =
            Math.round((catalog.basePrice * priceMultiplier) / 100) * 100; // round to nearest 100

          const descWords = [
            `${catalog.name.split(" ")[0].toLowerCase()} segar`,
            `Kualitas ${isOutlier ? "premium" : "standar"}`,
            `Harga ${isOutlier ? "spesial" : "kompetitif"}`,
          ];

          newItems.push({
            name: catalog.name,
            unit: catalog.unit,
            basePrice: finalPrice,
            description: `${catalog.name} ${descWords[0]}, ${descWords[2]}`,
            minOrderQty: catalog.minOrderQty,
            orderStep: catalog.orderStep,
            supplierId: supplier.id,
          });
        }
      }

      newSuppliers.push(supplier);
      globalSupplierIdx++;
    }
  }

  // Create all new items
  for (const item of newItems) {
    const created = await prisma.supplierItem.create({ data: item });
    createdItems.push(created);
  }

  console.log("✅ Additional market suppliers created:", newSuppliers.length);
  console.log("✅ Additional supplier items created:", newItems.length);
  console.log(
    `📊 Total suppliers: ${18 + newSuppliers.length} | Total items: ${createdItems.length}`,
  );

  // ============================================================================
  // Summary
  // ============================================================================

  console.log("\n🎉 Seeding completed!");
  console.log("\n📊 Summary:");
  console.log("   - 3 SPPG (Cirebon Utara, Selatan, Barat)");
  console.log(
    `   - ${3 + 18 + newSuppliers.length} Users (3 admin + ${18 + newSuppliers.length} supplier)`,
  );
  console.log(
    `   - ${18 + newSuppliers.length} Suppliers (9 original market + 9 non-market + ${newSuppliers.length} new market sellers)`,
  );
  console.log(`   - ${createdItems.length} Supplier Items`);
  console.log("\n📍 Location: Cirebon, Jawa Barat");
  console.log(`\n🏪 Markets: ${MARKET_CONFIGS.length} pasar`);
  for (const mkt of MARKET_CONFIGS) {
    console.log(
      `   - ${mkt.name} (${mkt.district}): ${mkt.supplierCount} suppliers`,
    );
  }
  console.log("\n🧪 Test Accounts:");
  console.log("   Admin:");
  console.log("     - admin-cirebon-utara@sigizi.go.id / password123");
  console.log("     - admin-cirebon-selatan@sigizi.go.id / password123");
  console.log("     - admin-cirebon-barat@sigizi.go.id / password123");
  console.log("   Original Suppliers:");
  console.log(
    "     - supplier-01@sigizi.go.id / password123 (Toko Berkah - Market)",
  );
  console.log(
    "     - supplier-10@sigizi.go.id / password123 (UD. Murah Jaya - Non-Market)",
  );
  console.log("     ... (supplier-01 to supplier-18)");
  console.log("   Market Sellers:");
  console.log("     - supplier-market-1-1@sigizi.go.id / password123");
  console.log("     ... (supplier-market-{1-9}-{1-7})");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
