import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterSupplierDto {
  @ApiProperty({ example: "supplier@sumberrejeki.go.id" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123", minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: "UD. Sumber Rejeki" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "NIB file URL/path" })
  @IsString()
  @IsNotEmpty()
  nib: string;

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
  province: string;

  @ApiProperty({ example: "Purwakarta" })
  @IsString()
  @IsNotEmpty()
  regency: string;

  @ApiProperty({ example: "Wanayasa" })
  @IsString()
  @IsNotEmpty()
  district: string;

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
