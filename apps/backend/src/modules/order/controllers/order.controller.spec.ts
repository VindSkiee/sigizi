import { Test, TestingModule } from "@nestjs/testing";
import { OrderController } from "./order.controller";
import { OrderService } from "../services/order.service";
import { OrderStatus } from "@sigizi/shared";

function makePagination(
  page = 1,
  limit = 20,
): { page: number; limit: number; skip: number } {
  return { page, limit, skip: (page - 1) * limit };
}

describe("OrderController", () => {
  let controller: OrderController;
  let service: jest.Mocked<OrderService>;

  const adminUser = {
    id: "user-admin",
    role: "SPPG_ADMIN",
    sppgId: "sppg-1",
  };

  const supplierUser = {
    id: "user-sup",
    role: "SUPPLIER",
    supplierId: "sup-1",
  };

  const mockOrderResult = {
    id: "order-1",
    status: OrderStatus.PENDING,
    total: 240000,
    sppgId: "sppg-1",
    supplierId: "sup-1",
  };

  const mockTransactionList = {
    items: [
      {
        id: "order-1",
        createdAt: new Date(),
        status: OrderStatus.COMPLETED,
        total: 240000,
        supplier: { id: "sup-1", name: "UD. Sumber Rejeki" },
        itemCount: 2,
        paidAt: new Date(),
      },
    ],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };

  const mockTransactionDetail = {
    id: "order-1",
    status: OrderStatus.COMPLETED,
    total: 240000,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    paidAt: new Date(),
    cancelledAt: null,
    cancelledReason: null,
    expectedDeliveryDate: null,
    actualDeliveryDate: null,
    supplier: {
      id: "sup-1",
      name: "UD. Sumber Rejeki",
      phone: null,
      address: null,
      profileImage: null,
    },
    sppg: { id: "sppg-1", name: "SPPG Purwakarta" },
    items: [],
    statusHistory: [],
  };

  beforeEach(async () => {
    const mockService: jest.Mocked<OrderService> = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      confirmPayment: jest.fn(),
      findTransactions: jest.fn(),
      findTransactionDetail: jest.fn(),
      findSupplierTransactions: jest.fn(),
      findSupplierTransactionDetail: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: mockService }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get(OrderService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should delegate with pagination and user", async () => {
      const pagination = makePagination();
      service.findAll.mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      await controller.findAll(pagination as any, adminUser);

      expect(service.findAll).toHaveBeenCalledWith(
        pagination,
        adminUser,
        undefined,
        undefined,
        undefined,
      );
    });

    it("should pass sppgId and supplierId filters", async () => {
      const pagination = makePagination();
      service.findAll.mockResolvedValue({
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      await controller.findAll(pagination as any, adminUser, "sppg-1", "sup-1");

      expect(service.findAll).toHaveBeenCalledWith(
        pagination,
        adminUser,
        "sppg-1",
        "sup-1",
        undefined,
      );
    });
  });

  describe("findTransactions", () => {
    it("should delegate with sppgId from user", async () => {
      const query = {
        ...makePagination(),
        startDate: "2026-07-15",
        endDate: "2026-07-15",
      };
      service.findTransactions.mockResolvedValue(mockTransactionList);

      await controller.findTransactions(query as any, adminUser);

      expect(service.findTransactions).toHaveBeenCalledWith("sppg-1", query);
    });
  });

  describe("findTransactionDetail", () => {
    it("should delegate with id and sppgId", async () => {
      service.findTransactionDetail.mockResolvedValue(
        mockTransactionDetail as any,
      );

      await controller.findTransactionDetail("order-1", adminUser);

      expect(service.findTransactionDetail).toHaveBeenCalledWith(
        "order-1",
        "sppg-1",
      );
    });
  });

  describe("findSupplierTransactions", () => {
    it("should delegate with supplierId from user", async () => {
      const query = { ...makePagination(), startDate: "2026-07-15" };
      service.findSupplierTransactions.mockResolvedValue(mockTransactionList);

      await controller.findSupplierTransactions(query as any, supplierUser);

      expect(service.findSupplierTransactions).toHaveBeenCalledWith(
        "sup-1",
        query,
      );
    });
  });

  describe("findSupplierTransactionDetail", () => {
    it("should delegate with id and supplierId", async () => {
      service.findSupplierTransactionDetail.mockResolvedValue(
        mockTransactionDetail as any,
      );

      await controller.findSupplierTransactionDetail("order-1", supplierUser);

      expect(service.findSupplierTransactionDetail).toHaveBeenCalledWith(
        "order-1",
        "sup-1",
      );
    });
  });

  describe("findOne", () => {
    it("should delegate with id", async () => {
      service.findOne.mockResolvedValue(mockOrderResult as any);

      await controller.findOne("order-1");

      expect(service.findOne).toHaveBeenCalledWith("order-1");
    });
  });

  describe("create", () => {
    it("should delegate with dto, sppgId, and userId", async () => {
      const dto = {
        supplierId: "sup-1",
        items: [{ itemId: "item-1", quantity: 10 }],
      };
      service.create.mockResolvedValue(mockOrderResult as any);

      await controller.create(dto, adminUser);

      expect(service.create).toHaveBeenCalledWith(dto, "sppg-1", "user-admin");
    });
  });

  describe("updateStatus", () => {
    it("should delegate with id, dto, and user", async () => {
      const dto = { status: OrderStatus.CONFIRMED };
      service.updateStatus.mockResolvedValue(mockOrderResult as any);

      await controller.updateStatus("order-1", dto, supplierUser);

      expect(service.updateStatus).toHaveBeenCalledWith(
        "order-1",
        dto,
        supplierUser,
      );
    });
  });

  describe("confirmPayment", () => {
    it("should delegate with id and userId", async () => {
      service.confirmPayment.mockResolvedValue(mockOrderResult as any);

      await controller.confirmPayment("order-1", adminUser);

      expect(service.confirmPayment).toHaveBeenCalledWith(
        "order-1",
        "user-admin",
      );
    });
  });
});
