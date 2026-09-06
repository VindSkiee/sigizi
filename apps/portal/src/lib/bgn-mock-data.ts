// BGN Mock Data - Temporary data for development
// Will be replaced with real API calls

export type OrderStatus =
  "PENDING" | "CONFIRMED" | "DELIVERED" | "COMPLETED" | "CANCELLED";
export type RiskLevel = "Normal" | "Warning" | "Review";
export type SPPGStatus =
  "Active" | "Low Activity" | "High Cancellation" | "Requires Review";
export type AnomalyStatus = "New" | "Reviewing" | "Resolved" | "Dismissed";
export type AnomalyType =
  | "High Price Deviation"
  | "High Supplier Concentration"
  | "High Cancellation Rate"
  | "Low Procurement Activity"
  | "Unusual Regional Price"
  | "Unusual Procurement Pattern";

export interface Supplier {
  id: string;
  name: string;
  region: string;
  activeItems: number;
  sppgsServed: string[];
  orders: number;
  completed: number;
  cancelled: number;
  procurementValue: number;
  avgOrderValue: number;
}

export interface SPPG {
  id: string;
  name: string;
  region: string;
  status: SPPGStatus;
  orders: number;
  completed: number;
  cancelled: number;
  procurementValue: number;
  avgOrderValue: number;
  supplierCount: number;
  digitalCoverage: number;
}

export interface Commodity {
  id: string;
  name: string;
  category: string;
  unit: string;
  referencePrice: number;
}

export interface OrderItem {
  commodityId: string;
  commodityName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  referencePrice: number;
  marketMedianAtPurchase: number;
  isWarningBypass: boolean;
  justificationNote?: string;
}

export interface Order {
  id: string;
  date: string;
  sppgId: string;
  sppgName: string;
  supplierId: string;
  supplierName: string;
  region: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: "Paid" | "Pending" | "Failed";
  risk: RiskLevel;
  timeline: { event: string; timestamp: string; actor: string }[];
}

export interface Anomaly {
  id: string;
  type: AnomalyType;
  status: AnomalyStatus;
  priority: "High" | "Medium" | "Low";
  sppgId: string;
  sppgName: string;
  supplierId: string;
  supplierName: string;
  commodityId: string;
  commodityName: string;
  region: string;
  observedValue: number;
  referenceValue: number;
  deviation: number;
  detectedAt: string;
  orderId: string;
  signal: string;
  regionalMedian: number;
  transactionCount: number;
}

// ─── COMMODITIES ────────────────────────────────────────────────
export const commodities: Commodity[] = [
  {
    id: "c1",
    name: "Beras",
    category: "Pangan Pokok",
    unit: "kg",
    referencePrice: 14000,
  },
  {
    id: "c2",
    name: "Ayam Broiler",
    category: "Protein Hewani",
    unit: "kg",
    referencePrice: 34000,
  },
  {
    id: "c3",
    name: "Telur Ayam",
    category: "Protein Hewani",
    unit: "kg",
    referencePrice: 28000,
  },
  {
    id: "c4",
    name: "Tempe",
    category: "Protein Nabati",
    unit: "kg",
    referencePrice: 12000,
  },
  {
    id: "c5",
    name: "Tahu",
    category: "Protein Nabati",
    unit: "kg",
    referencePrice: 10000,
  },
  {
    id: "c6",
    name: "Sayuran Hijau",
    category: "Sayuran",
    unit: "kg",
    referencePrice: 8000,
  },
  {
    id: "c7",
    name: "Minyak Goreng",
    category: "Minyak & Lemak",
    unit: "liter",
    referencePrice: 18000,
  },
  {
    id: "c8",
    name: "Daging Sapi",
    category: "Protein Hewani",
    unit: "kg",
    referencePrice: 130000,
  },
];

