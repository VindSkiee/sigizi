import { Injectable } from "@nestjs/common";
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true, { message: "Database is accessible" });
    } catch (error) {
      throw new HealthCheckError(
        "PrismaHealthCheck failed",
        this.getStatus(key, false, {
          message: "Database is not accessible",
          error: error.message,
        }),
      );
    }
  }
}
