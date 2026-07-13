import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { MarketLocationFilterDto } from "./market-location-filter.dto";

export class MarketPricesQueryDto extends MarketLocationFilterDto {
  @ApiProperty({ example: "Beras" })
  @IsString()
  @IsNotEmpty()
  item!: string;
}
