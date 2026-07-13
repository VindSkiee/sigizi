import { BadRequestException } from "@nestjs/common";

export class InsufficientStockException extends BadRequestException {
  constructor(itemName: string, required: number, available: number) {
    super(
      `Stok "${itemName}" tidak mencukupi: butuh ${required}, tersedia ${available}`,
      "INSUFFICIENT_STOCK",
    );
  }
}
