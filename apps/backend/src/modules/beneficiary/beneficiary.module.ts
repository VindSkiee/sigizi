import { Module } from "@nestjs/common";
import { BeneficiaryService } from "./services/beneficiary.service";
import { BeneficiaryController } from "./controllers/beneficiary.controller";

@Module({
  controllers: [BeneficiaryController],
  providers: [BeneficiaryService],
  exports: [BeneficiaryService],
})
export class BeneficiaryModule {}
