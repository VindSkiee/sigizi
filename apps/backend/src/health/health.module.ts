import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { PrismaHealthIndicator } from "./indicators/prisma.health";
import { MemoryHealthIndicator } from "./indicators/memory.health";
import { PrismaModule } from "../database/prisma.module";

@Module({
  imports: [TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, MemoryHealthIndicator],
  exports: [PrismaHealthIndicator, MemoryHealthIndicator],
})
export class HealthModule {}
