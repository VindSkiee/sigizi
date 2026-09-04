import { Test, TestingModule } from "@nestjs/testing";
import { CategoryController, CommodityController } from "./category.controller";
import { CategoryService } from "./category.service";

describe("CategoryController", () => {
  let controller: CategoryController;
  let service: jest.Mocked<CategoryService>;

  const mockCategory = {
    id: "cat_karbohidrat",
    name: "Karbohidrat",
    description: null,
    sortOrder: 1,
    isActive: true,
    commodities: [
      {
        id: "com_beras",
        name: "Beras",
        description: null,
        referencePrice: 15000,
      },
    ],
  };

  beforeEach(async () => {
    const mockService: jest.Mocked<CategoryService> = {
      findAllCategories: jest.fn(),
      findCategoryById: jest.fn(),
      findCategoryByName: jest.fn(),
      findAllCommodities: jest.fn(),
      findCommodityById: jest.fn(),
      findCommodityByName: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockService }],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get(CategoryService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all categories", async () => {
      service.findAllCategories.mockResolvedValue([mockCategory] as any);

      const result = await controller.findAll();

      expect(result).toEqual([mockCategory]);
      expect(service.findAllCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe("findOne", () => {
    it("should return category by ID", async () => {
      service.findCategoryById.mockResolvedValue(mockCategory as any);

      const result = await controller.findOne("cat_karbohidrat");

      expect(result).toEqual(mockCategory);
      expect(service.findCategoryById).toHaveBeenCalledWith("cat_karbohidrat");
    });
  });

  describe("findByName", () => {
    it("should return category by name", async () => {
      service.findCategoryByName.mockResolvedValue(mockCategory as any);

      const result = await controller.findByName("Karbohidrat");

      expect(result).toEqual(mockCategory);
      expect(service.findCategoryByName).toHaveBeenCalledWith("Karbohidrat");
    });
  });
});

describe("CommodityController", () => {
  let controller: CommodityController;
  let service: jest.Mocked<CategoryService>;

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

  beforeEach(async () => {
    const mockService: jest.Mocked<CategoryService> = {
      findAllCategories: jest.fn(),
      findCategoryById: jest.fn(),
      findCategoryByName: jest.fn(),
      findAllCommodities: jest.fn(),
      findCommodityById: jest.fn(),
      findCommodityByName: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommodityController],
      providers: [{ provide: CategoryService, useValue: mockService }],
    }).compile();

    controller = module.get<CommodityController>(CommodityController);
    service = module.get(CategoryService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all commodities without categoryId", async () => {
      service.findAllCommodities.mockResolvedValue([mockCommodity] as any);

      const result = await controller.findAll();

      expect(result).toEqual([mockCommodity]);
      expect(service.findAllCommodities).toHaveBeenCalledWith(undefined);
    });

    it("should pass categoryId when provided", async () => {
      service.findAllCommodities.mockResolvedValue([mockCommodity] as any);

      const result = await controller.findAll("cat_karbohidrat");

      expect(result).toEqual([mockCommodity]);
      expect(service.findAllCommodities).toHaveBeenCalledWith(
        "cat_karbohidrat",
      );
    });
  });

  describe("findOne", () => {
    it("should return commodity by ID", async () => {
      service.findCommodityById.mockResolvedValue(mockCommodity as any);

      const result = await controller.findOne("com_beras");

      expect(result).toEqual(mockCommodity);
      expect(service.findCommodityById).toHaveBeenCalledWith("com_beras");
    });
  });

  describe("findByName", () => {
    it("should return commodity by name", async () => {
      service.findCommodityByName.mockResolvedValue(mockCommodity as any);

      const result = await controller.findByName("Beras");

      expect(result).toEqual(mockCommodity);
      expect(service.findCommodityByName).toHaveBeenCalledWith("Beras");
    });
  });
});
