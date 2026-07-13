import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PrismaService } from "../../database/prisma.service";
import {
  OrderCompletedEvent,
  OrderCancelledEvent,
} from "../order/events/order.events";

@Injectable()
export class InventoryEventHandler {
  private readonly logger = new Logger(InventoryEventHandler.name);

  constructor(private readonly prisma: PrismaService) {}

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
            purchasePrice: item.unitPrice,
            initialQty: item.quantity,
            remainingQty: item.quantity,
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
}
