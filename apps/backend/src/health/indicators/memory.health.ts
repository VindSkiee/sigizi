import { Injectable } from "@nestjs/common";
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from "@nestjs/terminus";

@Injectable()
export class MemoryHealthIndicator extends HealthIndicator {
  private readonly heapThreshold: number;
  private readonly rssThreshold: number;

  constructor() {
    super();
    this.heapThreshold =
      parseInt(process.env.HEALTH_CHECK_MEMORY_HEAP || "300", 10) * 1024 * 1024;
    this.rssThreshold =
      parseInt(process.env.HEALTH_CHECK_MEMORY_RSS || "500", 10) * 1024 * 1024;
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const memoryUsage = process.memoryUsage();
    const heapUsed = memoryUsage.heapUsed;
    const rss = memoryUsage.rss;

    const heapOk = heapUsed < this.heapThreshold;
    const rssOk = rss < this.rssThreshold;

    if (heapOk && rssOk) {
      return this.getStatus(key, true, {
        heapUsed: Math.round(heapUsed / 1024 / 1024),
        heapThreshold: Math.round(this.heapThreshold / 1024 / 1024),
        rss: Math.round(rss / 1024 / 1024),
        rssThreshold: Math.round(this.rssThreshold / 1024 / 1024),
      });
    }

    const failures: Record<string, any> = {};
    if (!heapOk) {
      failures.heapUsed = {
        current: Math.round(heapUsed / 1024 / 1024),
        threshold: Math.round(this.heapThreshold / 1024 / 1024),
        unit: "MB",
      };
    }
    if (!rssOk) {
      failures.rss = {
        current: Math.round(rss / 1024 / 1024),
        threshold: Math.round(this.rssThreshold / 1024 / 1024),
        unit: "MB",
      };
    }

    throw new HealthCheckError(
      "Memory health check failed",
      this.getStatus(key, false, failures),
    );
  }
}
