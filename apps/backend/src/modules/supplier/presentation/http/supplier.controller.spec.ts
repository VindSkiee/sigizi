import { Test, TestingModule } from "@nestjs/testing";
import { SupplierController } from "./supplier.controller";
import { SupplierService } from "../../application/services/supplier.service";

describe("SupplierController", () => {
  let controller: SupplierController;
  let service: jest.Mocked<SupplierService>;

  const mockSupplier = {
    id: "sup-1",
    name: "UD. Sumber Rejeki",
    nib: "NIB12345",
  };

  beforeEach(async () => {
    const mockService: jest.Mocked<SupplierService> = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByNib: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateProfile: jest.fn(),
      remove: jest.fn(),
      findItems: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      findTaxonomy: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierController],
      providers: [{ provide: SupplierService, useValue: mockService }],
    }).compile();

    controller = module.get<SupplierController>(SupplierController);
    service = module.get(SupplierService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should call supplierService.findAll with pagination and search", async () => {
      const pagination = { page: 1, limit: 20 } as any;
      service.findAll.mockResolvedValue({
        items: [mockSupplier],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const result = await controller.findAll(pagination, "sumber");

      expect(result.items).toEqual([mockSupplier]);
      expect(service.findAll).toHaveBeenCalledWith(pagination, "sumber");
    });

    it("should call findAll without search when not provided", async () => {
      const pagination = { page: 1, limit: 20 } as any;
      service.findAll.mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      await controller.findAll(pagination);

      expect(service.findAll).toHaveBeenCalledWith(pagination, undefined);
    });
  });

  describe("getProfile", () => {
    it("should call findOne with supplierId from req.user", async () => {
      service.findOne.mockResolvedValue(mockSupplier as any);

      const req = { user: { supplierId: "sup-1" } };
      const result = await controller.getProfile(req);

      expect(result).toEqual(mockSupplier);
      expect(service.findOne).toHaveBeenCalledWith("sup-1");
    });
  });

  describe("getTaxonomy", () => {
    it("should call supplierService.findTaxonomy", async () => {
      const mockCategories = [
        { id: "cat-1", name: "Karbohidrat", commodities: [] },
      ];
      service.findTaxonomy.mockResolvedValue(mockCategories as any);

      const result = await controller.getTaxonomy();

      expect(result).toEqual(mockCategories);
      expect(service.findTaxonomy).toHaveBeenCalledTimes(1);
    });
  });

  describe("findOne", () => {
    it("should call findOne with param id", async () => {
      service.findOne.mockResolvedValue(mockSupplier as any);

      const result = await controller.findOne("sup-1");

      expect(result).toEqual(mockSupplier);
      expect(service.findOne).toHaveBeenCalledWith("sup-1");
    });
  });

  describe("create", () => {
    it("should call supplierService.create with dto", async () => {
      const dto = {
        name: "UD. Sumber Rejeki",
        nib: "NIB12345",
        province: "Jawa Barat",
        regency: "Purwakarta",
      };
      service.create.mockResolvedValue(mockSupplier as any);

      const result = await controller.create(dto);

      expect(result).toEqual(mockSupplier);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("updateProfile", () => {
    it("should call updateProfile with supplierId and dto", async () => {
      const dto = { name: "UD. Updated" };
      service.updateProfile.mockResolvedValue(mockSupplier as any);

      const req = { user: { supplierId: "sup-1" } };
      const result = await controller.updateProfile(req, dto);

      expect(result).toEqual(mockSupplier);
      expect(service.updateProfile).toHaveBeenCalledWith("sup-1", dto);
    });

    it("should attach profileImage when file is uploaded", async () => {
      const dto = { name: "UD. Updated" };
      const file = { filename: "1234567890-image.jpg" } as Express.Multer.File;
      service.updateProfile.mockResolvedValue(mockSupplier as any);

      const req = { user: { supplierId: "sup-1" } };
      await controller.updateProfile(req, dto, file);

      expect(service.updateProfile).toHaveBeenCalledWith("sup-1", {
        ...dto,
        profileImage: "/uploads/profiles/1234567890-image.jpg",
      });
    });

    it("should not set profileImage when no file uploaded", async () => {
      const dto = { name: "UD. Updated" };
      service.updateProfile.mockResolvedValue(mockSupplier as any);

      const req = { user: { supplierId: "sup-1" } };
      await controller.updateProfile(req, dto, undefined);

      expect(service.updateProfile).toHaveBeenCalledWith("sup-1", dto);
    });
  });

  describe("update", () => {
    it("should call update with id and dto", async () => {
      const dto = { name: "UD. Updated" };
      service.update.mockResolvedValue(mockSupplier as any);

      const result = await controller.update("sup-1", dto);

      expect(result).toEqual(mockSupplier);
      expect(service.update).toHaveBeenCalledWith("sup-1", dto);
    });
  });

  describe("remove", () => {
    it("should call remove with id", async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove("sup-1");

      expect(service.remove).toHaveBeenCalledWith("sup-1");
    });
  });

  describe("findItems", () => {
    it("should call findItems with supplier id", async () => {
      const mockItems = [{ id: "item-1", name: "Beras" }];
      service.findItems.mockResolvedValue(mockItems as any);

      const result = await controller.findItems("sup-1");

      expect(result).toEqual(mockItems);
      expect(service.findItems).toHaveBeenCalledWith("sup-1");
    });
  });

  describe("addItem", () => {
    it("should call addItem with supplier id and dto", async () => {
      const dto = {
        name: "Beras",
        unit: "kg",
        basePrice: 12000,
        stock: 50,
        commodityId: "com-1",
      };
      const mockItem = { id: "item-1", name: "Beras" };
      service.addItem.mockResolvedValue(mockItem as any);

      const result = await controller.addItem("sup-1", dto);

      expect(result).toEqual(mockItem);
      expect(service.addItem).toHaveBeenCalledWith("sup-1", dto);
    });

    it("should attach image when file is uploaded", async () => {
      const dto = {
        name: "Beras",
        unit: "kg",
        basePrice: 12000,
        stock: 50,
        commodityId: "com-1",
      };
      const file = {
        filename: "1234567890-product.jpg",
      } as Express.Multer.File;
      service.addItem.mockResolvedValue({ id: "item-1" } as any);

      await controller.addItem("sup-1", dto, file);

      expect(service.addItem).toHaveBeenCalledWith("sup-1", {
        ...dto,
        image: "/uploads/items/1234567890-product.jpg",
      });
    });

    it("should not set image when no file uploaded", async () => {
      const dto = {
        name: "Beras",
        unit: "kg",
        basePrice: 12000,
        stock: 50,
        commodityId: "com-1",
      };
      service.addItem.mockResolvedValue({ id: "item-1" } as any);

      await controller.addItem("sup-1", dto, undefined);

      expect(service.addItem).toHaveBeenCalledWith("sup-1", dto);
    });
  });

  describe("updateItem", () => {
    it("should call updateItem with itemId and dto", async () => {
      const dto = { basePrice: 13000 };
      const mockItem = { id: "item-1", basePrice: 13000 };
      service.updateItem.mockResolvedValue(mockItem as any);

      const result = await controller.updateItem("sup-1", "item-1", dto);

      expect(result).toEqual(mockItem);
      expect(service.updateItem).toHaveBeenCalledWith("item-1", dto);
    });

    it("should attach image when file is uploaded", async () => {
      const dto = { basePrice: 13000 };
      const file = {
        filename: "1234567890-updated.jpg",
      } as Express.Multer.File;
      service.updateItem.mockResolvedValue({ id: "item-1" } as any);

      await controller.updateItem("sup-1", "item-1", dto, file);

      expect(service.updateItem).toHaveBeenCalledWith("item-1", {
        ...dto,
        image: "/uploads/items/1234567890-updated.jpg",
      });
    });
  });

  describe("removeItem", () => {
    it("should call removeItem with itemId", async () => {
      service.removeItem.mockResolvedValue(undefined);

      await controller.removeItem("item-1");

      expect(service.removeItem).toHaveBeenCalledWith("item-1");
    });
  });
});
