import { Module } from "@nestjs/common";
import { SppgController } from "./presentation/http/sppg.controller";
import { SppgPublicController } from "./presentation/http/sppg-public.controller";
import { SppgService } from "./application/services/sppg.service";
import { SppgPublicService } from "./application/services/sppg-public.service";
import { PrismaSppgRepository } from "./infrastructure/prisma/sppg.repository";
import { SPPG_REPOSITORY } from "./domain";

@Module({
  controllers: [SppgController, SppgPublicController],
  providers: [
    SppgService,
    SppgPublicService,
    {
      provide: SPPG_REPOSITORY,
      useClass: PrismaSppgRepository,
    },
  ],
  exports: [SppgService],
})
export class SppgModule {}
