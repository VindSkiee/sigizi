import { Module } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { InventoryController } from "./inventory.controller";
import { InventoryEventHandler } from "./inventory-event.handler";
import { PrismaModule } from "../../database/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryEventHandler],
  exports: [InventoryService, InventoryEventHandler],
})
export class InventoryModule {}
