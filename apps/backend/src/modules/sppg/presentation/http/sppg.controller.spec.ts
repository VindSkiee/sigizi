import { Test, TestingModule } from "@nestjs/testing";
import { SppgController } from "./sppg.controller";
import { SppgService } from "../../application/services/sppg.service";
import { Sppg } from "../../domain/entities/sppg.entity";
import { PaginationDto } from "../../../../core/dto/pagination.dto";

function makePagination(overrides?: Partial<PaginationDto>): PaginationDto {
  const dto = new PaginationDto();
  if (overrides?.page !== undefined) (dto as any).page = overrides.page;
  if (overrides?.limit !== undefined) (dto as any).limit = overrides.limit;
  return dto;
}

describe("SppgController", () => {
  let controller: SppgController;
  let service: jest.Mocked<SppgService>;

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

  beforeEach(async () => {
    const mockService: jest.Mocked<SppgService> = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SppgController],
      providers: [{ provide: SppgService, useValue: mockService }],
    }).compile();

    controller = module.get<SppgController>(SppgController);
    service = module.get(SppgService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated SPPGs", async () => {
      const paginatedResult = {
        items: [mockSppg],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(makePagination());

      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(makePagination());
    });
  });

  describe("findOne", () => {
    it("should return SPPG by ID", async () => {
      service.findOne.mockResolvedValue(mockSppg);

      const result = await controller.findOne("sppg-1");

      expect(result).toEqual(mockSppg);
      expect(service.findOne).toHaveBeenCalledWith("sppg-1");
    });
  });

  describe("create", () => {
    it("should create SPPG", async () => {
      const dto = {
        name: "SPPG Purwakarta",
        province: "Jawa Barat",
        regency: "Purwakarta",
        district: "Purwakarta",
      };
      service.create.mockResolvedValue(mockSppg);

      const result = await controller.create(dto);

      expect(result).toEqual(mockSppg);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe("update", () => {
    it("should update SPPG", async () => {
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
      service.update.mockResolvedValue(updatedSppg);

      const result = await controller.update("sppg-1", {
        name: "SPPG Updated",
      });

      expect(result).toEqual(updatedSppg);
      expect(service.update).toHaveBeenCalledWith("sppg-1", {
        name: "SPPG Updated",
      });
    });
  });

  describe("remove", () => {
    it("should delete SPPG", async () => {
      service.remove.mockResolvedValue(undefined as any);

      await controller.remove("sppg-1");

      expect(service.remove).toHaveBeenCalledWith("sppg-1");
    });
  });
});