// ─── SUPPLIERS ───────────────────────────────────────────────────
export const suppliers: Supplier[] = [
  {
    id: "s1",
    name: "CV Mitra Pangan Jaya",
    region: "Jawa Barat",
    activeItems: 12,
    sppgsServed: ["sp1", "sp2", "sp3", "sp7", "sp8"],
    orders: 284,
    completed: 251,
    cancelled: 12,
    procurementValue: 4820000000,
    avgOrderValue: 16971831,
  },
  {
    id: "s2",
    name: "PT Sumber Agro Nusantara",
    region: "Jawa Tengah",
    activeItems: 9,
    sppgsServed: ["sp2", "sp4", "sp5", "sp6", "sp9", "sp10"],
    orders: 231,
    completed: 208,
    cancelled: 9,
    procurementValue: 3640000000,
    avgOrderValue: 15757576,
  },
  {
    id: "s3",
    name: "UD Berkah Tani Mandiri",
    region: "Jawa Timur",
    activeItems: 8,
    sppgsServed: ["sp3", "sp11", "sp12"],
    orders: 187,
    completed: 162,
    cancelled: 18,
    procurementValue: 2810000000,
    avgOrderValue: 15026738,
  },
  {
    id: "s4",
    name: "CV Harapan Pangan Sejahtera",
    region: "DKI Jakarta",
    activeItems: 11,
    sppgsServed: ["sp1", "sp4", "sp13"],
    orders: 154,
    completed: 141,
    cancelled: 7,
    procurementValue: 2200000000,
    avgOrderValue: 14285714,
  },
  {
    id: "s5",
    name: "PT Agro Makmur Indonesia",
    region: "Banten",
    activeItems: 7,
    sppgsServed: ["sp5", "sp14", "sp15"],
    orders: 118,
    completed: 99,
    cancelled: 14,
    procurementValue: 1700000000,
    avgOrderValue: 14406779,
  },
  {
    id: "s6",
    name: "CV Prima Food Distribusi",
    region: "Sumatera Utara",
    activeItems: 6,
    sppgsServed: ["sp6", "sp7"],
    orders: 92,
    completed: 81,
    cancelled: 5,
    procurementValue: 1120000000,
    avgOrderValue: 12173913,
  },
  {
    id: "s7",
    name: "UD Karya Tani Lestari",
    region: "Sulawesi Selatan",
    activeItems: 5,
    sppgsServed: ["sp8", "sp9"],
    orders: 74,
    completed: 64,
    cancelled: 6,
    procurementValue: 890000000,
    avgOrderValue: 12027027,
  },
  {
    id: "s8",
    name: "PT Nusantara Food Supply",
    region: "Kalimantan Timur",
    activeItems: 4,
    sppgsServed: ["sp10"],
    orders: 58,
    completed: 48,
    cancelled: 8,
    procurementValue: 710000000,
    avgOrderValue: 12241379,
  },
  {
    id: "s9",
    name: "CV Duta Pangan Persada",
    region: "Jawa Barat",
    activeItems: 6,
    sppgsServed: ["sp11", "sp12"],
    orders: 45,
    completed: 39,
    cancelled: 4,
    procurementValue: 540000000,
    avgOrderValue: 12000000,
  },
  {
    id: "s10",
    name: "UD Sejahtera Tani Makmur",
    region: "Jawa Tengah",
    activeItems: 3,
    sppgsServed: ["sp13"],
    orders: 38,
    completed: 32,
    cancelled: 3,
    procurementValue: 420000000,
    avgOrderValue: 11052631,
  },
  {
    id: "s11",
    name: "CV Cahaya Pangan Bersama",
    region: "Jawa Timur",
    activeItems: 4,
    sppgsServed: ["sp14"],
    orders: 29,
    completed: 24,
    cancelled: 4,
    procurementValue: 310000000,
    avgOrderValue: 10689655,
  },
  {
    id: "s12",
    name: "PT Rizki Agro Sentosa",
    region: "DKI Jakarta",
    activeItems: 2,
    sppgsServed: ["sp15"],
    orders: 21,
    completed: 17,
    cancelled: 3,
    procurementValue: 220000000,
    avgOrderValue: 10476190,
  },
];

