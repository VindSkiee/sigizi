import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { OrderService } from "./order.service";
import { PrismaService } from "../../../database/prisma.service";
import { MarketService } from "../../market/services/market.service";
import { PaginationDto } from "../../../core/dto/pagination.dto";
import { OrderStatus, Role } from "@sigizi/shared";

function makePagination(page = 1, limit = 20): PaginationDto {
  const dto = new PaginationDto();
  dto.page = page;
  dto.limit = limit;
  return dto;
}

const validValidation = {
  status: "VALID" as const,
  reason: "Harga sesuai pasar",
  recommendation: "Harga wajar",
  marketMedianSnapshot: 12000,
};

const warningValidation = {
  status: "WARNING" as const,
  reason: "Harga sedikit di atas normal",
  recommendation: "Pertimbangkan harga lebih rendah",
  marketMedianSnapshot: 12000,
};

const invalidValidation = {
  status: "INVALID" as const,
  reason: "Harga terlalu tinggi",
  recommendation: "Turunkan harga",
  marketMedianSnapshot: 12000,
};

describe("OrderService", () => {
  let service: OrderService;
  let prisma: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let marketService: jest.Mocked<MarketService>;

  const mockOrder = {
    id: "order-1",
    status: OrderStatus.PENDING,
    total: 240000,
    sppgId: "sppg-1",
    supplierId: "sup-1",
    createdById: "user-1",
    notes: "Pesanan bahan baku",
    expectedDeliveryDate: new Date("2026-07-20"),
    actualDeliveryDate: null,
    paidAt: null,
    cancelledAt: null,
    cancelledReason: null,
    deliveryEvidence: null,
    createdAt: new Date("2026-07-15"),
    updatedAt: new Date("2026-07-15"),
  };

  const mockOrderWithItems = {
    ...mockOrder,
    items: [
      {
        id: "oi-1",
        itemId: "item-1",
        quantity: 20,
        unitPrice: 12000,
        subtotal: 240000,
        marketMedianAtPurchase: 12000,
        isWarningBypass: false,
        justificationNote: "Semua harga valid sesuai data pasar",
      },
    ],
    supplier: { id: "sup-1", name: "UD. Sumber Rejeki" },
    sppg: { id: "sppg-1", name: "SPPG Purwakarta" },
  };

  const supplierUser = {
    id: "user-sup",
    role: Role.SUPPLIER,
    supplierId: "sup-1",
  };

  const adminUser = {
    id: "user-admin",
    role: Role.SPPG_ADMIN,
    sppgId: "sppg-1",
  };

  beforeEach(async () => {
    const mockPrisma = {
      order: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      supplierItem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      sppg: { findUnique: jest.fn() },
      mou: { findUnique: jest.fn() },
      mouItem: { findMany: jest.fn() },
      orderStatusHistory: { create: jest.fn() },
      inventoryStock: { findMany: jest.fn() },
      orderItem: { findMany: jest.fn() },
      $transaction: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    } as any;

    const mockMarketService = {
      validatePrice: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: MarketService, useValue: mockMarketService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
    marketService = module.get(MarketService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated orders", async () => {
      prisma.order.findMany.mockResolvedValue([mockOrderWithItems]);
      prisma.order.count.mockResolvedValue(1);

      const result = await service.findAll(makePagination(), supplierUser);

      expect(result.items).toHaveLength(1);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it("should filter by supplierId when SUPPLIER role", async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.findAll(makePagination(), supplierUser);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ supplierId: "sup-1" }),
        }),
      );
    });

    it("should filter by sppgId when SPPG_ADMIN role", async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.findAll(makePagination(), adminUser);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ sppgId: "sppg-1" }),
        }),
      );
    });

    it("should throw BadRequestException when SUPPLIER has no supplierId", async () => {
      const noSupplierUser = { id: "u1", role: Role.SUPPLIER };

      await expect(
        service.findAll(makePagination(), noSupplierUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when SPPG_ADMIN has no sppgId", async () => {
      const noAdminUser = { id: "u1", role: Role.SPPG_ADMIN };

      await expect(
        service.findAll(makePagination(), noAdminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it("should apply status filter", async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.findAll(
        makePagination(),
        adminUser,
        undefined,
        undefined,
        OrderStatus.CONFIRMED,
      );

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: OrderStatus.CONFIRMED }),
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return order when found", async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrderWithItems);

      const result = await service.findOne("order-1");

      expect(result.id).toBe("order-1");
    });

    it("should compute isLate correctly", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);

      const lateOrder = {
        ...mockOrderWithItems,
        expectedDeliveryDate: pastDate,
        status: OrderStatus.CONFIRMED,
      };
      prisma.order.findUnique.mockResolvedValue(lateOrder);

      const result = await service.findOne("order-1");

      expect(result.isLate).toBe(true);
    });

    it("should not mark as late when status is COMPLETED", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);

      const completedOrder = {
        ...mockOrderWithItems,
        expectedDeliveryDate: pastDate,
        status: OrderStatus.COMPLETED,
      };
      prisma.order.findUnique.mockResolvedValue(completedOrder);

      const result = await service.findOne("order-1");

      expect(result.isLate).toBe(false);
    });

    it("should throw NotFoundException when not found", async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.findOne("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    const createDto = {
      supplierId: "sup-1",
      items: [{ itemId: "item-1", quantity: 20 }],
    };

    beforeEach(() => {
      prisma.sppg.findUnique.mockResolvedValue({
        province: "Jawa Barat",
        regency: "Purwakarta",
        district: "Purwakarta",
      });
      prisma.supplierItem.findMany.mockResolvedValue([
        { id: "item-1", basePrice: 12000, name: "Beras Premium", stock: 100 },
      ]);
      marketService.validatePrice.mockResolvedValue(validValidation);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          order: {
            create: jest.fn().mockResolvedValue({
              ...mockOrder,
              items: [
                {
                  id: "oi-1",
                  itemId: "item-1",
                  quantity: 20,
                  unitPrice: 12000,
                  subtotal: 240000,
                },
              ],
            }),
          },
          orderStatusHistory: { create: jest.fn() },
          supplierItem: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return fn(tx);
      });
    });

    it("should create order with VALID prices", async () => {
      const result = await service.create(createDto, "sppg-1", "user-1");

      expect(result).toBeDefined();
      expect(marketService.validatePrice).toHaveBeenCalled();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("should create order with WARNING prices + justification", async () => {
      marketService.validatePrice.mockResolvedValue(warningValidation);

      const dtoWithJustification = {
        ...createDto,
        priceJustification: "Stok lokal langka",
      };
      const result = await service.create(
        dtoWithJustification,
        "sppg-1",
        "user-1",
      );

      expect(result).toBeDefined();
    });

    it("should throw on INVALID prices", async () => {
      marketService.validatePrice.mockResolvedValue(invalidValidation);

      await expect(
        service.create(createDto, "sppg-1", "user-1"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw when WARNING but no justification", async () => {
      marketService.validatePrice.mockResolvedValue(warningValidation);

      await expect(
        service.create(createDto, "sppg-1", "user-1"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw when item not found", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);
      prisma.supplierItem.findUnique.mockResolvedValue(null);

      await expect(
        service.create(createDto, "sppg-1", "user-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw when item deleted", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);
      prisma.supplierItem.findUnique.mockResolvedValue({
        deletedAt: new Date(),
        stock: 50,
        name: "Beras",
      });

      await expect(
        service.create(createDto, "sppg-1", "user-1"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw when item out of stock", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([]);
      prisma.supplierItem.findUnique.mockResolvedValue({
        deletedAt: null,
        stock: 0,
        name: "Beras",
      });

      await expect(
        service.create(createDto, "sppg-1", "user-1"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw when quantity exceeds stock", async () => {
      prisma.supplierItem.findMany.mockResolvedValue([
        { id: "item-1", basePrice: 12000, name: "Beras", stock: 5 },
      ]);

      await expect(
        service.create(createDto, "sppg-1", "user-1"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should use MoU agreed price when provided", async () => {
      prisma.mou.findUnique.mockResolvedValue({
        id: "mou-1",
        status: "ACTIVE",
        sppgId: "sppg-1",
      });
      prisma.mouItem.findMany.mockResolvedValue([
        { itemId: "item-1", agreedPrice: 10000 },
      ]);

      const dtoWithMou = { ...createDto, mouId: "mou-1" };
      await service.create(dtoWithMou, "sppg-1", "user-1");

      expect(marketService.validatePrice).toHaveBeenCalledWith(
        "Beras Premium",
        10000,
        expect.any(Object),
      );
    });

    it("should throw when MoU inactive", async () => {
      prisma.mou.findUnique.mockResolvedValue({
        id: "mou-1",
        status: "EXPIRED",
        sppgId: "sppg-1",
      });

      const dtoWithMou = { ...createDto, mouId: "mou-1" };
      await expect(
        service.create(dtoWithMou, "sppg-1", "user-1"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw when MoU sppgId mismatch", async () => {
      prisma.mou.findUnique.mockResolvedValue({
        id: "mou-1",
        status: "ACTIVE",
        sppgId: "sppg-999",
      });

      const dtoWithMou = { ...createDto, mouId: "mou-1" };
      await expect(
        service.create(dtoWithMou, "sppg-1", "user-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateStatus", () => {
    const findOrderMock = (overrides: any = {}) => {
      const order = {
        ...mockOrderWithItems,
        status: OrderStatus.PENDING,
        ...overrides,
      };
      prisma.order.findUnique.mockResolvedValue(order);
      prisma.order.update.mockResolvedValue(order);
      prisma.orderStatusHistory.create.mockResolvedValue({});
      return order;
    };

    it("should transition PENDING→CONFIRMED by SUPPLIER", async () => {
      findOrderMock();
      prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          order: {
            update: jest
              .fn()
              .mockResolvedValue({ status: OrderStatus.CONFIRMED }),
          },
          orderStatusHistory: { create: jest.fn() },
        });
      });

      const result = await service.updateStatus(
        "order-1",
        { status: OrderStatus.CONFIRMED },
        supplierUser,
      );

      expect(result).toBeDefined();
    });

    it("should transition DELIVERED→COMPLETED when paid", async () => {
      findOrderMock({ status: OrderStatus.DELIVERED, paidAt: new Date() });
      prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          order: {
            update: jest
              .fn()
              .mockResolvedValue({ status: OrderStatus.COMPLETED }),
          },
          orderStatusHistory: { create: jest.fn() },
        });
      });

      await service.updateStatus(
        "order-1",
        { status: OrderStatus.COMPLETED },
        adminUser,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        "order.completed",
        expect.any(Object),
      );
    });

    it("should throw when DELIVERED→COMPLETED without payment", async () => {
      findOrderMock({ status: OrderStatus.DELIVERED, paidAt: null });

      await expect(
        service.updateStatus(
          "order-1",
          { status: OrderStatus.COMPLETED },
          adminUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should transition to CANCELLED with reason and emit event", async () => {
      findOrderMock();
      prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          order: {
            update: jest
              .fn()
              .mockResolvedValue({ status: OrderStatus.CANCELLED }),
          },
          orderStatusHistory: { create: jest.fn() },
          orderItem: { findMany: jest.fn().mockResolvedValue([]) },
        });
      });

      await service.updateStatus(
        "order-1",
        {
          status: OrderStatus.CANCELLED,
          reason: "Supplier tidak dapat memenuhi",
        },
        supplierUser,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        "order.cancelled",
        expect.any(Object),
      );
    });

    it("should throw when CANCELLED without reason", async () => {
      findOrderMock();

      await expect(
        service.updateStatus(
          "order-1",
          { status: OrderStatus.CANCELLED },
          supplierUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw on invalid transition", async () => {
      findOrderMock({ status: OrderStatus.PENDING });

      await expect(
        service.updateStatus(
          "order-1",
          { status: OrderStatus.COMPLETED },
          adminUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw when role not allowed", async () => {
      findOrderMock({ status: OrderStatus.PENDING });

      await expect(
        service.updateStatus(
          "order-1",
          { status: OrderStatus.CONFIRMED },
          adminUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw when supplier tries to update other supplier order", async () => {
      findOrderMock({ supplierId: "sup-other" });

      await expect(
        service.updateStatus(
          "order-1",
          { status: OrderStatus.CONFIRMED },
          supplierUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it("should set actualDeliveryDate when DELIVERED", async () => {
      findOrderMock({ status: OrderStatus.CONFIRMED });
      const mockTx = {
        order: {
          update: jest
            .fn()
            .mockResolvedValue({ status: OrderStatus.DELIVERED }),
        },
        orderStatusHistory: { create: jest.fn() },
      };
      prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

      await service.updateStatus(
        "order-1",
        {
          status: OrderStatus.DELIVERED,
          deliveryEvidence: "https://evidence.jpg",
        },
        supplierUser,
      );

      expect(mockTx.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actualDeliveryDate: expect.any(Date),
            deliveryEvidence: "https://evidence.jpg",
          }),
        }),
      );
    });
  });

  describe("confirmPayment", () => {
    it("should set paidAt on DELIVERED order", async () => {
      const deliveredOrder = {
        ...mockOrderWithItems,
        status: OrderStatus.DELIVERED,
        paidAt: null,
      };
      prisma.order.findUnique.mockResolvedValue(deliveredOrder);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        return fn({
          order: {
            update: jest.fn().mockResolvedValue({ paidAt: new Date() }),
          },
          orderStatusHistory: { create: jest.fn() },
        });
      });

      const result = await service.confirmPayment("order-1", "user-admin");

      expect(result).toBeDefined();
    });

    it("should throw when order is not DELIVERED", async () => {
      prisma.order.findUnique.mockResolvedValue({
        ...mockOrderWithItems,
        status: OrderStatus.CONFIRMED,
      });

      await expect(
        service.confirmPayment("order-1", "user-admin"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("findTransactions", () => {
    it("should return paginated results", async () => {
      prisma.order.findMany.mockResolvedValue([
        {
          id: "order-1",
          createdAt: new Date(),
          status: OrderStatus.COMPLETED,
          total: 240000,
          paidAt: new Date(),
          supplier: { id: "sup-1", name: "UD. Sumber Rejeki" },
          items: [{ id: "oi-1" }],
        },
      ]);
      prisma.order.count.mockResolvedValue(1);

      const result = await service.findTransactions("sppg-1", {
        startDate: "2026-07-15",
        endDate: "2026-07-15",
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].itemCount).toBe(1);
    });

    it("should throw when startDate >= endDate", async () => {
      await expect(
        service.findTransactions("sppg-1", {
          startDate: "2026-07-20",
          endDate: "2026-07-15",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("findTransactionDetail", () => {
    it("should return order detail when found", async () => {
      prisma.order.findFirst.mockResolvedValue(mockOrderWithItems);

      const result = await service.findTransactionDetail("order-1", "sppg-1");

      expect(result.id).toBe("order-1");
    });

    it("should throw when not found", async () => {
      prisma.order.findFirst.mockResolvedValue(null);

      await expect(
        service.findTransactionDetail("nonexistent", "sppg-1"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
