import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBeneficiaryDto {
  @ApiProperty({ example: "SDN 01 Purwakarta" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "SDN 01 Purwakarta" })
  @IsString()
  @IsNotEmpty()
  institution: string;

  @ApiPropertyOptional({ example: "SD" })
  @IsOptional()
  @IsString()
  institutionType?: string;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(1)
  totalBeneficiary: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;
}
