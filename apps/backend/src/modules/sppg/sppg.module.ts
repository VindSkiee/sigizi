import { Module } from "@nestjs/common";
import { SppgController } from "./presentation/http/sppg.controller";
import { SppgService } from "./application/services/sppg.service";
import { PrismaSppgRepository } from "./infrastructure/prisma/sppg.repository";
import { SPPG_REPOSITORY } from "./domain";

@Module({
  controllers: [SppgController],
  providers: [
    SppgService,
    {
      provide: SPPG_REPOSITORY,
      useClass: PrismaSppgRepository,
    },
  ],
  exports: [SppgService],
})
export class SppgModule {}
