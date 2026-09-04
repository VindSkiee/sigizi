import { Test, TestingModule } from "@nestjs/testing";
import { CategoryService } from "./category.service";
import { PrismaService } from "../../database/prisma.service";

describe("CategoryService", () => {
  let service: CategoryService;
  let prisma: {
    itemCategory: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
    };
    itemCommodity: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
    };
  };

  const mockCategory = {
    id: "cat_karbohidrat",
    name: "Karbohidrat",
    description: null,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  const mockCategoryWithCommodities = {
    ...mockCategory,
    commodities: [
      {
        id: "com_beras",
        name: "Beras",
        description: null,
        referencePrice: 15000,
      },
      {
        id: "com_kentang",
        name: "Kentang",
        description: null,
        referencePrice: 12000,
      },
    ],
  };

  const mockCommodity = {
    id: "com_beras",
    name: "Beras",
    description: null,
    referencePrice: 15000,
    categoryId: "cat_karbohidrat",
    category: {
      id: "cat_karbohidrat",
      name: "Karbohidrat",
    },
  };

  const mockCommodityList = [
    mockCommodity,
    {
      id: "com_kentang",
      name: "Kentang",
      description: null,
      referencePrice: 12000,
      categoryId: "cat_karbohidrat",
      category: {
        id: "cat_karbohidrat",
        name: "Karbohidrat",
      },
    },
  ];

  beforeEach(async () => {
    prisma = {
      itemCategory: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      itemCommodity: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAllCategories", () => {
    it("should return all active categories with commodities", async () => {
      prisma.itemCategory.findMany.mockResolvedValue([
        mockCategoryWithCommodities,
      ]);

      const result = await service.findAllCategories();

      expect(result).toEqual([mockCategoryWithCommodities]);
      expect(prisma.itemCategory.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          commodities: {
            where: { isActive: true },
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              description: true,
              referencePrice: true,
            },
          },
        },
      });
    });

    it("should return empty array when no active categories exist", async () => {
      prisma.itemCategory.findMany.mockResolvedValue([]);

      const result = await service.findAllCategories();

      expect(result).toEqual([]);
    });
  });

  describe("findCategoryById", () => {
    it("should return category with commodities when found", async () => {
      prisma.itemCategory.findUnique.mockResolvedValue(
        mockCategoryWithCommodities,
      );

      const result = await service.findCategoryById("cat_karbohidrat");

      expect(result).toEqual(mockCategoryWithCommodities);
      expect(prisma.itemCategory.findUnique).toHaveBeenCalledWith({
        where: { id: "cat_karbohidrat" },
        include: {
          commodities: {
            where: { isActive: true },
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              description: true,
              referencePrice: true,
            },
          },
        },
      });
    });

    it("should return null when category not found", async () => {
      prisma.itemCategory.findUnique.mockResolvedValue(null);

      const result = await service.findCategoryById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findCategoryByName", () => {
    it("should return category matching name with commodities", async () => {
      prisma.itemCategory.findFirst.mockResolvedValue(
        mockCategoryWithCommodities,
      );

      const result = await service.findCategoryByName("Karbohidrat");

      expect(result).toEqual(mockCategoryWithCommodities);
      expect(prisma.itemCategory.findFirst).toHaveBeenCalledWith({
        where: { name: "Karbohidrat", isActive: true },
        include: {
          commodities: {
            where: { isActive: true },
            orderBy: { name: "asc" },
            select: {
              id: true,
              name: true,
              description: true,
              referencePrice: true,
            },
          },
        },
      });
    });

    it("should return null when name not found", async () => {
      prisma.itemCategory.findFirst.mockResolvedValue(null);

      const result = await service.findCategoryByName("Nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findAllCommodities", () => {
    it("should return all active commodities without categoryId filter", async () => {
      prisma.itemCommodity.findMany.mockResolvedValue(mockCommodityList);

      const result = await service.findAllCommodities();

      expect(result).toEqual(mockCommodityList);
      expect(prisma.itemCommodity.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          referencePrice: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it("should filter by categoryId when provided", async () => {
      prisma.itemCommodity.findMany.mockResolvedValue(mockCommodityList);

      const result = await service.findAllCommodities("cat_karbohidrat");

      expect(result).toEqual(mockCommodityList);
      expect(prisma.itemCommodity.findMany).toHaveBeenCalledWith({
        where: { isActive: true, categoryId: "cat_karbohidrat" },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          referencePrice: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it("should return empty array when no commodities match", async () => {
      prisma.itemCommodity.findMany.mockResolvedValue([]);

      const result = await service.findAllCommodities("nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("findCommodityById", () => {
    it("should return commodity with category when found", async () => {
      prisma.itemCommodity.findUnique.mockResolvedValue(mockCommodity);

      const result = await service.findCommodityById("com_beras");

      expect(result).toEqual(mockCommodity);
      expect(prisma.itemCommodity.findUnique).toHaveBeenCalledWith({
        where: { id: "com_beras" },
        select: {
          id: true,
          name: true,
          description: true,
          referencePrice: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it("should return null when commodity not found", async () => {
      prisma.itemCommodity.findUnique.mockResolvedValue(null);

      const result = await service.findCommodityById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("findCommodityByName", () => {
    it("should return commodity matching name with category", async () => {
      prisma.itemCommodity.findFirst.mockResolvedValue(mockCommodity);

      const result = await service.findCommodityByName("Beras");

      expect(result).toEqual(mockCommodity);
      expect(prisma.itemCommodity.findFirst).toHaveBeenCalledWith({
        where: { name: "Beras", isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          referencePrice: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it("should return null when name not found", async () => {
      prisma.itemCommodity.findFirst.mockResolvedValue(null);

      const result = await service.findCommodityByName("Nonexistent");

      expect(result).toBeNull();
    });
  });
});
