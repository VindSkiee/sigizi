import { Module } from "@nestjs/common";
import { BatchService } from "./services/batch.service";
import { BatchController } from "./controllers/batch.controller";

@Module({
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
