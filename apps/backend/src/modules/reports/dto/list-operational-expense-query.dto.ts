import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "../../../core/dto/pagination.dto";
import { OPERATIONAL_EXPENSE_CATEGORY, OperationalExpenseCategory } from "./create-operational-expense.dto";

export class ListOperationalExpenseQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: OPERATIONAL_EXPENSE_CATEGORY })
  @IsOptional()
  @IsEnum(OPERATIONAL_EXPENSE_CATEGORY)
  category?: OperationalExpenseCategory;

  @ApiPropertyOptional({ example: "2026-07-01" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: "2026-07-31" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Type(() => Number)
  page?: number;

  @Type(() => Number)
  limit?: number;
}
