import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class MarketService {
  constructor(private prisma: PrismaService) {}

  async getMarketPrices(item: string, region?: string) {
    // Get all suppliers with this item
    const suppliers = await this.prisma.supplierItem.findMany({
      where: {
        name: { contains: item, mode: "insensitive" },
      },
      include: {
        supplier: true,
      },
    });

    if (suppliers.length === 0) {
      return {
        item,
        region: region || "Nasional",
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

    const prices = suppliers.map((s) => s.basePrice).sort((a, b) => a - b);
    const statistics = this.calculateStatistics(prices);

    // Identify anomalies (outliers using IQR method)
    const q1 = this.percentile(prices, 25);
    const q3 = this.percentile(prices, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return {
      item,
      region: region || "Nasional",
      statistics,
      suppliers: suppliers.map((s) => ({
        id: s.supplier.id,
        name: s.supplier.name,
        price: s.basePrice,
        isAnomaly: s.basePrice < lowerBound || s.basePrice > upperBound,
      })),
    };
  }

  async getAnomalies(region?: string) {
    // Get all items
    const items = await this.prisma.supplierItem.findMany({
      select: { name: true },
      distinct: ["name"],
    });

    const anomalies: Array<{
      item: string;
      anomalies: Array<{
        id: string;
        name: string;
        price: number;
        isAnomaly: boolean;
      }>;
    }> = [];
    for (const item of items) {
      const marketData = await this.getMarketPrices(item.name, region);
      const itemAnomalies = marketData.suppliers.filter((s) => s.isAnomaly);
      if (itemAnomalies.length > 0) {
        anomalies.push({
          item: item.name,
          anomalies: itemAnomalies,
        });
      }
    }

    return anomalies;
  }

  async getHETSuggestion(item: string, region?: string) {
    const marketData = await this.getMarketPrices(item, region);

    // HET suggestion: median price + 10% buffer
    const hetSuggestion = marketData.statistics.median * 1.1;

    return {
      item,
      region: region || "Nasional",
      currentStatistics: marketData.statistics,
      hetSuggestion: Math.round(hetSuggestion),
      recommendation:
        hetSuggestion > marketData.statistics.median
          ? "HET disarankan 10% di atas median untuk akomodasi fluktuasi harga"
          : "HET mengikuti median pasar",
    };
  }

  private calculateStatistics(prices: number[]) {
    if (prices.length === 0) {
      return { min: 0, max: 0, median: 0, mean: 0, count: 0 };
    }

    const min = prices[0];
    const max = prices[prices.length - 1];
    const median = this.percentile(prices, 50);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      min,
      max,
      median: Math.round(median),
      mean: Math.round(mean),
      count: prices.length,
    };
  }

  private percentile(sorted: number[], p: number): number {
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (upper >= sorted.length) return sorted[lower];
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}
