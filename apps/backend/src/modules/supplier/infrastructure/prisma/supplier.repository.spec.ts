import { Test, TestingModule } from "@nestjs/testing";
import { PrismaSupplierRepository } from "./supplier.repository";
import { PrismaService } from "../../../../database/prisma.service";
import { Supplier } from "../../domain/entities/supplier.entity";

describe("PrismaSupplierRepository", () => {
  let repository: PrismaSupplierRepository;
  let prisma: jest.Mocked<any>;

  const mockPrismaSupplier = {
    id: "sup-1",
    name: "UD. Sumber Rejeki",
    nib: "NIB12345",
    phone: "08123456789",
    address: "Jl. Merdeka No. 1",
    province: "Jawa Barat",
    regency: "Purwakarta",
    district: "Purwakarta",
    village: null,
    postalCode: null,
    latitude: -6.5563,
    longitude: 107.4439,
    isMarketSeller: false,
    marketName: null,
    profileImage: null,
    openStatus: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    items: [],
  };

  const mockPrismaSupplierItem = {
    id: "item-1",
    name: "Beras Premium",
    unit: "kg",
    basePrice: 12000,
    description: null,
    minOrderQty: null,
    orderStep: null,
    isAvailable: true,
    image: null,
    stock: 100,
    priceUpdatedAt: null,
    stockUpdatedAt: null,
    deletedAt: null,
    commodityId: "com-1",
    supplierId: "sup-1",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    commodity: {
      id: "com-1",
      name: "Beras",
      referencePrice: 15000,
      category: {
        id: "cat-1",
        name: "Karbohidrat",
      },
    },
  };

  beforeEach(async () => {
    const mockPrisma = {
      supplier: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      supplierItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      mouItem: { count: jest.fn() },
      orderItem: { count: jest.fn() },
      batchItem: { count: jest.fn() },
      inventoryStock: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaSupplierRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<PrismaSupplierRepository>(PrismaSupplierRepository);
    prisma = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("findAll", () => {
    it("should return array of Supplier entities", async () => {
      prisma.supplier.findMany.mockResolvedValue([mockPrismaSupplier]);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Supplier);
      expect(result[0].id).toBe("sup-1");
    });

    it("should apply skip and take pagination", async () => {
      prisma.supplier.findMany.mockResolvedValue([]);

      await repository.findAll({ skip: 10, take: 5 });

      expect(prisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });

    it("should apply search filter", async () => {
      prisma.supplier.findMany.mockResolvedValue([]);

      await repository.findAll({ search: "sumber" });

      expect(prisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({ contains: "sumber" }),
              }),
            ]),
          }),
        }),
      );
    });

    it("should order by createdAt desc", async () => {
      prisma.supplier.findMany.mockResolvedValue([]);

      await repository.findAll();

      expect(prisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: "desc" } }),
      );
    });
  });

  describe("findById", () => {
    it("should return Supplier entity when found", async () => {
      prisma.supplier.findUnique.mockResolvedValue(mockPrismaSupplier);

      const result = await repository.findById("sup-1");

      expect(result).toBeInstanceOf(Supplier);
      expect(result!.id).toBe("sup-1");
      expect(result!.name).toBe("UD. Sumber Rejeki");
    });

    it("should return null when not found", async () => {
      prisma.supplier.findUnique.mockResolvedValue(null);

      const result = await repository.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findByNib", () => {
    it("should return Supplier entity when found", async () => {
      prisma.supplier.findUnique.mockResolvedValue(mockPrismaSupplier);

      const result = await repository.findByNib("NIB12345");

      expect(result).toBeInstanceOf(Supplier);
      expect(result!.nib).toBe("NIB12345");
      expect(prisma.supplier.findUnique).toHaveBeenCalledWith({
        where: { nib: "NIB12345" },
        include: expect.any(Object),
      });
    });

    it("should return null when not found", async () => {
      prisma.supplier.findUnique.mockResolvedValue(null);

      const result = await repository.findByNib("NONEXISTENT");

      expect(result).toBeNull();
    });
  });

  describe("count", () => {
    it("should return total count", async () => {
      prisma.supplier.count.mockResolvedValue(42);

      const result = await repository.count();

      expect(result).toBe(42);
    });

    it("should apply search filter", async () => {
      prisma.supplier.count.mockResolvedValue(5);

      await repository.count({ search: "sumber" });

      expect(prisma.supplier.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({ contains: "sumber" }),
            }),
          ]),
        }),
      });
    });
  });

  describe("create", () => {
    it("should create and return Supplier entity", async () => {
      prisma.supplier.create.mockResolvedValue(mockPrismaSupplier);

      const result = await repository.create({
        name: "UD. Sumber Rejeki",
        nib: "NIB12345",
        province: "Jawa Barat",
        regency: "Purwakarta",
      });

      expect(result).toBeInstanceOf(Supplier);
      expect(prisma.supplier.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "UD. Sumber Rejeki",
          nib: "NIB12345",
          province: "Jawa Barat",
          regency: "Purwakarta",
        }),
        include: expect.any(Object),
      });
    });
  });

  describe("update", () => {
    it("should update and return Supplier entity", async () => {
      const updatedRecord = { ...mockPrismaSupplier, name: "UD. Updated" };
      prisma.supplier.update.mockResolvedValue(updatedRecord);

      const result = await repository.update("sup-1", {
        name: "UD. Updated",
      });

      expect(result).toBeInstanceOf(Supplier);
      expect(result.name).toBe("UD. Updated");
      expect(prisma.supplier.update).toHaveBeenCalledWith({
        where: { id: "sup-1" },
        data: { name: "UD. Updated" },
        include: expect.any(Object),
      });
    });
  });

  describe("delete", () => {
    it("should delete items then supplier", async () => {
      prisma.supplierItem.deleteMany.mockResolvedValue({ count: 3 });
      prisma.supplier.delete.mockResolvedValue(undefined);

      await repository.delete("sup-1");

      expect(prisma.supplierItem.deleteMany).toHaveBeenCalledWith({
        where: { supplierId: "sup-1" },
      });
      expect(prisma.supplier.delete).toHaveBeenCalledWith({
        where: { id: "sup-1" },
      });
    });
  });

  describe("findItems", () => {
    it("should return items with commodity enrichment", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([mockPrismaSupplierItem]);

      const result = await repository.findItems("sup-1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("item-1");
      expect(result[0].commodity).toEqual({
        id: "com-1",
        name: "Beras",
        referencePrice: 15000,
        category: { id: "cat-1", name: "Karbohidrat" },
      });
    });

    it("should filter deletedAt: null", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      await repository.findItems("sup-1");

      expect(prisma.supplierItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });

    it("should order by createdAt desc", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);

      await repository.findItems("sup-1");

      expect(prisma.supplierItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: "desc" } }),
      );
    });
  });

  describe("findItemById", () => {
    it("should return item when found", async () => {
      prisma.supplierItem.findUnique.mockResolvedValue(mockPrismaSupplierItem);

      const result = await repository.findItemById("item-1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("item-1");
      expect(result!.commodity).toBeDefined();
    });

    it("should return null when not found", async () => {
      prisma.supplierItem.findUnique.mockResolvedValue(null);

      const result = await repository.findItemById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("addItem", () => {
    it("should create item with all fields", async () => {
      prisma.supplierItem.create.mockResolvedValue(mockPrismaSupplierItem);

      const result = await repository.addItem("sup-1", {
        name: "Beras Premium",
        unit: "kg",
        basePrice: 12000,
      });

      expect(result.id).toBe("item-1");
      expect(result.name).toBe("Beras Premium");
      expect(prisma.supplierItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Beras Premium",
          unit: "kg",
          basePrice: 12000,
          supplierId: "sup-1",
        }),
        include: expect.any(Object),
      });
    });
  });

  describe("updateItem", () => {
    it("should update item and return enriched data", async () => {
      const updatedItem = {
        ...mockPrismaSupplierItem,
        basePrice: 13000,
      };
      prisma.supplierItem.update.mockResolvedValue(updatedItem);

      const result = await repository.updateItem("item-1", {
        basePrice: 13000,
      });

      expect(result.basePrice).toBe(13000);
      expect(prisma.supplierItem.update).toHaveBeenCalledWith({
        where: { id: "item-1" },
        data: { basePrice: 13000 },
        include: expect.any(Object),
      });
    });
  });

  describe("hasItemReferences", () => {
    it("should return true when references exist", async () => {
      prisma.mouItem.count.mockResolvedValue(0);
      prisma.orderItem.count.mockResolvedValue(2);
      prisma.batchItem.count.mockResolvedValue(0);
      prisma.inventoryStock.count.mockResolvedValue(1);

      const result = await repository.hasItemReferences("item-1");

      expect(result.hasReferences).toBe(true);
      expect(result.reasons).toContain("2 order tercatat");
      expect(result.reasons).toContain("1 stok inventory");
    });

    it("should return false when no references", async () => {
      prisma.mouItem.count.mockResolvedValue(0);
      prisma.orderItem.count.mockResolvedValue(0);
      prisma.batchItem.count.mockResolvedValue(0);
      prisma.inventoryStock.count.mockResolvedValue(0);

      const result = await repository.hasItemReferences("item-1");

      expect(result.hasReferences).toBe(false);
      expect(result.reasons).toHaveLength(0);
    });

    it("should include MoU references", async () => {
      prisma.mouItem.count.mockResolvedValue(3);
      prisma.orderItem.count.mockResolvedValue(0);
      prisma.batchItem.count.mockResolvedValue(0);
      prisma.inventoryStock.count.mockResolvedValue(0);

      const result = await repository.hasItemReferences("item-1");

      expect(result.hasReferences).toBe(true);
      expect(result.reasons).toContain("3 MoU aktif");
    });

    it("should include batch references", async () => {
      prisma.mouItem.count.mockResolvedValue(0);
      prisma.orderItem.count.mockResolvedValue(0);
      prisma.batchItem.count.mockResolvedValue(1);
      prisma.inventoryStock.count.mockResolvedValue(0);

      const result = await repository.hasItemReferences("item-1");

      expect(result.hasReferences).toBe(true);
      expect(result.reasons).toContain("1 batch produksi");
    });
  });

  describe("removeItem", () => {
    it("should delete item", async () => {
      prisma.supplierItem.delete.mockResolvedValue(undefined);

      await repository.removeItem("item-1");

      expect(prisma.supplierItem.delete).toHaveBeenCalledWith({
        where: { id: "item-1" },
      });
    });
  });
});
