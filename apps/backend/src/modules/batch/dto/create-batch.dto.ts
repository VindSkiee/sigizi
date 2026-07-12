import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

class BatchItemRequestDto {
  @ApiProperty({ example: "clx..." })
  @IsString()
  itemId!: string;

  @ApiPropertyOptional({ example: "Nasi 100g" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "kg" })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @ApiProperty({ example: 12000 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateBatchDto {
  @ApiProperty({ example: "Nasi Ayam Bakar + Sayur Bayam" })
  @IsString()
  menu!: string;

  @ApiPropertyOptional({
    example: { calories: 450, protein: 25, fat: 15, carbs: 50 },
  })
  @IsOptional()
  nutrition?: Record<string, any>;

  @ApiPropertyOptional({ example: ["gluten"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  beneficiaryCount?: number;

  @ApiProperty({ type: [BatchItemRequestDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchItemRequestDto)
  items!: BatchItemRequestDto[];
}