// ─── SPPGs ───────────────────────────────────────────────────────
export const sppgs: SPPG[] = [
  {
    id: "sp1",
    name: "SPPG Bandung 001",
    region: "Jawa Barat",
    status: "Active",
    orders: 142,
    completed: 128,
    cancelled: 5,
    procurementValue: 2140000000,
    avgOrderValue: 15070422,
    supplierCount: 3,
    digitalCoverage: 82,
  },
  {
    id: "sp2",
    name: "SPPG Bandung 002",
    region: "Jawa Barat",
    status: "Active",
    orders: 118,
    completed: 107,
    cancelled: 4,
    procurementValue: 1780000000,
    avgOrderValue: 15084746,
    supplierCount: 2,
    digitalCoverage: 79,
  },
  {
    id: "sp3",
    name: "SPPG Bogor 001",
    region: "Jawa Barat",
    status: "Requires Review",
    orders: 96,
    completed: 71,
    cancelled: 18,
    procurementValue: 1420000000,
    avgOrderValue: 14791667,
    supplierCount: 2,
    digitalCoverage: 64,
  },
  {
    id: "sp4",
    name: "SPPG Semarang 001",
    region: "Jawa Tengah",
    status: "Active",
    orders: 124,
    completed: 114,
    cancelled: 4,
    procurementValue: 1860000000,
    avgOrderValue: 15000000,
    supplierCount: 2,
    digitalCoverage: 85,
  },
  {
    id: "sp5",
    name: "SPPG Semarang 002",
    region: "Jawa Tengah",
    status: "Active",
    orders: 108,
    completed: 98,
    cancelled: 5,
    procurementValue: 1620000000,
    avgOrderValue: 15000000,
    supplierCount: 2,
    digitalCoverage: 81,
  },
  {
    id: "sp6",
    name: "SPPG Solo 001",
    region: "Jawa Tengah",
    status: "Low Activity",
    orders: 42,
    completed: 37,
    cancelled: 3,
    procurementValue: 620000000,
    avgOrderValue: 14761905,
    supplierCount: 2,
    digitalCoverage: 38,
  },
  {
    id: "sp7",
    name: "SPPG Surabaya 001",
    region: "Jawa Timur",
    status: "Active",
    orders: 138,
    completed: 122,
    cancelled: 7,
    procurementValue: 2070000000,
    avgOrderValue: 15000000,
    supplierCount: 2,
    digitalCoverage: 78,
  },
  {
    id: "sp8",
    name: "SPPG Malang 001",
    region: "Jawa Timur",
    status: "Active",
    orders: 91,
    completed: 83,
    cancelled: 4,
    procurementValue: 1360000000,
    avgOrderValue: 14945055,
    supplierCount: 2,
    digitalCoverage: 71,
  },
  {
    id: "sp9",
    name: "SPPG Jakarta Pusat 001",
    region: "DKI Jakarta",
    status: "Active",
    orders: 156,
    completed: 143,
    cancelled: 6,
    procurementValue: 2340000000,
    avgOrderValue: 15000000,
    supplierCount: 2,
    digitalCoverage: 91,
  },
  {
    id: "sp10",
    name: "SPPG Jakarta Selatan 001",
    region: "DKI Jakarta",
    status: "Active",
    orders: 132,
    completed: 121,
    cancelled: 5,
    procurementValue: 1980000000,
    avgOrderValue: 15000000,
    supplierCount: 2,
    digitalCoverage: 88,
  },
  {
    id: "sp11",
    name: "SPPG Tangerang 001",
    region: "Banten",
    status: "Active",
    orders: 84,
    completed: 76,
    cancelled: 4,
    procurementValue: 1260000000,
    avgOrderValue: 15000000,
    supplierCount: 2,
    digitalCoverage: 74,
  },
  {
    id: "sp12",
    name: "SPPG Serang 001",
    region: "Banten",
    status: "High Cancellation",
    orders: 67,
    completed: 44,
    cancelled: 19,
    procurementValue: 980000000,
    avgOrderValue: 14626866,
    supplierCount: 2,
    digitalCoverage: 51,
  },
  {
    id: "sp13",
    name: "SPPG Medan 001",
    region: "Sumatera Utara",
    status: "Active",
    orders: 72,
    completed: 66,
    cancelled: 3,
    procurementValue: 1080000000,
    avgOrderValue: 15000000,
    supplierCount: 2,
    digitalCoverage: 68,
  },
  {
    id: "sp14",
    name: "SPPG Makassar 001",
    region: "Sulawesi Selatan",
    status: "Low Activity",
    orders: 31,
    completed: 27,
    cancelled: 3,
    procurementValue: 460000000,
    avgOrderValue: 14838710,
    supplierCount: 2,
    digitalCoverage: 29,
  },
  {
    id: "sp15",
    name: "SPPG Balikpapan 001",
    region: "Kalimantan Timur",
    status: "Active",
    orders: 48,
    completed: 43,
    cancelled: 3,
    procurementValue: 720000000,
    avgOrderValue: 15000000,
    supplierCount: 2,
    digitalCoverage: 62,
  },
];

