import { IntersectionType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../../../core/dto/pagination.dto";
import { SppgLocationFilterDto } from "./sppg-location-filter.dto";

export class SppgSearchQueryDto extends IntersectionType(
  PaginationDto,
  SppgLocationFilterDto,
) {
  @IsOptional()
  @IsString()
  status?: string;
}
