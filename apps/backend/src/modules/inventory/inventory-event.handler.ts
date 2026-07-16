import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "../../database/prisma.service";
import {
  OrderCompletedEvent,
  OrderCancelledEvent,
} from "../order/events/order.events";
import {
  BatchCancelledEvent,
  BatchFailedEvent,
} from "../batch/events/batch.events";
import { StockSource } from "@sigizi/shared";

@Injectable()
export class InventoryEventHandler {
  private readonly logger = new Logger(InventoryEventHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // ORDER EVENTS
  // =========================================================================

  @OnEvent("order.completed")
  async handleOrderCompleted(event: OrderCompletedEvent) {
    this.logger.log(`Memproses penerimaan barang untuk order ${event.orderId}`);

    await this.prisma.$transaction(async (tx) => {
      for (const item of event.items) {
        await tx.inventoryStock.create({
          data: {
            sppgId: event.sppgId,
            itemId: item.itemId,
            orderItemId: item.orderItemId,
            source: StockSource.SYSTEM_ORDER,
            purchasePrice: item.unitPrice,
            initialQty: item.quantity,
            remainingQty: item.quantity,
            createdById: event.completedById,
            notes: `Stok dari order ${event.orderId}`,
          },
        });
      }
    });

    this.logger.log(
      `Berhasil menyimpan ${event.items.length} item ke gudang untuk order ${event.orderId}`,
    );
  }

  @OnEvent("order.cancelled")
  async handleOrderCancelled(event: OrderCancelledEvent) {
    this.logger.log(
      `Memproses pembatalan inventory untuk order ${event.orderId}`,
    );

    if (event.previousStatus === "COMPLETED") {
      const stocks = await this.prisma.inventoryStock.findMany({
        where: {
          orderItem: {
            orderId: event.orderId,
          },
        },
      });

      if (stocks.length === 0) {
        this.logger.log(
          `Tidak ada stok yang perlu dikembalikan untuk order ${event.orderId}`,
        );
        return;
      }

      for (const stock of stocks) {
        if (stock.remainingQty < stock.initialQty) {
          this.logger.warn(
            `Peringatan: Stok ${stock.id} sudah terpakai sebagian ` +
              `(tersisa ${stock.remainingQty} dari ${stock.initialQty}). ` +
              `Pembatalan seharusnya sudah dicegah oleh validasi.`,
          );
        }
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.inventoryStock.deleteMany({
          where: {
            orderItem: {
              orderId: event.orderId,
            },
          },
        });
      });

      this.logger.log(
        `Berhasil mengembalikan ${stocks.length} stok dari gudang untuk order ${event.orderId}`,
      );
    }
  }

  // =========================================================================
  // BATCH EVENTS — Return stok dengan BATCH_RETURN source
  // =========================================================================

  @OnEvent("batch.cancelled")
  async handleBatchCancelled(event: BatchCancelledEvent) {
    this.logger.log(
      `Memproses pengembalian stok untuk batch ${event.batchNumber} (CANCELLED)`,
    );

    const returnableItems = event.items.filter(
      (item) => item.inventoryStockId !== null,
    );

    if (returnableItems.length === 0) {
      this.logger.log(
        `Tidak ada stok yang perlu dikembalikan untuk batch ${event.batchNumber}`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of returnableItems) {
        // Buat lot baru dengan source BATCH_RETURN (100% quantity)
        await tx.inventoryStock.create({
          data: {
            sppgId: event.sppgId,
            itemId: item.itemId,
            source: StockSource.BATCH_RETURN,
            purchasePrice: item.unitPrice,
            initialQty: item.quantity,
            remainingQty: item.quantity,
            createdById: event.cancelledById,
            notes: `Pengembalian dari batch ${event.batchNumber} (dibatalkan: ${event.reason})`,
          },
        });
      }
    });

    this.logger.log(
      `Berhasil mengembalikan ${returnableItems.length} lot stok untuk batch ${event.batchNumber}`,
    );
  }

  @OnEvent("batch.failed")
  async handleBatchFailed(event: BatchFailedEvent) {
    this.logger.log(
      `Memproses pengembalian stok untuk batch ${event.batchNumber} (FAILED)`,
    );

    const returnableItems = event.items.filter(
      (item) => item.inventoryStockId !== null,
    );

    if (returnableItems.length === 0) {
      this.logger.log(
        `Tidak ada stok yang perlu dikembalikan untuk batch ${event.batchNumber}`,
      );
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of returnableItems) {
        // Buat lot baru dengan source BATCH_RETURN (100% quantity)
        await tx.inventoryStock.create({
          data: {
            sppgId: event.sppgId,
            itemId: item.itemId,
            source: StockSource.BATCH_RETURN,
            purchasePrice: item.unitPrice,
            initialQty: item.quantity,
            remainingQty: item.quantity,
            createdById: event.failedById,
            notes: `Pengembalian dari batch ${event.batchNumber} (gagal: ${event.failedReason})`,
          },
        });
      }
    });

    this.logger.log(
      `Berhasil mengembalikan ${returnableItems.length} lot stok untuk batch ${event.batchNumber}`,
    );
  }
}
