import { IsOptional, IsString, IsNumber, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class StockQueryDto {
  @ApiPropertyOptional({
    description: "Filter berdasarkan ID item",
    example: "clx...",
  })
  @IsOptional()
  @IsString()
  itemId?: string;

  @ApiPropertyOptional({
    description: "Filter berdasarkan source stok",
    enum: ["SYSTEM_ORDER", "MANUAL_ADJUSTMENT", "BATCH_RETURN"],
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: "Hanya tampilkan stok yang tersisa > 0",
    default: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minRemaining?: number;
}

export class LowStockAlertDto {
  @ApiPropertyOptional({
    description:
      "Ambang batas stok rendah global (jika item.minThreshold null)",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  defaultThreshold?: number;
}
