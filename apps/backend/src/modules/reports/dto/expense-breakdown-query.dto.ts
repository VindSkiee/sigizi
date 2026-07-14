import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional } from "class-validator";
import { EXPENSE_SOURCE, ExpenseSource } from "../reports.types";

export class ExpenseBreakdownQueryDto {
  @ApiPropertyOptional({
    enum: ["COGS", "PROCUREMENT", "OPEX", "ALL"],
    default: "ALL",
  })
  @IsOptional()
  @IsEnum(EXPENSE_SOURCE)
  source?: ExpenseSource = "ALL";

  @ApiPropertyOptional({ example: "2026-07-01" })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: "2026-07-31" })
  @IsDateString()
  endDate: string;
}