// ─── ORDERS ──────────────────────────────────────────────────────
export const orders: Order[] = [
  {
    id: "ORD-10291",
    date: "2025-08-14",
    sppgId: "sp1",
    sppgName: "SPPG Bandung 001",
    supplierId: "s1",
    supplierName: "CV Mitra Pangan Jaya",
    region: "Jawa Barat",
    items: [
      {
        commodityId: "c2",
        commodityName: "Ayam Broiler",
        quantity: 150,
        unit: "kg",
        unitPrice: 42000,
        subtotal: 6300000,
        referencePrice: 34000,
        marketMedianAtPurchase: 35500,
        isWarningBypass: true,
        justificationNote: "Harga pasar meningkat akibat cuaca ekstrem",
      },
      {
        commodityId: "c1",
        commodityName: "Beras",
        quantity: 200,
        unit: "kg",
        unitPrice: 14200,
        subtotal: 2840000,
        referencePrice: 14000,
        marketMedianAtPurchase: 14100,
        isWarningBypass: false,
      },
    ],
    total: 9140000,
    status: "COMPLETED",
    paymentStatus: "Paid",
    risk: "Review",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-14 08:12",
        actor: "SPPG Bandung 001",
      },
      {
        event: "Confirmed by supplier",
        timestamp: "2025-08-14 10:45",
        actor: "CV Mitra Pangan Jaya",
      },
      {
        event: "Delivered",
        timestamp: "2025-08-15 14:30",
        actor: "CV Mitra Pangan Jaya",
      },
      {
        event: "Payment confirmed",
        timestamp: "2025-08-16 09:00",
        actor: "System",
      },
      { event: "Completed", timestamp: "2025-08-16 09:01", actor: "System" },
    ],
  },
  {
    id: "ORD-10292",
    date: "2025-08-14",
    sppgId: "sp4",
    sppgName: "SPPG Semarang 001",
    supplierId: "s2",
    supplierName: "PT Sumber Agro Nusantara",
    region: "Jawa Tengah",
    items: [
      {
        commodityId: "c1",
        commodityName: "Beras",
        quantity: 300,
        unit: "kg",
        unitPrice: 14100,
        subtotal: 4230000,
        referencePrice: 14000,
        marketMedianAtPurchase: 14050,
        isWarningBypass: false,
      },
      {
        commodityId: "c3",
        commodityName: "Telur Ayam",
        quantity: 100,
        unit: "kg",
        unitPrice: 28500,
        subtotal: 2850000,
        referencePrice: 28000,
        marketMedianAtPurchase: 28200,
        isWarningBypass: false,
      },
    ],
    total: 7080000,
    status: "COMPLETED",
    paymentStatus: "Paid",
    risk: "Normal",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-14 09:00",
        actor: "SPPG Semarang 001",
      },
      {
        event: "Confirmed by supplier",
        timestamp: "2025-08-14 11:30",
        actor: "PT Sumber Agro Nusantara",
      },
      {
        event: "Delivered",
        timestamp: "2025-08-15 10:00",
        actor: "PT Sumber Agro Nusantara",
      },
      { event: "Completed", timestamp: "2025-08-16 08:00", actor: "System" },
    ],
  },
  {
    id: "ORD-10293",
    date: "2025-08-15",
    sppgId: "sp3",
    sppgName: "SPPG Bogor 001",
    supplierId: "s3",
    supplierName: "UD Berkah Tani Mandiri",
    region: "Jawa Barat",
    items: [
      {
        commodityId: "c8",
        commodityName: "Daging Sapi",
        quantity: 50,
        unit: "kg",
        unitPrice: 158000,
        subtotal: 7900000,
        referencePrice: 130000,
        marketMedianAtPurchase: 138000,
        isWarningBypass: false,
      },
    ],
    total: 7900000,
    status: "DELIVERED",
    paymentStatus: "Pending",
    risk: "Review",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-15 07:30",
        actor: "SPPG Bogor 001",
      },
      {
        event: "Confirmed by supplier",
        timestamp: "2025-08-15 09:15",
        actor: "UD Berkah Tani Mandiri",
      },
      {
        event: "Delivered",
        timestamp: "2025-08-16 13:00",
        actor: "UD Berkah Tani Mandiri",
      },
    ],
  },
  {
    id: "ORD-10294",
    date: "2025-08-15",
    sppgId: "sp9",
    sppgName: "SPPG Jakarta Pusat 001",
    supplierId: "s4",
    supplierName: "CV Harapan Pangan Sejahtera",
    region: "DKI Jakarta",
    items: [
      {
        commodityId: "c1",
        commodityName: "Beras",
        quantity: 400,
        unit: "kg",
        unitPrice: 14000,
        subtotal: 5600000,
        referencePrice: 14000,
        marketMedianAtPurchase: 14000,
        isWarningBypass: false,
      },
      {
        commodityId: "c4",
        commodityName: "Tempe",
        quantity: 200,
        unit: "kg",
        unitPrice: 12000,
        subtotal: 2400000,
        referencePrice: 12000,
        marketMedianAtPurchase: 12000,
        isWarningBypass: false,
      },
      {
        commodityId: "c5",
        commodityName: "Tahu",
        quantity: 150,
        unit: "kg",
        unitPrice: 10000,
        subtotal: 1500000,
        referencePrice: 10000,
        marketMedianAtPurchase: 10000,
        isWarningBypass: false,
      },
    ],
    total: 9500000,
    status: "COMPLETED",
    paymentStatus: "Paid",
    risk: "Normal",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-15 08:00",
        actor: "SPPG Jakarta Pusat 001",
      },
      {
        event: "Confirmed by supplier",
        timestamp: "2025-08-15 10:00",
        actor: "CV Harapan Pangan Sejahtera",
      },
      {
        event: "Delivered",
        timestamp: "2025-08-16 11:00",
        actor: "CV Harapan Pangan Sejahtera",
      },
      { event: "Completed", timestamp: "2025-08-17 09:00", actor: "System" },
    ],
  },
  {
    id: "ORD-10295",
    date: "2025-08-16",
    sppgId: "sp12",
    sppgName: "SPPG Serang 001",
    supplierId: "s5",
    supplierName: "PT Agro Makmur Indonesia",
    region: "Banten",
    items: [
      {
        commodityId: "c2",
        commodityName: "Ayam Broiler",
        quantity: 80,
        unit: "kg",
        unitPrice: 35000,
        subtotal: 2800000,
        referencePrice: 34000,
        marketMedianAtPurchase: 34500,
        isWarningBypass: false,
      },
    ],
    total: 2800000,
    status: "CANCELLED",
    paymentStatus: "Failed",
    risk: "Warning",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-16 08:45",
        actor: "SPPG Serang 001",
      },
      {
        event: "Cancelled",
        timestamp: "2025-08-16 14:00",
        actor: "SPPG Serang 001",
      },
    ],
  },
  {
    id: "ORD-10296",
    date: "2025-08-16",
    sppgId: "sp7",
    sppgName: "SPPG Surabaya 001",
    supplierId: "s1",
    supplierName: "CV Mitra Pangan Jaya",
    region: "Jawa Timur",
    items: [
      {
        commodityId: "c1",
        commodityName: "Beras",
        quantity: 250,
        unit: "kg",
        unitPrice: 14050,
        subtotal: 3512500,
        referencePrice: 14000,
        marketMedianAtPurchase: 14020,
        isWarningBypass: false,
      },
      {
        commodityId: "c6",
        commodityName: "Sayuran Hijau",
        quantity: 100,
        unit: "kg",
        unitPrice: 8200,
        subtotal: 820000,
        referencePrice: 8000,
        marketMedianAtPurchase: 8100,
        isWarningBypass: false,
      },
    ],
    total: 4332500,
    status: "CONFIRMED",
    paymentStatus: "Pending",
    risk: "Normal",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-16 09:00",
        actor: "SPPG Surabaya 001",
      },
      {
        event: "Confirmed by supplier",
        timestamp: "2025-08-16 11:30",
        actor: "CV Mitra Pangan Jaya",
      },
    ],
  },
  {
    id: "ORD-10297",
    date: "2025-08-17",
    sppgId: "sp6",
    sppgName: "SPPG Solo 001",
    supplierId: "s6",
    supplierName: "CV Prima Food Distribusi",
    region: "Jawa Tengah",
    items: [
      {
        commodityId: "c7",
        commodityName: "Minyak Goreng",
        quantity: 100,
        unit: "liter",
        unitPrice: 18500,
        subtotal: 1850000,
        referencePrice: 18000,
        marketMedianAtPurchase: 18200,
        isWarningBypass: false,
      },
    ],
    total: 1850000,
    status: "PENDING",
    paymentStatus: "Pending",
    risk: "Normal",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-17 10:00",
        actor: "SPPG Solo 001",
      },
    ],
  },
  {
    id: "ORD-10298",
    date: "2025-08-17",
    sppgId: "sp13",
    sppgName: "SPPG Medan 001",
    supplierId: "s4",
    supplierName: "CV Harapan Pangan Sejahtera",
    region: "Sumatera Utara",
    items: [
      {
        commodityId: "c1",
        commodityName: "Beras",
        quantity: 180,
        unit: "kg",
        unitPrice: 18200,
        subtotal: 3276000,
        referencePrice: 14000,
        marketMedianAtPurchase: 14800,
        isWarningBypass: false,
      },
    ],
    total: 3276000,
    status: "COMPLETED",
    paymentStatus: "Paid",
    risk: "Review",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-17 08:00",
        actor: "SPPG Medan 001",
      },
      {
        event: "Confirmed by supplier",
        timestamp: "2025-08-17 10:00",
        actor: "CV Harapan Pangan Sejahtera",
      },
      {
        event: "Delivered",
        timestamp: "2025-08-18 12:00",
        actor: "CV Harapan Pangan Sejahtera",
      },
      { event: "Completed", timestamp: "2025-08-19 09:00", actor: "System" },
    ],
  },
  {
    id: "ORD-10299",
    date: "2025-08-18",
    sppgId: "sp2",
    sppgName: "SPPG Bandung 002",
    supplierId: "s2",
    supplierName: "PT Sumber Agro Nusantara",
    region: "Jawa Barat",
    items: [
      {
        commodityId: "c3",
        commodityName: "Telur Ayam",
        quantity: 150,
        unit: "kg",
        unitPrice: 27800,
        subtotal: 4170000,
        referencePrice: 28000,
        marketMedianAtPurchase: 27900,
        isWarningBypass: false,
      },
      {
        commodityId: "c4",
        commodityName: "Tempe",
        quantity: 120,
        unit: "kg",
        unitPrice: 11800,
        subtotal: 1416000,
        referencePrice: 12000,
        marketMedianAtPurchase: 11900,
        isWarningBypass: false,
      },
    ],
    total: 5586000,
    status: "COMPLETED",
    paymentStatus: "Paid",
    risk: "Normal",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-18 08:30",
        actor: "SPPG Bandung 002",
      },
      {
        event: "Confirmed by supplier",
        timestamp: "2025-08-18 10:00",
        actor: "PT Sumber Agro Nusantara",
      },
      {
        event: "Delivered",
        timestamp: "2025-08-19 11:00",
        actor: "PT Sumber Agro Nusantara",
      },
      { event: "Completed", timestamp: "2025-08-20 09:00", actor: "System" },
    ],
  },
  {
    id: "ORD-10300",
    date: "2025-08-18",
    sppgId: "sp14",
    sppgName: "SPPG Makassar 001",
    supplierId: "s7",
    supplierName: "UD Karya Tani Lestari",
    region: "Sulawesi Selatan",
    items: [
      {
        commodityId: "c2",
        commodityName: "Ayam Broiler",
        quantity: 60,
        unit: "kg",
        unitPrice: 38000,
        subtotal: 2280000,
        referencePrice: 34000,
        marketMedianAtPurchase: 35000,
        isWarningBypass: false,
      },
    ],
    total: 2280000,
    status: "DELIVERED",
    paymentStatus: "Pending",
    risk: "Warning",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-18 09:00",
        actor: "SPPG Makassar 001",
      },
      {
        event: "Confirmed by supplier",
        timestamp: "2025-08-18 11:00",
        actor: "UD Karya Tani Lestari",
      },
      {
        event: "Delivered",
        timestamp: "2025-08-19 14:00",
        actor: "UD Karya Tani Lestari",
      },
    ],
  },
  {
    id: "ORD-10301",
    date: "2025-08-19",
    sppgId: "sp10",
    sppgName: "SPPG Jakarta Selatan 001",
    supplierId: "s8",
    supplierName: "PT Nusantara Food Supply",
    region: "DKI Jakarta",
    items: [
      {
        commodityId: "c1",
        commodityName: "Beras",
        quantity: 350,
        unit: "kg",
        unitPrice: 14100,
        subtotal: 4935000,
        referencePrice: 14000,
        marketMedianAtPurchase: 14050,
        isWarningBypass: false,
      },
      {
        commodityId: "c7",
        commodityName: "Minyak Goreng",
        quantity: 80,
        unit: "liter",
        unitPrice: 18200,
        subtotal: 1456000,
        referencePrice: 18000,
        marketMedianAtPurchase: 18100,
        isWarningBypass: false,
      },
    ],
    total: 6391000,
    status: "COMPLETED",
    paymentStatus: "Paid",
    risk: "Normal",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-19 08:00",
        actor: "SPPG Jakarta Selatan 001",
      },
      {
        event: "Confirmed by supplier",
        timestamp: "2025-08-19 10:00",
        actor: "PT Nusantara Food Supply",
      },
      {
        event: "Delivered",
        timestamp: "2025-08-20 12:00",
        actor: "PT Nusantara Food Supply",
      },
      { event: "Completed", timestamp: "2025-08-21 09:00", actor: "System" },
    ],
  },
  {
    id: "ORD-10302",
    date: "2025-08-19",
    sppgId: "sp11",
    sppgName: "SPPG Tangerang 001",
    supplierId: "s5",
    supplierName: "PT Agro Makmur Indonesia",
    region: "Banten",
    items: [
      {
        commodityId: "c5",
        commodityName: "Tahu",
        quantity: 200,
        unit: "kg",
        unitPrice: 10200,
        subtotal: 2040000,
        referencePrice: 10000,
        marketMedianAtPurchase: 10100,
        isWarningBypass: false,
      },
      {
        commodityId: "c6",
        commodityName: "Sayuran Hijau",
        quantity: 150,
        unit: "kg",
        unitPrice: 8100,
        subtotal: 1215000,
        referencePrice: 8000,
        marketMedianAtPurchase: 8050,
        isWarningBypass: false,
      },
    ],
    total: 3255000,
    status: "CONFIRMED",
    paymentStatus: "Pending",
    risk: "Normal",
    timeline: [
      {
        event: "Order created",
        timestamp: "2025-08-19 09:00",
        actor: "SPPG Tangerang 001",
      },
      {
        event: "Confirmed by supplier",
        timestamp: "2025-08-19 11:30",
        actor: "PT Agro Makmur Indonesia",
      },
    ],
  },
];

