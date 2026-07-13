import { Module } from "@nestjs/common";
import { BeneficiaryController } from "./presentation/http/beneficiary.controller";
import { BeneficiaryService } from "./application/services/beneficiary.service";
import { PrismaBeneficiaryRepository } from "./infrastructure/prisma/beneficiary.repository";
import { BENEFICIARY_REPOSITORY } from "./domain";

@Module({
  controllers: [BeneficiaryController],
  providers: [
    BeneficiaryService,
    {
      provide: BENEFICIARY_REPOSITORY,
      useClass: PrismaBeneficiaryRepository,
    },
  ],
  exports: [BeneficiaryService],
})
export class BeneficiaryModule {}
