import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateSupplierItemDto {
  @ApiPropertyOptional({ example: "Beras Premium Updated" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: "kg" })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 12000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: "Beras premium grade A" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQty?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  orderStep?: number;

  @ApiPropertyOptional({
    example: false,
    description: "Status ketersediaan stok",
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