// ─── ANOMALIES ───────────────────────────────────────────────────
export const anomalies: Anomaly[] = [
  {
    id: "a1",
    type: "High Price Deviation",
    status: "New",
    priority: "High",
    sppgId: "sp1",
    sppgName: "SPPG Bandung 001",
    supplierId: "s1",
    supplierName: "CV Mitra Pangan Jaya",
    commodityId: "c2",
    commodityName: "Ayam Broiler",
    region: "Jawa Barat",
    observedValue: 42000,
    referenceValue: 34000,
    deviation: 23.5,
    detectedAt: "2025-08-14",
    orderId: "ORD-10291",
    signal: "Harga transaksi 23.5% di atas harga referensi komoditas saat ini.",
    regionalMedian: 35500,
    transactionCount: 18,
  },
  {
    id: "a2",
    type: "Unusual Regional Price",
    status: "New",
    priority: "High",
    sppgId: "sp13",
    sppgName: "SPPG Medan 001",
    supplierId: "s4",
    supplierName: "CV Harapan Pangan Sejahtera",
    commodityId: "c1",
    commodityName: "Beras",
    region: "Sumatera Utara",
    observedValue: 18200,
    referenceValue: 14000,
    deviation: 30.0,
    detectedAt: "2025-08-17",
    orderId: "ORD-10298",
    signal:
      "Harga beras di Sumatera Utara 30% di atas harga referensi nasional dan jauh lebih tinggi dari median regional.",
    regionalMedian: 14800,
    transactionCount: 7,
  },
  {
    id: "a3",
    type: "High Cancellation Rate",
    status: "Reviewing",
    priority: "Medium",
    sppgId: "sp12",
    sppgName: "SPPG Serang 001",
    supplierId: "s5",
    supplierName: "PT Agro Makmur Indonesia",
    commodityId: "c2",
    commodityName: "Ayam Broiler",
    region: "Banten",
    observedValue: 28.4,
    referenceValue: 5,
    deviation: 468,
    detectedAt: "2025-08-16",
    orderId: "ORD-10295",
    signal:
      "Tingkat pembatalan SPPG Serang 001 sebesar 28.4% jauh melampaui rata-rata ekosistem 5%.",
    regionalMedian: 6.2,
    transactionCount: 67,
  },
  {
    id: "a4",
    type: "High Price Deviation",
    status: "New",
    priority: "High",
    sppgId: "sp3",
    sppgName: "SPPG Bogor 001",
    supplierId: "s3",
    supplierName: "UD Berkah Tani Mandiri",
    commodityId: "c8",
    commodityName: "Daging Sapi",
    region: "Jawa Barat",
    observedValue: 158000,
    referenceValue: 130000,
    deviation: 21.5,
    detectedAt: "2025-08-15",
    orderId: "ORD-10293",
    signal: "Harga daging sapi 21.5% di atas harga referensi komoditas.",
    regionalMedian: 138000,
    transactionCount: 12,
  },
  {
    id: "a5",
    type: "High Supplier Concentration",
    status: "New",
    priority: "Medium",
    sppgId: "sp3",
    sppgName: "SPPG Bogor 001",
    supplierId: "s3",
    supplierName: "UD Berkah Tani Mandiri",
    commodityId: "c8",
    commodityName: "Daging Sapi",
    region: "Jawa Barat",
    observedValue: 94,
    referenceValue: 50,
    deviation: 88,
    detectedAt: "2025-08-10",
    orderId: "ORD-10293",
    signal:
      "94% nilai pengadaan SPPG Bogor 001 terkonsentrasi pada satu supplier, meningkatkan risiko ketergantungan.",
    regionalMedian: 45,
    transactionCount: 96,
  },
  {
    id: "a6",
    type: "Low Procurement Activity",
    status: "Resolved",
    priority: "Low",
    sppgId: "sp14",
    sppgName: "SPPG Makassar 001",
    supplierId: "s7",
    supplierName: "UD Karya Tani Lestari",
    commodityId: "c2",
    commodityName: "Ayam Broiler",
    region: "Sulawesi Selatan",
    observedValue: 29,
    referenceValue: 65,
    deviation: -55.4,
    detectedAt: "2025-08-01",
    orderId: "ORD-10300",
    signal:
      "Digital procurement coverage SPPG Makassar 001 hanya 29%, jauh di bawah rata-rata ekosistem 65%.",
    regionalMedian: 62,
    transactionCount: 31,
  },
];

