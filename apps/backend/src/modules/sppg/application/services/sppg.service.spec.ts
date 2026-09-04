import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { SppgService } from "./sppg.service";
import { SPPG_REPOSITORY } from "../../domain";
import type { SppgRepository } from "../../domain";
import { Sppg } from "../../domain/entities/sppg.entity";
import { PaginationDto } from "../../../../core/dto/pagination.dto";

function makePagination(page = 1, limit = 20): PaginationDto {
  const dto = new PaginationDto();
  dto.page = page;
  dto.limit = limit;
  return dto;
}

describe("SppgService", () => {
  let service: SppgService;
  let repository: jest.Mocked<SppgRepository>;

  const mockSppg = new Sppg(
    "sppg-1",
    "SPPG Purwakarta",
    null,
    "Jl. Merdeka No. 1",
    "Jawa Barat",
    "Purwakarta",
    "Purwakarta",
    null,
    null,
    -6.5563,
    107.4439,
    new Date("2026-01-01"),
    new Date("2026-01-01"),
  );

  const createDto = {
    name: "SPPG Purwakarta",
    province: "Jawa Barat",
    regency: "Purwakarta",
    district: "Purwakarta",
  };

  beforeEach(async () => {
    const mockRepository: jest.Mocked<SppgRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SppgService,
        { provide: SPPG_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<SppgService>(SppgService);
    repository = module.get(SPPG_REPOSITORY);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated items", async () => {
      repository.findAll.mockResolvedValue([mockSppg]);
      repository.count.mockResolvedValue(1);

      const result = await service.findAll(makePagination());

      expect(result.items).toEqual([mockSppg]);
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

    it("should call repository.findAll with skip and take", async () => {
      repository.findAll.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      await service.findAll(makePagination(2, 10));

      expect(repository.findAll).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
      });
    });

    it("should return empty array when no SPPGs exist", async () => {
      repository.findAll.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      const result = await service.findAll(makePagination());

      expect(result.items).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("findOne", () => {
    it("should return SPPG when found", async () => {
      repository.findById.mockResolvedValue(mockSppg);

      const result = await service.findOne("sppg-1");

      expect(result).toEqual(mockSppg);
      expect(repository.findById).toHaveBeenCalledWith("sppg-1");
    });

    it("should throw NotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should delegate to repository.create", async () => {
      repository.create.mockResolvedValue(mockSppg);

      const result = await service.create(createDto);

      expect(result).toEqual(mockSppg);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("update", () => {
    it("should update when found", async () => {
      const updatedSppg = new Sppg(
        "sppg-1",
        "SPPG Updated",
        null,
        null,
        "Jawa Barat",
        "Purwakarta",
        "Purwakarta",
        null,
        null,
        null,
        null,
        new Date("2026-01-01"),
        new Date("2026-01-02"),
      );
      repository.findById.mockResolvedValue(mockSppg);
      repository.update.mockResolvedValue(updatedSppg);

      const result = await service.update("sppg-1", { name: "SPPG Updated" });

      expect(result).toEqual(updatedSppg);
      expect(repository.update).toHaveBeenCalledWith("sppg-1", {
        name: "SPPG Updated",
      });
    });

    it("should throw NotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update("nonexistent", { name: "X" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete when found", async () => {
      repository.findById.mockResolvedValue(mockSppg);
      repository.delete.mockResolvedValue(undefined);

      await service.remove("sppg-1");

      expect(repository.delete).toHaveBeenCalledWith("sppg-1");
    });

    it("should throw NotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
