import { Test, TestingModule } from "@nestjs/testing";
import { PrismaSppgRepository } from "./sppg.repository";
import { PrismaService } from "../../../../database/prisma.service";
import { Sppg } from "../../domain/entities/sppg.entity";

describe("PrismaSppgRepository", () => {
  let repository: PrismaSppgRepository;
  let prisma: jest.Mocked<any>;

  const mockPrismaSppg = {
    id: "sppg-1",
    name: "SPPG Purwakarta",
    mitraId: null,
    address: "Jl. Merdeka No. 1",
    province: "Jawa Barat",
    regency: "Purwakarta",
    district: "Purwakarta",
    village: null,
    postalCode: null,
    latitude: -6.5563,
    longitude: 107.4439,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  beforeEach(async () => {
    const mockPrisma = {
      sppg: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaSppgRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get<PrismaSppgRepository>(PrismaSppgRepository);
    prisma = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("findAll", () => {
    it("should return array of SPPG entities", async () => {
      prisma.sppg.findMany.mockResolvedValue([mockPrismaSppg]);

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Sppg);
      expect(result[0].id).toBe("sppg-1");
    });

    it("should apply skip and take pagination", async () => {
      prisma.sppg.findMany.mockResolvedValue([]);

      await repository.findAll({ skip: 10, take: 5 });

      expect(prisma.sppg.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });

    it("should order by createdAt desc", async () => {
      prisma.sppg.findMany.mockResolvedValue([]);

      await repository.findAll();

      expect(prisma.sppg.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: "desc" } }),
      );
    });
  });

  describe("findById", () => {
    it("should return SPPG entity when found", async () => {
      prisma.sppg.findUnique.mockResolvedValue(mockPrismaSppg);

      const result = await repository.findById("sppg-1");

      expect(result).toBeInstanceOf(Sppg);
      expect(result!.id).toBe("sppg-1");
      expect(result!.name).toBe("SPPG Purwakarta");
    });

    it("should return null when not found", async () => {
      prisma.sppg.findUnique.mockResolvedValue(null);

      const result = await repository.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("count", () => {
    it("should return total count", async () => {
      prisma.sppg.count.mockResolvedValue(42);

      const result = await repository.count();

      expect(result).toBe(42);
    });
  });

  describe("create", () => {
    it("should create and return SPPG entity", async () => {
      prisma.sppg.create.mockResolvedValue(mockPrismaSppg);

      const result = await repository.create({
        name: "SPPG Purwakarta",
        province: "Jawa Barat",
        regency: "Purwakarta",
        district: "Purwakarta",
      });

      expect(result).toBeInstanceOf(Sppg);
      expect(prisma.sppg.create).toHaveBeenCalledWith({
        data: {
          name: "SPPG Purwakarta",
          mitraId: undefined,
          address: undefined,
          province: "Jawa Barat",
          regency: "Purwakarta",
          district: "Purwakarta",
          village: undefined,
          postalCode: undefined,
          latitude: undefined,
          longitude: undefined,
        },
      });
    });
  });

  describe("update", () => {
    it("should update and return SPPG entity", async () => {
      const updatedRecord = { ...mockPrismaSppg, name: "SPPG Updated" };
      prisma.sppg.update.mockResolvedValue(updatedRecord);

      const result = await repository.update("sppg-1", {
        name: "SPPG Updated",
      });

      expect(result).toBeInstanceOf(Sppg);
      expect(result.name).toBe("SPPG Updated");
      expect(prisma.sppg.update).toHaveBeenCalledWith({
        where: { id: "sppg-1" },
        data: { name: "SPPG Updated" },
      });
    });
  });

  describe("delete", () => {
    it("should call prisma.sppg.delete", async () => {
      prisma.sppg.delete.mockResolvedValue(undefined);

      await repository.delete("sppg-1");

      expect(prisma.sppg.delete).toHaveBeenCalledWith({
        where: { id: "sppg-1" },
      });
    });
  });
});
