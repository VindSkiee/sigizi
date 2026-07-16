import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateSupplierDto {
  @ApiProperty({ example: "UD. Sumber Rejeki" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "NIB file URL/path" })
  @IsString()
  @IsNotEmpty()
  nib!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: "Jawa Barat" })
  @IsString()
  @IsNotEmpty()
  province!: string;

  @ApiProperty({ example: "Purwakarta" })
  @IsString()
  @IsNotEmpty()
  regency!: string;

  @ApiPropertyOptional({ example: "Purwakarta" })
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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
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
}
