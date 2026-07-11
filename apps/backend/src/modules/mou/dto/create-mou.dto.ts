import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MouItemRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 12000 })
  agreedPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  minOrderQty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  maxOrderQty?: number;
}

export class CreateMouDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sppgId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty({ example: "MoU Pengadaan Beras Premium 2026" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "2026-01-01" })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: "2026-12-31" })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  terms?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [MouItemRequestDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MouItemRequestDto)
  items?: MouItemRequestDto[];
}
