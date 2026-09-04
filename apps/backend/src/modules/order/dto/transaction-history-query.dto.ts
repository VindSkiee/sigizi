import { IsOptional, IsDateString, IsEnum } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus } from "@sigizi/shared";
import { PaginationDto } from "../../../core/dto/pagination.dto";

export class TransactionHistoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "Start date filter (YYYY-MM-DD). Default: today.",
    example: "2026-07-09",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date filter (YYYY-MM-DD, exclusive). Default: today.",
    example: "2026-07-09",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
    description: "Filter by order status",
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
