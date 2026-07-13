import { Module } from "@nestjs/common";
import { InventoryEventHandler } from "./inventory-event.handler";

@Module({
  providers: [InventoryEventHandler],
  exports: [InventoryEventHandler],
})
export class InventoryModule {}
