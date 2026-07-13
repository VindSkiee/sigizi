import { Injectable, BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import {
  calculateDistanceKm,
  findWithinRadius,
} from "../../../core/utils/geolocation";
import { GpsCoordinate } from "../../../core/domain/value-objects/gps-coordinate.vo";
import { MarketLocationFilterDto } from "../dto/market-location-filter.dto";

const MIN_MATURE_SAMPLE = 5;
const MIN_IQR_SAMPLE = 4;
const DEFAULT_RADIUS_KM = 25;
const MAX_RADIUS_KM = 50;

type MarketScopeUsed =
  "district" | "regency" | "province" | "gps_radius" | "master";

type HETBasedOn =
  | "master_reference_cold_start"
  | "blended_small_sample"
  | "clean_dynamic_median"
  | "all_anomaly_fallback";

interface IQRBounds {
  lower: number;
  upper: number;
}

interface PriceStatistics {
  min: number;
  max: number;
  median: number;
  mean: number;
  count: number;
}

export interface DualPriceStatistics {
  raw: PriceStatistics;
  clean: PriceStatistics;
}

interface SupplierItemWithSupplier {
  id: string;
  name: string;
  basePrice: number;
  supplier: {
    id: string;
    name: string;
    province: string;
    regency: string;
    district: string;
    latitude: number | null;
    longitude: number | null;
  };
}

interface ResolvedScope {
  scopeUsed: MarketScopeUsed;
  items: SupplierItemWithSupplier[];
  effectiveRadiusKm?: number;
}

interface ScopeCandidate {
  scopeUsed: MarketScopeUsed;
  items: SupplierItemWithSupplier[];
}

@Injectable()
export class MarketService {
  private static readonly MASTER_REFERENCE_PRICES: ReadonlyArray<{
    keywords: readonly string[];
    price: number;
  }> = [
    { keywords: ["beras"], price: 15_000 },
    { keywords: ["kentang"], price: 12_000 },
    { keywords: ["ayam"], price: 40_000 },
    { keywords: ["sapi"], price: 120_000 },
    { keywords: ["telur"], price: 28_000 },
    { keywords: ["ikan"], price: 35_000 },
    { keywords: ["tahu"], price: 8_000 },
    { keywords: ["tempe"], price: 10_000 },
    { keywords: ["susu"], price: 18_000 },
    { keywords: ["minyak"], price: 16_000 },
    { keywords: ["wortel"], price: 10_000 },
    { keywords: ["bayam"], price: 8_000 },
    { keywords: ["sawi"], price: 7_000 },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async getMarketPrices(item: string, filter: MarketLocationFilterDto = {}) {
    this.validateLocationFilter(filter);

    const allItems = await this.fetchSupplierItems(item, filter);
    const resolved = this.resolveScope(allItems, filter);
    const prices = resolved.items.map((si) => si.basePrice);
    const statistics = this.buildDualStatistics(prices);
    const bounds =
      prices.length >= MIN_IQR_SAMPLE
        ? this.calculateIQRBounds([...prices].sort((a, b) => a - b))
        : null;

    const suppliers = this.mapSuppliers(resolved.items, filter, bounds);

    return {
      item,
      filter: this.serializeFilter(filter, resolved.effectiveRadiusKm),
      scopeUsed: resolved.scopeUsed,
      sampleCount: resolved.items.length,
      effectiveRadiusKm: resolved.effectiveRadiusKm ?? null,
      statistics,
      suppliers,
    };
  }

  async getAnomalies(filter: MarketLocationFilterDto = {}) {
    this.validateLocationFilter(filter);

    const allItems = await this.fetchSupplierItems(undefined, filter);
    const scopedItems = this.resolveScope(allItems, filter).items;

    const itemGroups = new Map<string, number[]>();
    for (const supplierItem of scopedItems) {
      const prices = itemGroups.get(supplierItem.name) ?? [];
      prices.push(supplierItem.basePrice);
      itemGroups.set(supplierItem.name, prices);
    }

    const anomalies: Array<{
      item: string;
      outlierCount: number;
      prices: number[];
    }> = [];

    for (const [itemName, prices] of itemGroups) {
      if (prices.length < MIN_IQR_SAMPLE) continue;

      const sorted = [...prices].sort((a, b) => a - b);
      const bounds = this.calculateIQRBounds(sorted);
      if (!bounds) continue;

      const outlierPrices = prices.filter(
        (price) => price < bounds.lower || price > bounds.upper,
      );

      if (outlierPrices.length > 0) {
        anomalies.push({
          item: itemName,
          outlierCount: outlierPrices.length,
          prices: outlierPrices,
        });
      }
    }

    return {
      filter: this.serializeFilter(filter),
      anomalies,
    };
  }

  async getHETSuggestion(item: string, filter: MarketLocationFilterDto = {}) {
    const result = await this.getMarketPrices(item, filter);
    const masterPrice = this.getMasterReferencePrice(item);
    const { statistics, sampleCount, scopeUsed } = result;

    if (sampleCount === 0 || scopeUsed === "master") {
      return {
        item,
        filter: result.filter,
        scopeUsed: result.scopeUsed,
        het: Math.ceil(masterPrice),
        basedOn: "master_reference_cold_start" satisfies HETBasedOn,
        statistics,
      };
    }

    if (sampleCount < MIN_MATURE_SAMPLE) {
      const het = Math.ceil(((masterPrice + statistics.raw.mean) / 2) * 1.1);
      return {
        item,
        filter: result.filter,
        scopeUsed: result.scopeUsed,
        het,
        basedOn: "blended_small_sample" satisfies HETBasedOn,
        statistics,
      };
    }

    if (statistics.clean.count === 0) {
      return {
        item,
        filter: result.filter,
        scopeUsed: result.scopeUsed,
        het: Math.ceil(masterPrice),
        basedOn: "all_anomaly_fallback" satisfies HETBasedOn,
        statistics,
      };
    }

    const het = Math.ceil(statistics.clean.median * 1.1);
    return {
      item,
      filter: result.filter,
      scopeUsed: result.scopeUsed,
      het,
      basedOn: "clean_dynamic_median" satisfies HETBasedOn,
      statistics,
    };
  }

  private validateLocationFilter(filter: MarketLocationFilterDto): void {
    const hasLatitude = filter.latitude !== undefined;
    const hasLongitude = filter.longitude !== undefined;

    if (hasLatitude !== hasLongitude) {
      throw new BadRequestException(
        "latitude dan longitude harus disertakan bersamaan",
      );
    }

    const hasAdmin = !!(filter.province || filter.regency || filter.district);
    const hasGps = hasLatitude && hasLongitude;

    if (hasAdmin && hasGps) {
      throw new BadRequestException(
        "Filter admin (province/regency/district) dan filter GPS (latitude/longitude) tidak bisa digunakan bersamaan. Gunakan salah satu mode.",
      );
    }
  }

  private async fetchSupplierItems(
    item: string | undefined,
    filter: MarketLocationFilterDto,
  ): Promise<SupplierItemWithSupplier[]> {
    const where: Prisma.SupplierItemWhereInput = {};

    if (item) {
      where.name = { contains: item, mode: "insensitive" };
    }

    if (filter.province) {
      where.supplier = {
        is: {
          province: {
            equals: filter.province,
            mode: "insensitive",
          },
        },
      };
    }

    return this.prisma.supplierItem.findMany({
      where,
      include: { supplier: true },
    });
  }

  private resolveScope(
    allItems: SupplierItemWithSupplier[],
    filter: MarketLocationFilterDto,
  ): ResolvedScope {
    if (filter.latitude !== undefined && filter.longitude !== undefined) {
      const gpsResolved = this.resolveGpsCascade(allItems, filter);
      if (gpsResolved.items.length > 0 || gpsResolved.scopeUsed === "master") {
        return gpsResolved;
      }
    }

    if (filter.district || filter.regency || filter.province) {
      return this.resolveAdminCascade(allItems, filter);
    }

    if (allItems.length >= MIN_MATURE_SAMPLE) {
      return { scopeUsed: "province", items: allItems };
    }

    if (allItems.length > 0) {
      return { scopeUsed: "province", items: allItems };
    }

    return { scopeUsed: "master", items: [] };
  }

  private resolveAdminCascade(
    allItems: SupplierItemWithSupplier[],
    filter: MarketLocationFilterDto,
  ): ResolvedScope {
    const candidates: ScopeCandidate[] = [];

    if (filter.district) {
      candidates.push({
        scopeUsed: "district",
        items: allItems.filter((item) =>
          this.matchesAdminScope(item, {
            province: filter.province,
            regency: filter.regency,
            district: filter.district,
          }),
        ),
      });
    }

    if (filter.regency) {
      candidates.push({
        scopeUsed: "regency",
        items: allItems.filter((item) =>
          this.matchesAdminScope(item, {
            province: filter.province,
            regency: filter.regency,
          }),
        ),
      });
    }

    if (filter.province) {
      candidates.push({
        scopeUsed: "province",
        items: allItems.filter((item) =>
          this.matchesAdminScope(item, {
            province: filter.province,
          }),
        ),
      });
    }

    const matureScope = candidates.find(
      (candidate) => candidate.items.length >= MIN_MATURE_SAMPLE,
    );
    if (matureScope) {
      return {
        scopeUsed: matureScope.scopeUsed,
        items: matureScope.items,
      };
    }

    const bestScope = [...candidates].sort(
      (left, right) => right.items.length - left.items.length,
    )[0];

    if (bestScope && bestScope.items.length > 0) {
      return {
        scopeUsed: bestScope.scopeUsed,
        items: bestScope.items,
      };
    }

    return { scopeUsed: "master", items: [] };
  }

  private resolveGpsCascade(
    allItems: SupplierItemWithSupplier[],
    filter: MarketLocationFilterDto,
  ): ResolvedScope {
    const center = new GpsCoordinate(filter.latitude!, filter.longitude!);
    const baseRadius = filter.radiusKm ?? DEFAULT_RADIUS_KM;
    const radii = Array.from(
      new Set([
        baseRadius,
        Math.min(baseRadius * 3, MAX_RADIUS_KM),
        Math.min(baseRadius * 5, MAX_RADIUS_KM),
        MAX_RADIUS_KM,
      ]),
    ).sort((a, b) => a - b);

    const points = allItems
      .map((item) => {
        const coordinate = GpsCoordinate.fromPrisma(item.supplier);
        if (!coordinate) return null;

        return {
          item,
          id: item.id,
          coordinate,
        };
      })
      .filter(
        (
          point,
        ): point is {
          item: SupplierItemWithSupplier;
          id: string;
          coordinate: GpsCoordinate;
        } => point !== null,
      );

    for (const radiusKm of radii) {
      const withinRadius = findWithinRadius(center, points, radiusKm);
      if (withinRadius.length >= MIN_MATURE_SAMPLE) {
        return {
          scopeUsed: "gps_radius",
          items: withinRadius.map((point) => point.item),
          effectiveRadiusKm: radiusKm,
        };
      }
    }

    for (let index = radii.length - 1; index >= 0; index -= 1) {
      const radiusKm = radii[index];
      const withinRadius = findWithinRadius(center, points, radiusKm);
      if (withinRadius.length > 0) {
        return {
          scopeUsed: "gps_radius",
          items: withinRadius.map((point) => point.item),
          effectiveRadiusKm: radiusKm,
        };
      }
    }

    if (filter.district || filter.regency || filter.province) {
      return this.resolveAdminCascade(allItems, filter);
    }

    return { scopeUsed: "master", items: [] };
  }

  private matchesAdminScope(
    item: SupplierItemWithSupplier,
    scope: {
      province?: string;
      regency?: string;
      district?: string;
    },
  ): boolean {
    if (
      scope.province &&
      !this.matchesRegionField(item.supplier.province, scope.province)
    ) {
      return false;
    }

    if (
      scope.regency &&
      !this.matchesRegionField(item.supplier.regency, scope.regency)
    ) {
      return false;
    }

    if (
      scope.district &&
      !this.matchesRegionField(item.supplier.district, scope.district)
    ) {
      return false;
    }

    return true;
  }

  private matchesRegionField(value: string, expected: string): boolean {
    const normalizedValue = this.normalizeRegion(value);
    const normalizedExpected = this.normalizeRegion(expected);

    return (
      normalizedValue === normalizedExpected ||
      normalizedValue.includes(normalizedExpected) ||
      normalizedExpected.includes(normalizedValue)
    );
  }

  private normalizeRegion(value: string): string {
    return value
      .toLowerCase()
      .replace(/^kab\.?\s*/i, "")
      .replace(/\s+/g, "_")
      .trim();
  }

  private buildDualStatistics(prices: number[]): DualPriceStatistics {
    const raw = this.computeStatistics(prices);
    const emptyStats = this.emptyStatistics();

    if (prices.length < MIN_MATURE_SAMPLE) {
      return { raw, clean: emptyStats };
    }

    const sorted = [...prices].sort((a, b) => a - b);
    const bounds = this.calculateIQRBounds(sorted);
    if (!bounds) {
      return { raw, clean: emptyStats };
    }

    const cleanPrices = prices.filter(
      (price) => price >= bounds.lower && price <= bounds.upper,
    );

    return {
      raw,
      clean:
        cleanPrices.length > 0
          ? this.computeStatistics(cleanPrices)
          : emptyStats,
    };
  }

  private computeStatistics(prices: number[]): PriceStatistics {
    if (prices.length === 0) {
      return this.emptyStatistics();
    }

    const sorted = [...prices].sort((a, b) => a - b);
    const sum = prices.reduce((total, price) => total + price, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: this.calculateMedian(sorted),
      mean: sum / prices.length,
      count: prices.length,
    };
  }

  private emptyStatistics(): PriceStatistics {
    return {
      min: 0,
      max: 0,
      median: 0,
      mean: 0,
      count: 0,
    };
  }

  private mapSuppliers(
    items: SupplierItemWithSupplier[],
    filter: MarketLocationFilterDto,
    bounds: IQRBounds | null,
  ) {
    const center =
      filter.latitude !== undefined && filter.longitude !== undefined
        ? new GpsCoordinate(filter.latitude, filter.longitude)
        : null;

    return items.map((item) => {
      const coordinate = GpsCoordinate.fromPrisma(item.supplier);
      const distanceKm =
        center && coordinate
          ? calculateDistanceKm(center, coordinate)
          : undefined;

      const isAnomaly =
        bounds !== null &&
        (item.basePrice < bounds.lower || item.basePrice > bounds.upper);

      return {
        id: item.supplier.id,
        name: item.supplier.name,
        price: item.basePrice,
        isAnomaly,
        latitude: item.supplier.latitude ?? undefined,
        longitude: item.supplier.longitude ?? undefined,
        distanceKm,
      };
    });
  }

  private serializeFilter(
    filter: MarketLocationFilterDto,
    effectiveRadiusKm?: number,
  ) {
    return {
      province: filter.province ?? null,
      regency: filter.regency ?? null,
      district: filter.district ?? null,
      latitude: filter.latitude ?? null,
      longitude: filter.longitude ?? null,
      radiusKm: effectiveRadiusKm ?? filter.radiusKm ?? null,
    };
  }

  private getMasterReferencePrice(item: string): number {
    const normalizedItem = item.toLowerCase();

    for (const entry of MarketService.MASTER_REFERENCE_PRICES) {
      if (entry.keywords.some((keyword) => normalizedItem.includes(keyword))) {
        return entry.price;
      }
    }

    return 20_000;
  }

  private calculateMedian(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
  }

  private calculateIQRBounds(sorted: number[]): IQRBounds | null {
    if (sorted.length < MIN_IQR_SAMPLE) return null;

    const q1Idx = Math.floor(sorted.length * 0.25);
    const q3Idx = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Idx];
    const q3 = sorted[q3Idx];
    const iqr = q3 - q1;

    return {
      lower: q1 - 1.5 * iqr,
      upper: q3 + 1.5 * iqr,
    };
  }
}
