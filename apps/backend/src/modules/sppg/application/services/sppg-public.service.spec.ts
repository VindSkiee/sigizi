import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { SppgPublicService } from "./sppg-public.service";
import { PrismaService } from "../../../../database/prisma.service";
import { PaginationDto } from "../../../../core/dto/pagination.dto";

function makePagination(page = 1, limit = 20): PaginationDto {
  const dto = new PaginationDto();
  dto.page = page;
  dto.limit = limit;
  return dto;
}

describe("SppgPublicService", () => {
  let service: SppgPublicService;
  let prisma: jest.Mocked<any>;

  const mockSppgRecord = {
    id: "sppg-1",
    name: "SPPG Purwakarta",
    address: "Jl. Merdeka No. 1",
    province: "Jawa Barat",
    regency: "Purwakarta",
    district: "Purwakarta",
    village: null,
    latitude: -6.5563,
    longitude: 107.4439,
    _count: { batches: 5, beneficiaries: 10 },
  };

  const mockBatchRecord = {
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
    const mockPrisma = {
      sppg: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      batch: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SppgPublicService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SppgPublicService>(SppgPublicService);
    prisma = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll - region mode", () => {
    it("should filter by province", async () => {
      prisma.sppg.findMany.mockResolvedValue([mockSppgRecord]);
      prisma.sppg.count.mockResolvedValue(1);

      const result = await service.findAll(makePagination(), {
        province: "Jawa Barat",
      });

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(prisma.sppg.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            province: expect.objectContaining({
              equals: "JAWA_BARAT",
              mode: "insensitive",
            }),
          }),
        }),
      );
    });

    it("should filter by regency", async () => {
      prisma.sppg.findMany.mockResolvedValue([mockSppgRecord]);
      prisma.sppg.count.mockResolvedValue(1);

      await service.findAll(makePagination(), { regency: "Purwakarta" });

      expect(prisma.sppg.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            regency: expect.objectContaining({
              equals: "PURWAKARTA",
              mode: "insensitive",
            }),
          }),
        }),
      );
    });

    it("should return empty when no matches", async () => {
      prisma.sppg.findMany.mockResolvedValue([]);
      prisma.sppg.count.mockResolvedValue(0);

      const result = await service.findAll(makePagination(), {
        province: "Nonexistent",
      });

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it("should include batchCount and totalBeneficiary from _count", async () => {
      prisma.sppg.findMany.mockResolvedValue([mockSppgRecord]);
      prisma.sppg.count.mockResolvedValue(1);

      const result = await service.findAll(makePagination(), {
        province: "Jawa Barat",
      });

      expect(result.items[0].batchCount).toBe(5);
      expect(result.items[0].totalBeneficiary).toBe(10);
    });
  });

  describe("findAll - GPS mode", () => {
    it("should filter by GPS radius", async () => {
      const nearbySppg = {
        ...mockSppgRecord,
        latitude: -6.56,
        longitude: 107.44,
      };
      prisma.sppg.findMany.mockResolvedValue([nearbySppg]);

      const result = await service.findAll(makePagination(), {
        latitude: -6.5563,
        longitude: 107.4439,
        radiusKm: 25,
      });

      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });
  });

  describe("findAll - filter validation", () => {
    it("should throw when both admin and GPS filters provided", async () => {
      await expect(
        service.findAll(makePagination(), {
          province: "Jawa Barat",
          latitude: -6.5563,
          longitude: 107.4439,
        }),
      ).rejects.toThrow("Filter admin");
    });
  });

  describe("findOne", () => {
    it("should return SPPG with batch summary", async () => {
      const sppgWithRelations = {
        ...mockSppgRecord,
        beneficiaries: [{ totalBeneficiary: 100 }],
        batches: [mockBatchRecord],
        _count: { batches: 1, beneficiaries: 1 },
      };
      prisma.sppg.findUnique.mockResolvedValue(sppgWithRelations);

      const result = await service.findOne("sppg-1");

      expect(result).toBeDefined();
      expect((result as any).id).toBe("sppg-1");
      expect((result as any).batchCount).toBe(1);
      expect((result as any).totalPortions).toBe(100);
      expect((result as any).totalBeneficiary).toBe(100);
    });

    it("should throw NotFoundException when not found", async () => {
      prisma.sppg.findUnique.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findBatches", () => {
    it("should return batches for a SPPG", async () => {
      prisma.batch.findMany.mockResolvedValue([mockBatchRecord]);
      prisma.batch.count.mockResolvedValue(1);

      const result = await service.findBatches("sppg-1", makePagination());

      expect(result.items).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("should filter by status when provided", async () => {
      prisma.batch.findMany.mockResolvedValue([mockBatchRecord]);
      prisma.batch.count.mockResolvedValue(1);

      await service.findBatches("sppg-1", makePagination(), "ACTIVE");

      expect(prisma.batch.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "ACTIVE" }),
        }),
      );
    });

    it("should return empty when no batches match", async () => {
      prisma.batch.findMany.mockResolvedValue([]);
      prisma.batch.count.mockResolvedValue(0);

      const result = await service.findBatches(
        "sppg-1",
        makePagination(),
        "COMPLETED",
      );

      expect(result.items).toEqual([]);
    });
  });
});
