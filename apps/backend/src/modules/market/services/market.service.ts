import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import { calculateDistanceKm } from "../../../core/utils/geolocation";

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  async getMarketPrices(item: string, region?: string) {
    const where: any = {
      name: { contains: item, mode: "insensitive" },
    };

    const supplierItems = await this.prisma.supplierItem.findMany({
      where,
      include: { supplier: true },
    });

    if (supplierItems.length === 0) {
      return {
        item,
        region: region ?? null,
        statistics: {
          min: 0,
          max: 0,
          median: 0,
          mean: 0,
          count: 0,
        },
        suppliers: [],
      };
    }

    const prices = supplierItems.map((si) => si.basePrice);
    const sorted = [...prices].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = this.calculateMedian(sorted);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;

    const anomalies = this.detectIQRAnomalies(sorted);

    const suppliers = supplierItems.map((si, idx) => ({
      id: si.supplier.id,
      name: si.supplier.name,
      price: si.basePrice,
      isAnomaly: anomalies.includes(idx),
      latitude: si.supplier.latitude,
      longitude: si.supplier.longitude,
    }));

    return {
      item,
      region: region ?? null,
      statistics: { min, max, median, mean, count: prices.length },
      suppliers,
    };
  }

  async getAnomalies(region?: string) {
    const supplierItems = await this.prisma.supplierItem.findMany({
      include: { supplier: true },
    });

    const itemGroups = new Map<
      string,
      { prices: number[]; indices: number[] }
    >();
    for (const si of supplierItems) {
      const key = si.name;
      if (!itemGroups.has(key)) {
        itemGroups.set(key, { prices: [], indices: [] });
      }
      const group = itemGroups.get(key)!;
      group.prices.push(si.basePrice);
      group.indices.push(group.prices.length - 1);
    }

    const anomalies: any[] = [];
    for (const [itemName, group] of itemGroups) {
      if (group.prices.length < 4) continue;
      const sorted = [...group.prices].sort((a, b) => a - b);
      const outlierIndices = this.detectIQRAnomalies(sorted);
      if (outlierIndices.length > 0) {
        anomalies.push({
          item: itemName,
          outlierCount: outlierIndices.length,
          prices: group.prices.filter((_, i) => outlierIndices.includes(i)),
        });
      }
    }

    return { region: region ?? null, anomalies };
  }

  async getHETSuggestion(item: string, region?: string) {
    const result = await this.getMarketPrices(item, region);
    const { statistics } = result;

    if (statistics.count === 0) {
      return {
        item,
        region: region ?? null,
        het: 0,
        basedOn: "no_data",
        statistics,
      };
    }

    const het = Math.ceil(statistics.median * 1.1);
    return {
      item,
      region: region ?? null,
      het,
      basedOn: "median_plus_10_percent",
      statistics,
    };
  }

  private calculateMedian(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  private detectIQRAnomalies(sorted: number[]): number[] {
    if (sorted.length < 4) return [];

    const q1Idx = Math.floor(sorted.length * 0.25);
    const q3Idx = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Idx];
    const q3 = sorted[q3Idx];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const anomalyIndices: number[] = [];
    sorted.forEach((price, idx) => {
      if (price < lowerBound || price > upperBound) {
        anomalyIndices.push(idx);
      }
    });

    return anomalyIndices;
  }
}
