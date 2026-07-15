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

export class SppgLocationFilterDto {
  @ApiPropertyOptional({ example: "JAWA_BARAT" })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: "PURWAKARTA" })
  @IsOptional()
  @IsString()
  regency?: string;

  @ApiPropertyOptional({ example: "PURWAKARTA" })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: "Ciseureuh" })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional({ example: -6.5398 })
  @ValidateIf((dto: SppgLocationFilterDto) => dto.longitude !== undefined)
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 107.4471 })
  @ValidateIf((dto: SppgLocationFilterDto) => dto.latitude !== undefined)
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ example: 10, default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(100)
  radiusKm?: number;
}
