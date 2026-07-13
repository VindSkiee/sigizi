import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateSupplierProfileDto {
  @ApiPropertyOptional({ example: "UD. Sumber Rejeki Updated" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: "Jawa Barat" })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: "Purwakarta" })
  @IsOptional()
  @IsString()
  regency?: string;

  @ApiPropertyOptional({ example: "Wanayasa" })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: -6.5563 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 107.4439 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
