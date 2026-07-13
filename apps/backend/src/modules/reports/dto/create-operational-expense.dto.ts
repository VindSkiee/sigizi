import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export const OPERATIONAL_EXPENSE_CATEGORY = {
  TRANSPORTATION: "TRANSPORTATION",
  FUEL: "FUEL",
  VEHICLE_MAINTENANCE: "VEHICLE_MAINTENANCE",
  ADMINISTRATIVE: "ADMINISTRATIVE",
  UTILITIES: "UTILITIES",
  OTHER: "OTHER",
} as const;

export type OperationalExpenseCategory =
  (typeof OPERATIONAL_EXPENSE_CATEGORY)[keyof typeof OPERATIONAL_EXPENSE_CATEGORY];

export class CreateOperationalExpenseDto {
  @ApiProperty({ enum: OPERATIONAL_EXPENSE_CATEGORY })
  @IsEnum(OPERATIONAL_EXPENSE_CATEGORY)
  category: OperationalExpenseCategory;

  @ApiProperty({ example: 125000 })
  @IsPositive()
  amount: number;

  @ApiProperty({ example: "2026-07-13" })
  @IsDateString()
  expenseDate: string;

  @ApiProperty({ example: "Biaya bensin pengiriman harian" })
  @IsString()
  @MinLength(3)
  description: string;

  @ApiPropertyOptional({ example: "https://storage.local/evidence/expense-1.jpg" })
  @IsOptional()
  @IsString()
  evidenceUrl?: string;

  @ApiPropertyOptional({ example: "Disetujui bendahara SPPG" })
  @IsOptional()
  @IsString()
  notes?: string;
}
