import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

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
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 107.4439 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isMarketSeller?: boolean;

  @ApiPropertyOptional({
    description: "Nama pasar tanpa prefix 'Pasar' (contoh: 'Cibeunying')",
    example: "Cibeunying",
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9\s.'\-]+$/, {
    message:
      "Nama pasar hanya boleh mengandung huruf, angka, spasi, titik, strip, dan apostrof",
  })
  marketName?: string;

  @ApiPropertyOptional({ description: "URL foto profil supplier" })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiPropertyOptional({ default: true, description: "Status buka/tutup toko" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  openStatus?: boolean;
}
