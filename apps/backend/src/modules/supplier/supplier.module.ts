import { Module } from "@nestjs/common";
import { SupplierController } from "./presentation/http/supplier.controller";
import { SupplierService } from "./application/services/supplier.service";
import { PrismaSupplierRepository } from "./infrastructure/prisma/supplier.repository";
import { SUPPLIER_REPOSITORY } from "./domain";

@Module({
  controllers: [SupplierController],
  providers: [
    SupplierService,
    {
      provide: SUPPLIER_REPOSITORY,
      useClass: PrismaSupplierRepository,
    },
  ],
  exports: [SupplierService],
})
export class SupplierModule {}
