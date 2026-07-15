import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsEnum,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus } from "@sigizi/shared";

export class OrderItemRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplierId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mouId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: "Expected delivery date (ISO 8601)" })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({
    description:
      "Justification when price validation returns WARNING (required if any item has WARNING status)",
    example: "Stok lokal langka, supplier terdekat hanya ini yang tersedia",
  })
  @IsOptional()
  @IsString()
  priceJustification?: string;

  @ApiProperty({ type: [OrderItemRequestDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemRequestDto)
  items!: OrderItemRequestDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional({ description: "Required for CANCELLED status" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;

  @ApiPropertyOptional({ description: "Delivery evidence URL (for DELIVERED)" })
  @IsOptional()
  @IsString()
  deliveryEvidence?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
