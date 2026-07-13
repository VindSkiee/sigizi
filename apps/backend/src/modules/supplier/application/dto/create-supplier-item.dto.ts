import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSupplierItemDto {
  @ApiProperty({ example: "Beras Premium" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "kg" })
  @IsString()
  @IsNotEmpty()
  unit!: string;

  @ApiProperty({ example: 12000 })
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQty?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  orderStep?: number;
}
