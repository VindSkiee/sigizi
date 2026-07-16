import { IsNumber, IsString, IsOptional, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AdjustStockDto {
  @ApiProperty({
    description:
      "Jumlah penyesuaian (negatif untuk pengurangan, positif untuk penambahan)",
    example: -5,
  })
  @IsNumber()
  adjustmentQty!: number;

  @ApiProperty({
    description: "Alasan penyesuaian",
    enum: ["SPOILAGE", "THEFT", "DISCREPANCY", "CORRECTION", "OTHER"],
    example: "SPOILAGE",
  })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({
    description: "Deskripsi detail penyesuaian",
    example: "Beras rusak akibat kelembaban tinggi",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
