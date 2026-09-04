import { Test, TestingModule } from "@nestjs/testing";
import { SppgPublicController } from "./sppg-public.controller";
import { SppgPublicService } from "../../application/services/sppg-public.service";
import { SppgSearchQueryDto } from "../../application/dto/sppg-search-query.dto";

function makeSearchQuery(
  overrides?: Partial<SppgSearchQueryDto>,
): SppgSearchQueryDto {
  const dto = new SppgSearchQueryDto();
  Object.assign(dto, overrides);
  return dto;
}

describe("SppgPublicController", () => {
  let controller: SppgPublicController;
  let service: jest.Mocked<SppgPublicService>;

  const mockSppgPublic = {
    id: "sppg-1",
    name: "SPPG Purwakarta",
    address: "Jl. Merdeka No. 1",
    province: "Jawa Barat",
    regency: "Purwakarta",
    district: "Purwakarta",
    village: null,
    latitude: -6.5563,
    longitude: 107.4439,
    batchCount: 5,
    totalBeneficiary: 100,
    totalPortions: 500,
    batches: [],
  };

  const mockBatch = {
    id: "batch-1",
    batchNumber: "BATCH-20260709-001",
    date: new Date("2026-07-09"),
    menu: "Nasi Ayam Bakar",
    status: "ACTIVE",
    costPerPortion: 8000,
    totalCost: 800000,
    beneficiaryCount: 100,
  };

  beforeEach(async () => {
    const mockService: jest.Mocked<SppgPublicService> = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findBatches: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SppgPublicController],
      providers: [{ provide: SppgPublicService, useValue: mockService }],
    }).compile();

    controller = module.get<SppgPublicController>(SppgPublicController);
    service = module.get(SppgPublicService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return SPPGs with region filter", async () => {
      const paginatedResult = {
        items: [mockSppgPublic],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(
        makeSearchQuery({ province: "Jawa Barat", page: 1, limit: 20 }),
      );

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalled();
    });

    it("should return SPPGs with GPS filter", async () => {
      const paginatedResult = {
        items: [mockSppgPublic],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(
        makeSearchQuery({
          latitude: -6.5563,
          longitude: 107.4439,
          radiusKm: 25,
          page: 1,
          limit: 20,
        }),
      );

      expect(result).toEqual(paginatedResult);
    });
  });

  describe("findBatches", () => {
    it("should return batches for a SPPG", async () => {
      const paginatedResult = {
        items: [mockBatch],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      service.findBatches.mockResolvedValue(paginatedResult);

      const result = await controller.findBatches(
        "sppg-1",
        makeSearchQuery({ page: 1, limit: 20 }),
      );

      expect(result).toEqual(paginatedResult);
      expect(service.findBatches).toHaveBeenCalledWith(
        "sppg-1",
        expect.objectContaining({ page: 1, limit: 20 }),
        undefined,
      );
    });

    it("should pass status filter when provided", async () => {
      service.findBatches.mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      await controller.findBatches(
        "sppg-1",
        makeSearchQuery({ page: 1, limit: 20, status: "ACTIVE" }),
      );

      expect(service.findBatches).toHaveBeenCalledWith(
        "sppg-1",
        expect.any(Object),
        "ACTIVE",
      );
    });
  });

  describe("findOne", () => {
    it("should return SPPG profile", async () => {
      service.findOne.mockResolvedValue(mockSppgPublic);

      const result = await controller.findOne("sppg-1");

      expect(result).toEqual(mockSppgPublic);
      expect(service.findOne).toHaveBeenCalledWith("sppg-1");
    });
  });
});
