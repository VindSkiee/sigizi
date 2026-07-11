import { Module } from "@nestjs/common";
import { ComplaintService } from "./services/complaint.service";
import { ComplaintController } from "./controllers/complaint.controller";

@Module({
  controllers: [ComplaintController],
  providers: [ComplaintService],
  exports: [ComplaintService],
})
export class ComplaintModule {}
