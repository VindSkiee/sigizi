import { Module } from "@nestjs/common";
import { SppgService } from "./services/sppg.service";
import { SppgController } from "./controllers/sppg.controller";

@Module({
  controllers: [SppgController],
  providers: [SppgService],
  exports: [SppgService],
})
export class SppgModule {}
