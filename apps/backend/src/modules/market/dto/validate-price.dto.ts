import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from "class-validator";

export class ValidatePriceDto {
  @ApiProperty({ example: "Beras Premium" })
  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @ApiProperty({ example: 18000 })
  @IsNumber()
  @Min(0)
  proposedPrice!: number;

  @ApiPropertyOptional({ example: "Jawa Barat" })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: "Purwakarta" })
  @IsOptional()
  @IsString()
  regency?: string;

  @ApiPropertyOptional({ example: "Babakancikao" })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: -6.5398 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 107.4471 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
