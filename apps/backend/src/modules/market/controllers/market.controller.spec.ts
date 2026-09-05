import { Test, TestingModule } from "@nestjs/testing";
import { MarketController } from "./market.controller";
import { MarketService } from "../services/market.service";

describe("MarketController", () => {
  let controller: MarketController;
  let service: jest.Mocked<MarketService>;

  const mockFilter = {
    province: null,
    regency: null,
    district: null,
    latitude: null,
    longitude: null,
    radiusKm: null,
  };

  const emptyStats = {
    raw: { min: 0, max: 0, median: 0, mean: 0, count: 0 },
    clean: { min: 0, max: 0, median: 0, mean: 0, count: 0 },
  };

  beforeEach(async () => {
    const mockService: jest.Mocked<MarketService> = {
      getMarketPrices: jest.fn(),
      getMarketPricesRaw: jest.fn(),
      getItemDetail: jest.fn(),
      getDistinctMarkets: jest.fn(),
      getSupplierRegions: jest.fn(),
      getAnomalies: jest.fn(),
      getHETSuggestion: jest.fn(),
      getMarketContextForItem: jest.fn(),
      validatePrice: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketController],
      providers: [{ provide: MarketService, useValue: mockService }],
    }).compile();

    controller = module.get<MarketController>(MarketController);
    service = module.get(MarketService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getRegions", () => {
    it("should delegate to getSupplierRegions with page and limit", async () => {
      const response = {
        data: [{ province: "JAWA_BARAT", regencies: ["PURWAKARTA"] }],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      service.getSupplierRegions.mockResolvedValue(response as any);

      await controller.getRegions(1, 20);

      expect(service.getSupplierRegions).toHaveBeenCalledWith(1, 20);
    });

    it("should pass undefined page/limit when not provided", async () => {
      service.getSupplierRegions.mockResolvedValue({
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      } as any);

      await controller.getRegions(undefined, undefined);

      expect(service.getSupplierRegions).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });

  describe("getMarkets", () => {
    it("should delegate to getDistinctMarkets with all params", async () => {
      service.getDistinctMarkets.mockResolvedValue({
        data: [{ name: "Pasar Cibeunying", supplierCount: 2, itemCount: 5 }],
        meta: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      } as any);

      await controller.getMarkets("Jawa Barat", "Purwakarta", "Beras", 1, 20);

      expect(service.getDistinctMarkets).toHaveBeenCalledWith(
        "Jawa Barat",
        "Purwakarta",
        "Beras",
        1,
        20,
      );
    });

    it("should handle undefined item", async () => {
      service.getDistinctMarkets.mockResolvedValue({
        data: [],
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      } as any);

      await controller.getMarkets("Jawa Barat", "Purwakarta", undefined, 1, 20);

      expect(service.getDistinctMarkets).toHaveBeenCalledWith(
        "Jawa Barat",
        "Purwakarta",
        undefined,
        1,
        20,
      );
    });
  });

  describe("getPrices", () => {
    it("should strip item from filter and delegate to getMarketPrices", async () => {
      service.getMarketPrices.mockResolvedValue({
        item: "Beras Premium",
        filter: mockFilter,
        scopeUsed: "regency",
        sampleCount: 2,
        effectiveRadiusKm: null,
        statistics: emptyStats,
        iqrBounds: null,
        suppliers: [],
      } as any);

      await controller.getPrices({
        item: "Beras Premium",
        province: "Jawa Barat",
        regency: "Purwakarta",
      } as any);

      expect(service.getMarketPrices).toHaveBeenCalledWith("Beras Premium", {
        province: "Jawa Barat",
        regency: "Purwakarta",
      });
    });
  });

  describe("getAnomalies", () => {
    it("should delegate query directly to service", async () => {
      const query = {
        province: "Jawa Barat",
        regency: "Purwakarta",
        page: 1,
        limit: 20,
      };
      service.getAnomalies.mockResolvedValue({
        data: { filter: mockFilter, anomalies: [] },
        meta: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      } as any);

      await controller.getAnomalies(query as any);

      expect(service.getAnomalies).toHaveBeenCalledWith(query);
    });
  });

  describe("getHETSuggestion", () => {
    it("should strip item from filter and delegate", async () => {
      service.getHETSuggestion.mockResolvedValue({
        item: "Beras Premium",
        filter: mockFilter,
        scopeUsed: "master",
        het: 15000,
        basedOn: "master_reference_cold_start",
        statistics: emptyStats,
      } as any);

      await controller.getHETSuggestion({
        item: "Beras Premium",
        latitude: -6.5398,
        longitude: 107.4471,
      } as any);

      expect(service.getHETSuggestion).toHaveBeenCalledWith("Beras Premium", {
        latitude: -6.5398,
        longitude: 107.4471,
      });
    });
  });

  describe("validatePrice", () => {
    it("should wrap dto into filter and delegate to validatePrice", async () => {
      service.validatePrice.mockResolvedValue({
        status: "VALID",
        reason: "",
        recommendation: "",
        marketMedianSnapshot: 12000,
      });

      const result = await controller.validatePrice({
        itemName: "Beras Premium",
        proposedPrice: 12000,
        province: "Jawa Barat",
        regency: "Purwakarta",
      });

      expect(service.validatePrice).toHaveBeenCalledWith(
        "Beras Premium",
        12000,
        {
          province: "Jawa Barat",
          regency: "Purwakarta",
          district: undefined,
          latitude: undefined,
          longitude: undefined,
          marketName: undefined,
        },
      );
    });

    it("should return wrapped response with itemName, proposedPrice, validation", async () => {
      const validation = {
        status: "VALID" as const,
        reason: "",
        recommendation: "",
        marketMedianSnapshot: 12000,
      };
      service.validatePrice.mockResolvedValue(validation);

      const result = await controller.validatePrice({
        itemName: "Beras Premium",
        proposedPrice: 12000,
      });

      expect(result).toEqual({
        itemName: "Beras Premium",
        proposedPrice: 12000,
        validation,
      });
    });

    it("should pass GPS coordinates in filter", async () => {
      service.validatePrice.mockResolvedValue({
        status: "VALID",
        reason: "",
        recommendation: "",
        marketMedianSnapshot: 12000,
      });

      await controller.validatePrice({
        itemName: "Beras",
        proposedPrice: 15000,
        latitude: -6.5398,
        longitude: 107.4471,
      });

      expect(service.validatePrice).toHaveBeenCalledWith(
        "Beras",
        15000,
        expect.objectContaining({
          latitude: -6.5398,
          longitude: 107.4471,
        }),
      );
    });
  });

  describe("getItemDetail", () => {
    it("should delegate to getItemDetail with id", async () => {
      service.getItemDetail.mockResolvedValue({
        item: { id: "item-1", name: "Beras Premium" },
        supplier: { id: "sup-1", name: "UD. Sumber Rejeki" },
      } as any);

      await controller.getItemDetail("item-1");

      expect(service.getItemDetail).toHaveBeenCalledWith("item-1");
    });

    it("should return the service response directly", async () => {
      const response = {
        item: { id: "item-1", name: "Beras Premium" },
        supplier: { id: "sup-1", name: "UD. Sumber Rejeki" },
      };
      service.getItemDetail.mockResolvedValue(response as any);

      const result = await controller.getItemDetail("item-1");

      expect(result).toEqual(response);
    });
  });
});
