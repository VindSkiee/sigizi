import { Module } from '@nestjs/common';
import { BatchController, PublicBatchController } from './batch.controller';
import { BatchService } from './batch.service';

@Module({
  controllers: [BatchController, PublicBatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
