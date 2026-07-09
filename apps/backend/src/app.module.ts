import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { BatchModule } from './modules/batch/batch.module';
import { ComplaintModule } from './modules/complaint/complaint.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MarketModule } from './modules/market/market.module';
import { PrismaModule } from './database/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    SupplierModule,
    BatchModule,
    ComplaintModule,
    ReportsModule,
    MarketModule,
  ],
})
export class AppModule {}