// ─── TREND DATA ──────────────────────────────────────────────────
export const procurementTrend = [
  { month: "Mar", transactions: 1820, value: 27.3 },
  { month: "Apr", transactions: 2140, value: 32.1 },
  { month: "Mei", transactions: 2380, value: 35.7 },
  { month: "Jun", transactions: 2890, value: 43.4 },
  { month: "Jul", transactions: 3120, value: 46.8 },
  { month: "Ags", transactions: 3482, value: 52.1 },
];

// ─── REGIONAL DATA ───────────────────────────────────────────────
export const regionalData = [
  {
    region: "Jawa Barat",
    transactions: 3842,
    value: 4800000000,
    growth: 12.1,
    sppgCount: 4,
    supplierCount: 3,
  },
  {
    region: "Jawa Tengah",
    transactions: 2914,
    value: 3640000000,
    growth: 8.4,
    sppgCount: 3,
    supplierCount: 2,
  },
  {
    region: "Jawa Timur",
    transactions: 2301,
    value: 3100000000,
    growth: 6.2,
    sppgCount: 2,
    supplierCount: 2,
  },
  {
    region: "DKI Jakarta",
    transactions: 1882,
    value: 2200000000,
    growth: 5.8,
    sppgCount: 2,
    supplierCount: 2,
  },
  {
    region: "Banten",
    transactions: 1124,
    value: 1700000000,
    growth: 3.1,
    sppgCount: 2,
    supplierCount: 1,
  },
  {
    region: "Sumatera Utara",
    transactions: 624,
    value: 1080000000,
    growth: 2.4,
    sppgCount: 1,
    supplierCount: 1,
  },
  {
    region: "Sulawesi Selatan",
    transactions: 412,
    value: 620000000,
    growth: 1.8,
    sppgCount: 1,
    supplierCount: 1,
  },
  {
    region: "Kalimantan Timur",
    transactions: 383,
    value: 540000000,
    growth: 1.2,
    sppgCount: 1,
    supplierCount: 1,
  },
];

