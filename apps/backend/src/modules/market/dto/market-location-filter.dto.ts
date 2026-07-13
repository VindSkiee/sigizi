import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from "class-validator";

export class MarketLocationFilterDto {
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
  @ValidateIf((dto: MarketLocationFilterDto) => dto.longitude !== undefined)
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 107.4471 })
  @ValidateIf((dto: MarketLocationFilterDto) => dto.latitude !== undefined)
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ example: 5, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(500)
  radiusKm?: number;
}
