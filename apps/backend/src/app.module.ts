import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { SupplierModule } from "./modules/supplier/supplier.module";
import { BatchModule } from "./modules/batch/batch.module";
import { ComplaintModule } from "./modules/complaint/complaint.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { MarketModule } from "./modules/market/market.module";
import { PrismaModule } from "./database/prisma.module";
import {
  LoggerModule,
  RequestIdMiddleware,
  RequestLoggerMiddleware,
} from "./common";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../../.env",
    }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    SupplierModule,
    BatchModule,
    ComplaintModule,
    ReportsModule,
    MarketModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply RequestIdMiddleware to all routes
    consumer.apply(RequestIdMiddleware).forRoutes("*");

    // Apply RequestLoggerMiddleware to all routes
    consumer.apply(RequestLoggerMiddleware).forRoutes("*");
  }
}