// ─── COMMODITY PRICE DATA ─────────────────────────────────────────
export const commodityPriceData: Record<
  string,
  {
    regionalComparison: { region: string; avgPrice: number; txCount: number }[];
    historicalPrices: { month: string; price: number }[];
    distribution: { label: string; pct: number; color: string }[];
  }
> = {
  c1: {
    regionalComparison: [
      { region: "Jawa Barat", avgPrice: 14200, txCount: 482 },
      { region: "Jawa Tengah", avgPrice: 14100, txCount: 364 },
      { region: "Jawa Timur", avgPrice: 14500, txCount: 298 },
      { region: "DKI Jakarta", avgPrice: 14050, txCount: 241 },
      { region: "Banten", avgPrice: 14300, txCount: 142 },
      { region: "Sumatera Utara", avgPrice: 18200, txCount: 87 },
      { region: "Sulawesi Selatan", avgPrice: 15100, txCount: 54 },
      { region: "Kalimantan Timur", avgPrice: 15800, txCount: 48 },
    ],
    historicalPrices: [
      { month: "Mar", price: 13800 },
      { month: "Apr", price: 13900 },
      { month: "Mei", price: 14000 },
      { month: "Jun", price: 14050 },
      { month: "Jul", price: 14100 },
      { month: "Ags", price: 14280 },
    ],
    distribution: [
      { label: "Di Bawah Referensi", pct: 18, color: "#16A34A" },
      { label: "Dekat Referensi", pct: 62, color: "#2563EB" },
      { label: "Di Atas Referensi", pct: 16, color: "#D97706" },
      { label: "Deviasi Tinggi", pct: 4, color: "#DC2626" },
    ],
  },
  c2: {
    regionalComparison: [
      { region: "Jawa Barat", avgPrice: 36200, txCount: 312 },
      { region: "Jawa Tengah", avgPrice: 34800, txCount: 248 },
      { region: "Jawa Timur", avgPrice: 35200, txCount: 198 },
      { region: "DKI Jakarta", avgPrice: 34500, txCount: 182 },
      { region: "Banten", avgPrice: 35800, txCount: 98 },
      { region: "Sumatera Utara", avgPrice: 37100, txCount: 62 },
      { region: "Sulawesi Selatan", avgPrice: 38000, txCount: 44 },
      { region: "Kalimantan Timur", avgPrice: 36800, txCount: 38 },
    ],
    historicalPrices: [
      { month: "Mar", price: 33000 },
      { month: "Apr", price: 33500 },
      { month: "Mei", price: 34000 },
      { month: "Jun", price: 34200 },
      { month: "Jul", price: 35000 },
      { month: "Ags", price: 35800 },
    ],
    distribution: [
      { label: "Di Bawah Referensi", pct: 12, color: "#16A34A" },
      { label: "Dekat Referensi", pct: 58, color: "#2563EB" },
      { label: "Di Atas Referensi", pct: 22, color: "#D97706" },
      { label: "Deviasi Tinggi", pct: 8, color: "#DC2626" },
    ],
  },
  c3: {
    regionalComparison: [
      { region: "Jawa Barat", avgPrice: 27900, txCount: 218 },
      { region: "Jawa Tengah", avgPrice: 28100, txCount: 174 },
      { region: "Jawa Timur", avgPrice: 28400, txCount: 142 },
      { region: "DKI Jakarta", avgPrice: 27800, txCount: 128 },
      { region: "Banten", avgPrice: 28200, txCount: 72 },
      { region: "Sumatera Utara", avgPrice: 29100, txCount: 48 },
      { region: "Sulawesi Selatan", avgPrice: 29800, txCount: 32 },
      { region: "Kalimantan Timur", avgPrice: 30200, txCount: 28 },
    ],
    historicalPrices: [
      { month: "Mar", price: 27200 },
      { month: "Apr", price: 27500 },
      { month: "Mei", price: 28000 },
      { month: "Jun", price: 28100 },
      { month: "Jul", price: 28200 },
      { month: "Ags", price: 28350 },
    ],
    distribution: [
      { label: "Di Bawah Referensi", pct: 22, color: "#16A34A" },
      { label: "Dekat Referensi", pct: 64, color: "#2563EB" },
      { label: "Di Atas Referensi", pct: 11, color: "#D97706" },
      { label: "Deviasi Tinggi", pct: 3, color: "#DC2626" },
    ],
  },
  c8: {
    regionalComparison: [
      { region: "Jawa Barat", avgPrice: 138000, txCount: 124 },
      { region: "Jawa Tengah", avgPrice: 132000, txCount: 98 },
      { region: "Jawa Timur", avgPrice: 134000, txCount: 82 },
      { region: "DKI Jakarta", avgPrice: 131000, txCount: 76 },
      { region: "Banten", avgPrice: 135000, txCount: 42 },
      { region: "Sumatera Utara", avgPrice: 148000, txCount: 28 },
      { region: "Sulawesi Selatan", avgPrice: 142000, txCount: 18 },
      { region: "Kalimantan Timur", avgPrice: 145000, txCount: 14 },
    ],
    historicalPrices: [
      { month: "Mar", price: 128000 },
      { month: "Apr", price: 129000 },
      { month: "Mei", price: 130000 },
      { month: "Jun", price: 132000 },
      { month: "Jul", price: 134000 },
      { month: "Ags", price: 136000 },
    ],
    distribution: [
      { label: "Di Bawah Referensi", pct: 14, color: "#16A34A" },
      { label: "Dekat Referensi", pct: 54, color: "#2563EB" },
      { label: "Di Atas Referensi", pct: 24, color: "#D97706" },
      { label: "Deviasi Tinggi", pct: 8, color: "#DC2626" },
    ],
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────
export function formatRupiah(value: number, short = false): string {
  if (short) {
    if (value >= 1_000_000_000)
      return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}jt`;
    if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
    return `Rp ${value}`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("id-ID");
}

export function deviationColor(pct: number): string {
  if (pct <= -5) return "#16A34A";
  if (Math.abs(pct) < 10) return "#2563EB";
  if (pct < 20) return "#D97706";
  return "#DC2626";
}

export function deviationBg(pct: number): string {
  if (pct <= -5) return "#F0FDF4";
  if (Math.abs(pct) < 10) return "#EFF6FF";
  if (pct < 20) return "#FFFBEB";
  return "#FEF2F2";
}
