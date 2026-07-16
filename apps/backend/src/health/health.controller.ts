import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
} from "@nestjs/terminus";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { PrismaHealthIndicator } from "./indicators/prisma.health";
import { MemoryHealthIndicator } from "./indicators/memory.health";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memoryHealth: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Full health check (all indicators)" })
  @ApiResponse({ status: 200, description: "Health check passed" })
  @ApiResponse({ status: 503, description: "Health check failed" })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.isHealthy("database"),
      () => this.memoryHealth.isHealthy("memory"),
    ]);
  }

  @Get("live")
  @ApiOperation({ summary: "Liveness probe - is server running?" })
  @ApiResponse({ status: 200, description: "Server is alive" })
  async liveness() {
    return {
      status: "ok",
      server: "up",
    };
  }

  @Get("ready")
  @HealthCheck()
  @ApiOperation({ summary: "Readiness probe - can serve traffic?" })
  @ApiResponse({ status: 200, description: "Server is ready" })
  @ApiResponse({ status: 503, description: "Server is not ready" })
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([() => this.prismaHealth.isHealthy("database")]);
  }
}
