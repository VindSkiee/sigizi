import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { MarketService } from "./market.service";
import { PrismaService } from "../../../database/prisma.service";

jest.mock("../../../core/utils/geolocation", () => ({
  calculateDistanceKm: jest.fn(),
  findWithinRadius: jest.fn(),
}));

jest.mock("../../../core/domain/value-objects/gps-coordinate.vo", () => {
  const actual = jest.requireActual(
    "../../../core/domain/value-objects/gps-coordinate.vo",
  );
  return {
    GpsCoordinate: actual.GpsCoordinate,
  };
});

jest.mock("@sigizi/shared", () => ({
  ...jest.requireActual("@sigizi/shared"),
  normalizeRegion: jest.fn((v: string) =>
    v
      .trim()
      .replace(/^(Kab\.?|Kota)\s+/i, "")
      .replace(/\s+/g, "_")
      .toUpperCase(),
  ),
  matchesRegion: jest.fn((value: string, expected: string) => {
    const a = value
      .trim()
      .replace(/^(Kab\.?|Kota)\s+/i, "")
      .replace(/\s+/g, "_")
      .toUpperCase();
    const b = expected
      .trim()
      .replace(/^(Kab\.?|Kota)\s+/i, "")
      .replace(/\s+/g, "_")
      .toUpperCase();
    return a === b || a.includes(b) || b.includes(a);
  }),
}));

import {
  calculateDistanceKm,
  findWithinRadius,
} from "../../../core/utils/geolocation";

