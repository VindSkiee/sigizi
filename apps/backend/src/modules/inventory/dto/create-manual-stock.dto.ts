import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateManualStockDto {
  @ApiProperty({
    description: "Nama item (akan dibuat SupplierItem baru jika belum ada)",
    example: "Beras Premium",
  })
  @IsString()
  itemName!: string;

  @ApiPropertyOptional({
    description: "Satuan item (default: pcs)",
    example: "kg",
    default: "pcs",
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({
    description: "Jumlah stok yang diinput",
    example: 100,
  })
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @ApiProperty({
    description: "Harga per unit (Rp)",
    example: 12000,
  })
  @IsNumber()
  @Min(0)
  purchasePrice!: number;

  @ApiPropertyOptional({
    description: "Tanggal kedaluwarsa (opsional, untuk item perishable)",
    example: "2026-08-15T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  expiredAt?: string;

  @ApiPropertyOptional({
    description: "Catatan tentang stok ini",
    example: "Stok awal dari supplier UD. Sumber Rejeki",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
