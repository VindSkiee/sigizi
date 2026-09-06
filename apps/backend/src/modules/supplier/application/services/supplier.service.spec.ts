import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { SupplierService } from "./supplier.service";
import { SUPPLIER_REPOSITORY } from "../../domain";
import type { SupplierRepository } from "../../domain";
import { Supplier } from "../../domain/entities/supplier.entity";
import { PaginationDto } from "../../../../core/dto/pagination.dto";
import { CategoryService } from "../../../category/category.service";

function makePagination(page = 1, limit = 20): PaginationDto {
  const dto = new PaginationDto();
  dto.page = page;
  dto.limit = limit;
  return dto;
}

describe("SupplierService", () => {
  let service: SupplierService;
  let repository: jest.Mocked<SupplierRepository>;
  let categoryService: jest.Mocked<CategoryService>;

  const mockSupplier = new Supplier(
    "sup-1",
    "UD. Sumber Rejeki",
    "NIB12345",
    "08123456789",
    "Jl. Merdeka No. 1",
    "Jawa Barat",
    "Purwakarta",
    "Purwakarta",
    null,
    null,
    -6.5563,
    107.4439,
    false,
    null,
    null,
    true,
    new Date("2026-01-01"),
    new Date("2026-01-01"),
  );

  const createDto = {
    name: "UD. Sumber Rejeki",
    nib: "NIB12345",
    province: "Jawa Barat",
    regency: "Purwakarta",
  };

  beforeEach(async () => {
    const mockRepository: jest.Mocked<SupplierRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByNib: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findItems: jest.fn(),
      findItemById: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      hasItemReferences: jest.fn(),
      removeItem: jest.fn(),
    };

    const mockCategoryService: jest.Mocked<CategoryService> = {
      findAllCategories: jest.fn(),
      findCategoryById: jest.fn(),
      findCategoryByName: jest.fn(),
      findAllCommodities: jest.fn(),
      findCommodityById: jest.fn(),
      findCommodityByName: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        { provide: SUPPLIER_REPOSITORY, useValue: mockRepository },
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
    repository = module.get(SUPPLIER_REPOSITORY);
    categoryService = module.get(CategoryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated items", async () => {
      repository.findAll.mockResolvedValue([mockSupplier]);
      repository.count.mockResolvedValue(1);

      const result = await service.findAll(makePagination());

      expect(result.items).toEqual([mockSupplier]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it("should use default page=1 and limit=20", async () => {
      repository.findAll.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      const result = await service.findAll(makePagination());

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });

    it("should pass search to repository", async () => {
      repository.findAll.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      await service.findAll(makePagination(), "sumber");

      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: "sumber" }),
      );
    });

    it("should return empty array when no suppliers exist", async () => {
      repository.findAll.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      const result = await service.findAll(makePagination());

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("findOne", () => {
    it("should return supplier when found", async () => {
      repository.findById.mockResolvedValue(mockSupplier);

      const result = await service.findOne("sup-1");

      expect(result).toEqual(mockSupplier);
      expect(repository.findById).toHaveBeenCalledWith("sup-1");
    });

    it("should throw NotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findByNib", () => {
    it("should delegate to repository.findByNib", async () => {
      repository.findByNib.mockResolvedValue(mockSupplier);

      const result = await service.findByNib("NIB12345");

      expect(result).toEqual(mockSupplier);
      expect(repository.findByNib).toHaveBeenCalledWith("NIB12345");
    });
  });

  describe("create", () => {
    it("should create when NIB is unique", async () => {
      repository.findByNib.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockSupplier);

      const result = await service.create(createDto);

      expect(result).toEqual(mockSupplier);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it("should throw ConflictException when NIB already exists", async () => {
      repository.findByNib.mockResolvedValue(mockSupplier);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("update", () => {
    it("should update when found", async () => {
      const updatedSupplier = new Supplier(
        "sup-1",
        "UD. Updated",
        "NIB12345",
        "08123456789",
        "Jl. Updated",
        "Jawa Barat",
        "Purwakarta",
        "Purwakarta",
        null,
        null,
        null,
        null,
        false,
        null,
        null,
        true,
        new Date("2026-01-01"),
        new Date("2026-01-02"),
      );
      repository.findById.mockResolvedValue(mockSupplier);
      repository.update.mockResolvedValue(updatedSupplier);

      const result = await service.update("sup-1", { name: "UD. Updated" });

      expect(result).toEqual(updatedSupplier);
      expect(repository.update).toHaveBeenCalledWith("sup-1", {
        name: "UD. Updated",
      });
    });

    it("should throw NotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update("nonexistent", { name: "X" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateProfile", () => {
    it("should update profile when found", async () => {
      repository.findById.mockResolvedValue(mockSupplier);
      repository.update.mockResolvedValue(mockSupplier);

      await service.updateProfile("sup-1", { name: "UD. Updated" });

      expect(repository.update).toHaveBeenCalledWith("sup-1", {
        name: "UD. Updated",
      });
    });

    it("should throw NotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateProfile("nonexistent", { name: "X" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete when found", async () => {
      repository.findById.mockResolvedValue(mockSupplier);
      repository.delete.mockResolvedValue(undefined);

      await service.remove("sup-1");

      expect(repository.delete).toHaveBeenCalledWith("sup-1");
    });

    it("should throw NotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findItems", () => {
    it("should return items for supplier", async () => {
      const mockItems = [
        {
          id: "item-1",
          name: "Beras",
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
          commodityId: null,
          commodity: null,
          supplierId: "sup-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      repository.findById.mockResolvedValue(mockSupplier);
      repository.findItems.mockResolvedValue(mockItems as any);

      const result = await service.findItems("sup-1");

      expect(result).toEqual(mockItems);
      expect(repository.findItems).toHaveBeenCalledWith("sup-1");
    });
  });

  describe("addItem", () => {
    it("should add item with timestamps", async () => {
      const mockItem = {
        id: "item-1",
        name: "Beras",
        unit: "kg",
        basePrice: 12000,
        supplierId: "sup-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.findById.mockResolvedValue(mockSupplier);
      repository.addItem.mockResolvedValue(mockItem as any);

      const dto = {
        name: "Beras",
        unit: "kg",
        basePrice: 12000,
        stock: 50,
        commodityId: "com-1",
      };
      await service.addItem("sup-1", dto);

      expect(repository.addItem).toHaveBeenCalledWith(
        "sup-1",
        expect.objectContaining({
          name: "Beras",
          unit: "kg",
          basePrice: 12000,
          priceUpdatedAt: expect.any(Date),
          stockUpdatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe("updateItem", () => {
    it("should update item when found", async () => {
      const mockItem = {
        id: "item-1",
        name: "Beras",
        basePrice: 13000,
        supplierId: "sup-1",
      };
      repository.findItemById.mockResolvedValue(mockItem as any);
      repository.updateItem.mockResolvedValue(mockItem as any);

      await service.updateItem("item-1", { basePrice: 13000 });

      expect(repository.updateItem).toHaveBeenCalledWith(
        "item-1",
        expect.objectContaining({
          basePrice: 13000,
          priceUpdatedAt: expect.any(Date),
        }),
      );
    });

    it("should set stockUpdatedAt when stock changes", async () => {
      const mockItem = { id: "item-1", stock: 50, supplierId: "sup-1" };
      repository.findItemById.mockResolvedValue(mockItem as any);
      repository.updateItem.mockResolvedValue(mockItem as any);

      await service.updateItem("item-1", { stock: 50 });

      expect(repository.updateItem).toHaveBeenCalledWith(
        "item-1",
        expect.objectContaining({
          stock: 50,
          stockUpdatedAt: expect.any(Date),
        }),
      );
    });

    it("should throw NotFoundException when item not found", async () => {
      repository.findItemById.mockResolvedValue(null);

      await expect(
        service.updateItem("nonexistent", { name: "X" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeItem", () => {
    it("should soft-delete when references exist", async () => {
      repository.hasItemReferences.mockResolvedValue({
        hasReferences: true,
        reasons: ["1 order tercatat"],
      });
      repository.updateItem.mockResolvedValue({} as any);

      await service.removeItem("item-1");

      expect(repository.updateItem).toHaveBeenCalledWith(
        "item-1",
        expect.objectContaining({
          isAvailable: false,
          deletedAt: expect.any(Date),
        }),
      );
      expect(repository.removeItem).not.toHaveBeenCalled();
    });

    it("should hard-delete when no references", async () => {
      repository.hasItemReferences.mockResolvedValue({
        hasReferences: false,
        reasons: [],
      });
      repository.removeItem.mockResolvedValue(undefined);

      await service.removeItem("item-1");

      expect(repository.removeItem).toHaveBeenCalledWith("item-1");
      expect(repository.updateItem).not.toHaveBeenCalled();
    });
  });

  describe("findTaxonomy", () => {
    it("should delegate to categoryService.findAllCategories", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Karbohidrat", commodities: [] },
      ];
      categoryService.findAllCategories.mockResolvedValue(
        mockCategories as any,
      );

      const result = await service.findTaxonomy();

      expect(result).toEqual(mockCategories);
      expect(categoryService.findAllCategories).toHaveBeenCalledTimes(1);
    });
  });
});