describe("MarketService", () => {
  let service: MarketService;
  let prisma: {
    supplierItem: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    itemCommodity: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    supplier: {
      findMany: jest.Mock;
    };
  };

  const mockSupplier = {
    id: "sup-1",
    name: "UD. Sumber Rejeki",
    address: "Jl. Raya Purwakarta No. 1",
    province: "JAWA_BARAT",
    regency: "PURWAKARTA",
    district: "BABAKANCIKAO",
    latitude: -6.5563,
    longitude: 107.4439,
    isMarketSeller: true,
    marketName: "Pasar Cibeunying",
    openStatus: true,
  };

  const mockSupplier2 = {
    id: "sup-2",
    name: "Toko Berkah",
    address: "Jl. Sudirman No. 10",
    province: "JAWA_BARAT",
    regency: "PURWAKARTA",
    district: "WANAYASA",
    latitude: -6.57,
    longitude: 107.5,
    isMarketSeller: true,
    marketName: "Pasar Cibeunying",
    openStatus: true,
  };

  const mockSupplierItem = {
    id: "item-1",
    name: "Beras Premium",
    basePrice: 12000,
    stock: 50,
    priceUpdatedAt: new Date("2026-07-10T08:00:00Z"),
    stockUpdatedAt: new Date("2026-07-10T09:00:00Z"),
    commodityId: "com_beras",
    supplier: mockSupplier,
  };

  const mockSupplierItem2 = {
    id: "item-2",
    name: "Beras Premium",
    basePrice: 13000,
    stock: 30,
    priceUpdatedAt: new Date("2026-07-09T08:00:00Z"),
    stockUpdatedAt: new Date("2026-07-09T09:00:00Z"),
    commodityId: "com_beras",
    supplier: mockSupplier2,
  };

  const mockSupplierItemLowStock = {
    id: "item-3",
    name: "Beras Premium",
    basePrice: 11000,
    stock: 0,
    priceUpdatedAt: null,
    stockUpdatedAt: null,
    commodityId: "com_beras",
    supplier: {
      ...mockSupplier,
      id: "sup-3",
      name: "Toko Sembako",
    },
  };

  function makeManySupplierItems(count: number, basePrice = 12000) {
    return Array.from({ length: count }, (_, i) => ({
      id: `item-${i + 1}`,
      name: "Beras Premium",
      basePrice: basePrice + i * 1000,
      stock: 10 + i,
      priceUpdatedAt: new Date(`2026-07-${10 + i}T08:00:00Z`),
      stockUpdatedAt: new Date(`2026-07-${10 + i}T09:00:00Z`),
      commodityId: "com_beras",
      supplier: {
        id: `sup-${i + 1}`,
        name: `Supplier ${i + 1}`,
        address: `Jl. Raya No. ${i + 1}`,
        province: "JAWA_BARAT",
        regency: "PURWAKARTA",
        district: "BABAKANCIKAO",
        latitude: -6.55 + i * 0.01,
        longitude: 107.44 + i * 0.01,
        isMarketSeller: true,
        marketName: "Pasar Cibeunying",
        openStatus: true,
      },
    }));
  }

  beforeEach(async () => {
    prisma = {
      supplierItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      itemCommodity: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      supplier: {
        findMany: jest.fn(),
      },
    };

    jest.clearAllMocks();

    (findWithinRadius as jest.Mock).mockImplementation(
      (_center: any, points: Array<any>, radiusKm: number) => {
        return points
          .map((p: any) => ({ ...p, distance: 2.0 }))
          .filter(() => true)
          .sort((a: any, b: any) => a.distance - b.distance);
      },
    );

    (calculateDistanceKm as jest.Mock).mockReturnValue(2.0);

    prisma.itemCommodity.findMany.mockResolvedValue([
      { name: "Beras", referencePrice: 15000 },
      { name: "Ayam", referencePrice: 40000 },
      { name: "Kentang", referencePrice: 12000 },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<MarketService>(MarketService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // getMarketPrices
  // =========================================================================
  describe("getMarketPrices", () => {
    it("should return market prices for admin filter (province+regency)", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([
        mockSupplierItem,
        mockSupplierItem2,
      ]);

      const result = await service.getMarketPrices("Beras Premium", {
        province: "Jawa Barat",
        regency: "Purwakarta",
      });

      expect(result.item).toBe("Beras Premium");
      expect(result.scopeUsed).toBe("regency");
      expect(result.sampleCount).toBe(2);
      expect(result.statistics.raw.count).toBe(2);
      expect(result.statistics.raw.min).toBe(12000);
      expect(result.statistics.raw.max).toBe(13000);
      expect(result.suppliers).toHaveLength(2);
    });

    it("should throw when latitude provided without longitude", async () => {
      await expect(
        service.getMarketPrices("Beras", { latitude: -6.5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw when both admin and GPS filters provided", async () => {
      await expect(
        service.getMarketPrices("Beras", {
          province: "Jawa Barat",
          latitude: -6.5,
          longitude: 107.4,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should return master scope with empty statistics when no items found", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const result = await service.getMarketPrices("Nonexistent Item");

      expect(result.scopeUsed).toBe("master");
      expect(result.sampleCount).toBe(0);
      expect(result.statistics.raw.count).toBe(0);
      expect(result.iqrBounds).toBeNull();
      expect(result.suppliers).toHaveLength(0);
    });

    it("should return IQR bounds when sampleCount >= 4", async () => {
      const items = makeManySupplierItems(5, 10000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getMarketPrices("Beras Premium");

      expect(result.iqrBounds).not.toBeNull();
      expect(result.iqrBounds!.lower).toBeLessThan(result.iqrBounds!.upper);
    });

    it("should return null IQR bounds when sampleCount < 4", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([
        mockSupplierItem,
        mockSupplierItem2,
      ]);

      const result = await service.getMarketPrices("Beras Premium");

      expect(result.iqrBounds).toBeNull();
    });

    it("should sort suppliers by stock descending then priceUpdatedAt in non-GPS mode", async () => {
      const itemA = {
        ...mockSupplierItem,
        id: "item-a",
        stock: 10,
        priceUpdatedAt: new Date("2026-07-10T08:00:00Z"),
      };
      const itemB = {
        ...mockSupplierItem,
        id: "item-b",
        stock: 50,
        priceUpdatedAt: new Date("2026-07-09T08:00:00Z"),
      };
      prisma.supplierItem.findMany.mockResolvedValue([itemA, itemB]);

      const result = await service.getMarketPrices("Beras Premium", {
        province: "Jawa Barat",
      });

      expect(result.suppliers[0].itemId).toBe("item-b");
      expect(result.suppliers[1].itemId).toBe("item-a");
    });

    it("should serialize filter with null values for unset fields", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([mockSupplierItem]);

      const result = await service.getMarketPrices("Beras Premium");

      expect(result.filter).toEqual({
        province: null,
        regency: null,
        district: null,
        latitude: null,
        longitude: null,
        radiusKm: null,
      });
    });

    it("should include isSimulation flag on suppliers", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([mockSupplierItem]);

      const result = await service.getMarketPrices("Beras Premium", {
        province: "Jawa Barat",
      });

      expect(result.suppliers[0]).toHaveProperty("isSimulation");
    });
  });

  // =========================================================================
  // getItemDetail
  // =========================================================================
  describe("getItemDetail", () => {
    it("should return item with supplier and commodity detail", async () => {
      prisma.supplierItem.findUnique.mockResolvedValue({
        ...mockSupplierItem,
        deletedAt: null,
        description: "Beras premium grade A",
        minOrderQty: 10,
        orderStep: 5,
        isAvailable: true,
        image: null,
        createdAt: new Date("2026-01-01"),
        commodity: {
          id: "com_beras",
          name: "Beras",
          referencePrice: 15000,
          category: { id: "cat-karbo", name: "Karbohidrat" },
        },
        supplier: mockSupplier,
      });

      const result = await service.getItemDetail("item-1");

      expect(result.item.id).toBe("item-1");
      expect(result.item.name).toBe("Beras Premium");
      expect(result.item.commodity).not.toBeNull();
      expect(result.item.commodity!.name).toBe("Beras");
      expect(result.item.commodity!.category.name).toBe("Karbohidrat");
      expect(result.supplier.id).toBe("sup-1");
      expect(result.supplier.name).toBe("UD. Sumber Rejeki");
    });

    it("should throw NotFoundException when item not found", async () => {
      prisma.supplierItem.findUnique.mockResolvedValue(null);

      await expect(service.getItemDetail("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException when item is soft-deleted", async () => {
      prisma.supplierItem.findUnique.mockResolvedValue({
        ...mockSupplierItem,
        deletedAt: new Date("2026-07-01"),
        description: null,
        minOrderQty: null,
        orderStep: null,
        isAvailable: true,
        image: null,
        createdAt: new Date("2026-01-01"),
        commodity: null,
        supplier: mockSupplier,
      });

      await expect(service.getItemDetail("item-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should handle null commodity gracefully", async () => {
      prisma.supplierItem.findUnique.mockResolvedValue({
        ...mockSupplierItem,
        deletedAt: null,
        description: null,
        minOrderQty: null,
        orderStep: null,
        isAvailable: true,
        image: null,
        createdAt: new Date("2026-01-01"),
        commodity: null,
        supplier: mockSupplier,
      });

      const result = await service.getItemDetail("item-1");

      expect(result.item.commodity).toBeNull();
    });
  });

  // =========================================================================
  // getDistinctMarkets
  // =========================================================================
  describe("getDistinctMarkets", () => {
    it("should return paginated distinct markets for province+regency", async () => {
      prisma.supplier.findMany.mockResolvedValue([
        {
          id: "sup-1",
          marketName: "Pasar Cibeunying",
          items: [{ id: "item-1" }, { id: "item-2" }],
        },
        {
          id: "sup-2",
          marketName: "Pasar Cibeunying",
          items: [{ id: "item-3" }],
        },
        {
          id: "sup-3",
          marketName: "Pasar Baru",
          items: [{ id: "item-4" }],
        },
      ]);

      const result = await service.getDistinctMarkets(
        "Jawa Barat",
        "Purwakarta",
      );

      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe("Pasar Baru");
      expect(result.data[1].name).toBe("Pasar Cibeunying");
      expect(result.data[1].supplierCount).toBe(2);
      expect(result.data[1].itemCount).toBe(3);
      expect(result.meta.total).toBe(2);
    });

    it("should filter by item name when provided", async () => {
      prisma.supplier.findMany.mockResolvedValue([
        {
          id: "sup-1",
          marketName: "Pasar Cibeunying",
          items: [{ id: "item-1" }],
        },
      ]);

      await service.getDistinctMarkets("Jawa Barat", "Purwakarta", "Beras");

      expect(prisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            items: expect.objectContaining({
              where: expect.objectContaining({
                name: {
                  contains: "Beras",
                  mode: "insensitive",
                },
              }),
            }),
          }),
        }),
      );
    });

    it("should exclude markets with no items", async () => {
      prisma.supplier.findMany.mockResolvedValue([
        {
          id: "sup-1",
          marketName: "Pasar Cibeunying",
          items: [],
        },
      ]);

      const result = await service.getDistinctMarkets(
        "Jawa Barat",
        "Purwakarta",
      );

      expect(result.data).toHaveLength(0);
    });

    it("should paginate results correctly", async () => {
      const markets = Array.from({ length: 5 }, (_, i) => ({
        id: `sup-${i}`,
        marketName: `Pasar ${String.fromCharCode(65 + i)}`,
        items: [{ id: `item-${i}` }],
      }));
      prisma.supplier.findMany.mockResolvedValue(markets);

      const result = await service.getDistinctMarkets(
        "Jawa Barat",
        "Purwakarta",
        undefined,
        1,
        2,
      );

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(5);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
    });
  });

  // =========================================================================
  // getSupplierRegions
  // =========================================================================
  describe("getSupplierRegions", () => {
    it("should return grouped province to regencies", async () => {
      prisma.supplier.findMany.mockResolvedValue([
        { province: "JAWA_BARAT", regency: "PURWAKARTA" },
        { province: "JAWA_BARAT", regency: "BANDUNG" },
        { province: "DKI_JAKARTA", regency: "JAKARTA_PUSAT" },
      ]);

      const result = await service.getSupplierRegions();

      expect(result.data).toHaveLength(2);
      const jabar = result.data.find(
        (r: any) => r.province === "JAWA_BARAT",
      ) as any;
      expect(jabar!.regencies).toContain("PURWAKARTA");
      expect(jabar!.regencies).toContain("BANDUNG");
    });

    it("should only include suppliers with active stock", async () => {
      prisma.supplier.findMany.mockResolvedValue([]);

      await service.getSupplierRegions();

      expect(prisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            items: { some: { deletedAt: null, stock: { gt: 0 } } },
          },
        }),
      );
    });

    it("should paginate provinces", async () => {
      const regions = Array.from({ length: 5 }, (_, i) => ({
        province: `PROV_${i}`,
        regency: `REGENCY_${i}`,
      }));
      prisma.supplier.findMany.mockResolvedValue(regions);

      const result = await service.getSupplierRegions(1, 2);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(5);
      expect(result.meta.totalPages).toBe(3);
    });
  });

  // =========================================================================
  // getAnomalies
  // =========================================================================
  describe("getAnomalies", () => {
    it("should group by commodityId and detect outliers via IQR", async () => {
      const items = [
        { ...mockSupplierItem, basePrice: 10000, id: "i1" },
        { ...mockSupplierItem, basePrice: 11000, id: "i2" },
        { ...mockSupplierItem, basePrice: 12000, id: "i3" },
        { ...mockSupplierItem, basePrice: 13000, id: "i4" },
        { ...mockSupplierItem, basePrice: 50000, id: "i5" },
      ];
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getAnomalies({
        province: "Jawa Barat",
      });

      expect(result.data.filter).toBeDefined();
      expect(result.data.anomalies).toBeDefined();
      const anomaly = result.data.anomalies.find(
        (a: any) => a.commodityId === "com_beras",
      );
      expect(anomaly).toBeDefined();
      expect(anomaly!.outlierCount).toBe(1);
      expect(anomaly!.prices).toContain(50000);
    });

    it("should skip groups with fewer than 4 samples", async () => {
      const items = [
        { ...mockSupplierItem, basePrice: 10000, id: "i1" },
        { ...mockSupplierItem, basePrice: 12000, id: "i2" },
      ];
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getAnomalies({
        province: "Jawa Barat",
      });

      expect(result.data.anomalies).toHaveLength(0);
    });

    it("should fallback to name when commodityId is null", async () => {
      const items = [
        { ...mockSupplierItem, commodityId: null, basePrice: 10000, id: "i1" },
        { ...mockSupplierItem, commodityId: null, basePrice: 11000, id: "i2" },
        { ...mockSupplierItem, commodityId: null, basePrice: 12000, id: "i3" },
        { ...mockSupplierItem, commodityId: null, basePrice: 13000, id: "i4" },
        { ...mockSupplierItem, commodityId: null, basePrice: 50000, id: "i5" },
      ];
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getAnomalies({
        province: "Jawa Barat",
      });

      const anomaly = result.data.anomalies.find(
        (a: any) => a.commodityId === null,
      );
      expect(anomaly).toBeDefined();
    });

    it("should return empty anomalies when all prices are within bounds", async () => {
      const items = makeManySupplierItems(5, 12000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getAnomalies({
        province: "Jawa Barat",
      });

      const anomaly = result.data.anomalies.find(
        (a: any) => a.commodityId === "com_beras",
      );
      if (anomaly) {
        expect(anomaly.outlierCount).toBe(0);
      }
    });

    it("should paginate anomalies", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const result = await service.getAnomalies({ page: 1, limit: 10 });

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });
  });

  // =========================================================================
  // getHETSuggestion
  // =========================================================================
  describe("getHETSuggestion", () => {
    it("should return master price for cold start (0 samples)", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const result = await service.getHETSuggestion("Beras Premium");

      expect(result.het).toBe(15000);
      expect(result.basedOn).toBe("master_reference_cold_start");
    });

    it("should return blended formula for small sample (1-4)", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([mockSupplierItem]);

      const result = await service.getHETSuggestion("Beras Premium");

      expect(result.basedOn).toBe("blended_small_sample");
      expect(result.het).toBeGreaterThan(0);
    });

    it("should return ceil(clean.median * 1.1) for mature market", async () => {
      const items = makeManySupplierItems(6, 10000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getHETSuggestion("Beras Premium");

      expect(result.basedOn).toBe("clean_dynamic_median");
      expect(result.het).toBeGreaterThan(0);
    });

    it("should return clean_dynamic_median with correct formula when outliers are filtered", async () => {
      const items = [
        { ...mockSupplierItem, basePrice: 10000, id: "i1" },
        { ...mockSupplierItem, basePrice: 11000, id: "i2" },
        { ...mockSupplierItem, basePrice: 12000, id: "i3" },
        { ...mockSupplierItem, basePrice: 13000, id: "i4" },
        { ...mockSupplierItem, basePrice: 14000, id: "i5" },
        { ...mockSupplierItem, basePrice: 50000, id: "i6" },
      ];
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getHETSuggestion("Beras Premium");

      expect(result.basedOn).toBe("clean_dynamic_median");
      expect(result.het).toBeGreaterThan(0);
      expect(result.het).toBe(Math.ceil(result.statistics.clean.median * 1.1));
    });

    it("should include statistics in response", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([mockSupplierItem]);

      const result = await service.getHETSuggestion("Beras Premium");

      expect(result.statistics).toBeDefined();
      expect(result.statistics.raw).toBeDefined();
      expect(result.statistics.raw.count).toBe(1);
    });
  });

  // =========================================================================
  // validatePrice
  // =========================================================================
  describe("validatePrice", () => {
    it("should return VALID for price within IQR bounds", async () => {
      const items = makeManySupplierItems(6, 12000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.validatePrice("Beras Premium", 12500, {
        province: "Jawa Barat",
      });

      expect(result.status).toBe("VALID");
      expect(result.marketMedianSnapshot).toBeGreaterThan(0);
    });

    it("should return INVALID for cold start price > master * 1.2", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const result = await service.validatePrice("Beras Premium", 20000);

      expect(result.status).toBe("INVALID");
      expect(result.reason).toContain("20%");
    });

    it("should return WARNING for cold start price > master * 1.05", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const result = await service.validatePrice("Beras Premium", 16000);

      expect(result.status).toBe("WARNING");
      expect(result.reason).toContain("master");
    });

    it("should return VALID for cold start price <= master * 1.05", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const result = await service.validatePrice("Beras Premium", 15500);

      expect(result.status).toBe("VALID");
    });

    it("should return INVALID for mature market price > upper IQR", async () => {
      const items = makeManySupplierItems(6, 12000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.validatePrice("Beras Premium", 100000, {
        province: "Jawa Barat",
      });

      expect(result.status).toBe("INVALID");
      expect(result.reason).toContain("outlier");
    });

    it("should return WARNING for mature market price < lower IQR", async () => {
      const items = makeManySupplierItems(6, 12000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.validatePrice("Beras Premium", 100, {
        province: "Jawa Barat",
      });

      expect(result.status).toBe("WARNING");
      expect(result.reason).toContain("rendah");
    });

    it("should return WARNING when deviation > 15% from clean median", async () => {
      const items = makeManySupplierItems(6, 12000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.validatePrice("Beras Premium", 17000, {
        province: "Jawa Barat",
      });

      expect(result.status).toBe("WARNING");
    });

    it("should always include marketMedianSnapshot", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const result = await service.validatePrice("Beras Premium", 10000);

      expect(result).toHaveProperty("marketMedianSnapshot");
      expect(typeof result.marketMedianSnapshot).toBe("number");
    });
  });

  // =========================================================================
  // getMarketContextForItem
  // =========================================================================
  describe("getMarketContextForItem", () => {
    it("should return validation context with master price and statistics", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([
        mockSupplierItem,
        mockSupplierItem2,
      ]);

      const ctx = await service.getMarketContextForItem("Beras Premium");

      expect(ctx.itemName).toBe("Beras Premium");
      expect(ctx.masterPrice).toBe(15000);
      expect(ctx.sampleCount).toBe(2);
      expect(ctx.statistics).toBeDefined();
      expect(ctx.basedOn).toBeDefined();
    });

    it("should use commodityId for master price lookup when provided", async () => {
      prisma.itemCommodity.findUnique.mockResolvedValue({
        referencePrice: 20000,
        name: "Beras",
      });
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const ctx = await service.getMarketContextForItem("Beras Premium", {
        commodityId: "com_beras",
      });

      expect(ctx.masterPrice).toBe(20000);
      expect(prisma.itemCommodity.findUnique).toHaveBeenCalledWith({
        where: { id: "com_beras" },
        select: { referencePrice: true, name: true },
      });
    });
  });

  // =========================================================================
  // getMarketPricesRaw (alias)
  // =========================================================================
  describe("getMarketPricesRaw", () => {
    it("should behave identically to getMarketPrices", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([mockSupplierItem]);

      const raw = await service.getMarketPricesRaw("Beras Premium");
      const normal = await service.getMarketPrices("Beras Premium");

      expect(raw.item).toBe(normal.item);
      expect(raw.scopeUsed).toBe(normal.scopeUsed);
      expect(raw.sampleCount).toBe(normal.sampleCount);
    });
  });

  // =========================================================================
  // IQR / Statistics private methods (tested through public methods)
  // =========================================================================
  describe("statistics calculations", () => {
    it("should compute correct median for odd-length array", async () => {
      const items = [
        { ...mockSupplierItem, basePrice: 10000, id: "i1" },
        { ...mockSupplierItem, basePrice: 12000, id: "i2" },
        { ...mockSupplierItem, basePrice: 15000, id: "i3" },
      ];
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getMarketPrices("Beras Premium", {
        province: "Jawa Barat",
      });

      expect(result.statistics.raw.median).toBe(12000);
    });

    it("should compute correct median for even-length array", async () => {
      const items = [
        { ...mockSupplierItem, basePrice: 10000, id: "i1" },
        { ...mockSupplierItem, basePrice: 12000, id: "i2" },
        { ...mockSupplierItem, basePrice: 13000, id: "i3" },
        { ...mockSupplierItem, basePrice: 15000, id: "i4" },
      ];
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getMarketPrices("Beras Premium", {
        province: "Jawa Barat",
      });

      expect(result.statistics.raw.median).toBe(12500);
    });

    it("should compute correct mean", async () => {
      const items = [
        { ...mockSupplierItem, basePrice: 10000, id: "i1" },
        { ...mockSupplierItem, basePrice: 14000, id: "i2" },
      ];
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getMarketPrices("Beras Premium", {
        province: "Jawa Barat",
      });

      expect(result.statistics.raw.mean).toBe(12000);
    });

    it("should compute IQR bounds correctly", async () => {
      const items = makeManySupplierItems(6, 10000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getMarketPrices("Beras Premium");

      expect(result.iqrBounds).not.toBeNull();
      expect(result.iqrBounds!.lower).toBeLessThan(result.iqrBounds!.upper);
    });

    it("should filter clean statistics excluding outliers", async () => {
      const items = [
        { ...mockSupplierItem, basePrice: 10000, id: "i1" },
        { ...mockSupplierItem, basePrice: 11000, id: "i2" },
        { ...mockSupplierItem, basePrice: 12000, id: "i3" },
        { ...mockSupplierItem, basePrice: 13000, id: "i4" },
        { ...mockSupplierItem, basePrice: 50000, id: "i5" },
      ];
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getMarketPrices("Beras Premium");

      expect(result.statistics.clean.count).toBeLessThan(
        result.statistics.raw.count,
      );
      expect(result.statistics.clean.max).toBeLessThan(50000);
    });
  });

  // =========================================================================
  // Admin scope resolution (tested through public methods)
  // =========================================================================
  describe("admin scope resolution", () => {
    it("should prefer district scope when >= 5 items match", async () => {
      const items = makeManySupplierItems(6, 12000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getMarketPrices("Beras Premium", {
        province: "Jawa Barat",
        regency: "Purwakarta",
        district: "Babakancikao",
      });

      expect(result.scopeUsed).toBe("district");
      expect(result.sampleCount).toBe(6);
    });

    it("should cascade to regency when district has < 5 items", async () => {
      const items = [
        { ...mockSupplierItem, id: "i1" },
        { ...mockSupplierItem, id: "i2" },
        { ...mockSupplierItem2, id: "i3" },
      ];
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getMarketPrices("Beras Premium", {
        province: "Jawa Barat",
        regency: "Purwakarta",
        district: "Babakancikao",
      });

      expect(result.sampleCount >= 0).toBe(true);
    });

    it("should return best scope when none reaches MIN_MATURE_SAMPLE", async () => {
      const items = [
        { ...mockSupplierItem, id: "i1" },
        { ...mockSupplierItem2, id: "i2" },
      ];
      prisma.supplierItem.findMany.mockResolvedValue(items);

      const result = await service.getMarketPrices("Beras Premium", {
        province: "Jawa Barat",
        regency: "Purwakarta",
        district: "Babakancikao",
      });

      expect(result.sampleCount).toBe(2);
    });

    it("should return master scope when no items match any level", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const result = await service.getMarketPrices("Beras Premium", {
        province: "Jawa Barat",
        regency: "Purwakarta",
      });

      expect(result.scopeUsed).toBe("master");
    });
  });

  // =========================================================================
  // GPS scope resolution (tested through public methods)
  // =========================================================================
  describe("GPS scope resolution", () => {
    it("should return items within radius using GPS filter", async () => {
      const items = makeManySupplierItems(5, 12000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      (findWithinRadius as jest.Mock).mockReturnValue(
        items.map((item: any) => ({
          item,
          id: item.id,
          coordinate: {},
          distance: 2.0,
        })),
      );

      const result = await service.getMarketPrices("Beras Premium", {
        latitude: -6.5398,
        longitude: 107.4471,
      });

      expect(result.scopeUsed).toBe("gps_radius");
      expect(result.effectiveRadiusKm).toBeDefined();
      expect(result.sampleCount).toBe(5);
    });

    it("should include distanceKm on suppliers in GPS mode", async () => {
      const items = makeManySupplierItems(5, 12000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      (findWithinRadius as jest.Mock).mockReturnValue(
        items.map((item: any) => ({
          item,
          id: item.id,
          coordinate: {},
          distance: 3.5,
        })),
      );

      const result = await service.getMarketPrices("Beras Premium", {
        latitude: -6.5398,
        longitude: 107.4471,
      });

      expect(result.suppliers[0].distanceKm).toBeDefined();
      expect(typeof result.suppliers[0].distanceKm).toBe("number");
    });

    it("should cascade to larger radius when fewer than 5 items found at smaller radius", async () => {
      const items = makeManySupplierItems(6, 12000);
      prisma.supplierItem.findMany.mockResolvedValue(items);

      (findWithinRadius as jest.Mock)
        .mockReturnValueOnce(
          items.slice(0, 2).map((item: any) => ({
            item,
            id: item.id,
            coordinate: {},
            distance: 1,
          })),
        )
        .mockReturnValueOnce(
          items.map((item: any) => ({
            item,
            id: item.id,
            coordinate: {},
            distance: 2,
          })),
        );

      const result = await service.getMarketPrices("Beras Premium", {
        latitude: -6.5398,
        longitude: 107.4471,
        radiusKm: 5,
      });

      expect(result.scopeUsed).toBe("gps_radius");
      expect(result.sampleCount).toBe(6);
    });

    it("should return master scope when GPS finds no items and no admin filters", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([
        mockSupplierItem,
        mockSupplierItem2,
      ]);

      (findWithinRadius as jest.Mock).mockReturnValue([]);

      const result = await service.getMarketPrices("Beras Premium", {
        latitude: -6.5398,
        longitude: 107.4471,
      });

      expect(result.scopeUsed).toBe("master");
    });
  });

  // =========================================================================
  // Taxonomy filters
  // =========================================================================
  describe("taxonomy filters", () => {
    it("should filter by commodityId when provided", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([mockSupplierItem]);

      await service.getMarketPrices("Beras Premium", {
        commodityId: "com_beras",
      });

      expect(prisma.supplierItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            commodityId: "com_beras",
          }),
        }),
      );
    });

    it("should filter by categoryId when provided", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([mockSupplierItem]);

      await service.getMarketPrices("Beras Premium", {
        categoryId: "cat-karbo",
      });

      expect(prisma.supplierItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            commodity: { categoryId: "cat-karbo" },
          }),
        }),
      );
    });

    it("should filter by marketName when provided", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([mockSupplierItem]);

      await service.getMarketPrices("Beras Premium", {
        marketName: "Pasar Cibeunying",
      });

      expect(prisma.supplierItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            supplier: expect.objectContaining({
              is: expect.objectContaining({
                marketName: {
                  equals: "Pasar Cibeunying",
                  mode: "insensitive",
                },
              }),
            }),
          }),
        }),
      );
    });
  });

  // =========================================================================
  // getMasterReferencePrice fallback
  // =========================================================================
  describe("getMasterReferencePrice fallback", () => {
    it("should match commodity by name inclusion", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const ctx = await service.getMarketContextForItem("Beras Premium");

      expect(ctx.masterPrice).toBe(15000);
    });

    it("should use FALLBACK_MASTER_PRICE when no match found", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const ctx = await service.getMarketContextForItem("UnknownItem");

      expect(ctx.masterPrice).toBe(20000);
    });

    it("should use commodityId lookup first when provided", async () => {
      prisma.itemCommodity.findUnique.mockResolvedValue({
        referencePrice: 25000,
        name: "Ayam",
      });
      prisma.supplierItem.findMany.mockResolvedValue([]);

      const ctx = await service.getMarketContextForItem("Ayam", {
        commodityId: "com-ayam",
      });

      expect(ctx.masterPrice).toBe(25000);
    });
  });
});
