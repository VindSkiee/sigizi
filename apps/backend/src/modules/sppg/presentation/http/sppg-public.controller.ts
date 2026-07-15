import { Controller, Get, Param, Query, Header } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SppgPublicService } from "../../application/services/sppg-public.service";
import { SppgSearchQueryDto } from "../../application/dto/sppg-search-query.dto";

@ApiTags("Public SPPG")
@Controller("public/sppg")
export class SppgPublicController {
  constructor(private readonly sppgPublicService: SppgPublicService) {}

  @Get()
  @Header("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
  @ApiOperation({ summary: "Search SPPGs by region or GPS radius (public)" })
  findAll(@Query() query: SppgSearchQueryDto) {
    const { province, regency, district, latitude, longitude, radiusKm } =
      query;
    return this.sppgPublicService.findAll(query, {
      province,
      regency,
      district,
      latitude,
      longitude,
      radiusKm,
    });
  }

  @Get("batches/:sppgId")
  @Header("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
  @ApiOperation({ summary: "List batches for a specific SPPG (public)" })
  findBatches(
    @Param("sppgId") sppgId: string,
    @Query() query: SppgSearchQueryDto,
  ) {
    return this.sppgPublicService.findBatches(
      sppgId,
      query,
      query.status as string | undefined,
    );
  }

  @Get(":id")
  @Header("Cache-Control", "public, max-age=300, stale-while-revalidate=600")
  @ApiOperation({ summary: "Get SPPG profile with batch summary (public)" })
  findOne(@Param("id") id: string) {
    return this.sppgPublicService.findOne(id);
  }
}
