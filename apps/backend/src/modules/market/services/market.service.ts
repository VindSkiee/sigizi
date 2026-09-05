import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";
import {
  calculateDistanceKm,
  findWithinRadius,
} from "../../../core/utils/geolocation";
import { GpsCoordinate } from "../../../core/domain/value-objects/gps-coordinate.vo";
import { MarketLocationFilterDto } from "../dto/market-location-filter.dto";
import {
  MarketPaginatedResponse,
  buildMarketPaginatedResponse,
} from "../dto/market-paginated-response.dto";
import { normalizeRegion, matchesRegion } from "@sigizi/shared";

const MIN_MATURE_SAMPLE = 5;
const MIN_IQR_SAMPLE = 4;
const DEFAULT_RADIUS_KM = 25;
const MAX_RADIUS_KM = 50;

type MarketScopeUsed =
  "district" | "regency" | "province" | "gps_radius" | "master";

type HETBasedOn =
  | "master_reference_cold_start"
  | "blended_small_sample"
  | "clean_dynamic_median";

export interface IQRBounds {
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
  stock: number;
  priceUpdatedAt: Date | null;
  stockUpdatedAt: Date | null;
  commodityId: string | null;
  supplier: {
    id: string;
    name: string;
    address: string | null;
    province: string;
    regency: string;
    district: string | null;
    latitude: number | null;
    longitude: number | null;
    isMarketSeller: boolean;
    marketName: string | null;
    openStatus: boolean;
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

export interface MarketValidationContext {
  itemName: string;
  masterPrice: number;
  scopeUsed: MarketScopeUsed;
  sampleCount: number;
  statistics: DualPriceStatistics;
  iqrBounds: IQRBounds | null;
  basedOn: HETBasedOn;
}

export interface IntegratedValidationResult {
  status: "VALID" | "WARNING" | "INVALID";
  reason: string;
  recommendation: string;
  marketMedianSnapshot: number;
}

@Injectable()
export class MarketService {
  private static readonly FALLBACK_MASTER_PRICE = 20_000;

  constructor(private readonly prisma: PrismaService) {}

  async getMarketPrices(item: string, filter: MarketLocationFilterDto = {}) {
    this.validateLocationFilter(filter);

    const allItems = await this.fetchSupplierItems(item, filter);
    const resolved = this.resolveScope(allItems, filter);
    return this.buildMarketPricesResult(item, filter, resolved);
  }

  async getMarketPricesRaw(item: string, filter: MarketLocationFilterDto = {}) {
    this.validateLocationFilter(filter);

    const allItems = await this.fetchSupplierItems(item, filter);
    const resolved = this.resolveScope(allItems, filter);
    return this.buildMarketPricesResult(item, filter, resolved);
  }

  async getItemDetail(id: string) {
    const raw = await this.prisma.supplierItem.findUnique({
      where: { id },
      include: {
        supplier: true,
        commodity: {
          include: { category: true },
        },
      },
    });

    if (!raw || raw.deletedAt) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    return {
      item: {
        id: raw.id,
        name: raw.name,
        unit: raw.unit,
        basePrice: raw.basePrice,
        description: raw.description,
        minOrderQty: raw.minOrderQty,
        orderStep: raw.orderStep,
        isAvailable: raw.isAvailable,
        image: raw.image,
        stock: raw.stock,
        priceUpdatedAt: raw.priceUpdatedAt?.toISOString() ?? null,
        stockUpdatedAt: raw.stockUpdatedAt?.toISOString() ?? null,
        commodityId: raw.commodityId ?? null,
        commodity: raw.commodity
          ? {
              id: raw.commodity.id,
              name: raw.commodity.name,
              referencePrice: raw.commodity.referencePrice,
              category: {
                id: raw.commodity.category.id,
                name: raw.commodity.category.name,
              },
            }
          : null,
        createdAt: raw.createdAt.toISOString(),
      },
      supplier: {
        id: raw.supplier.id,
        name: raw.supplier.name,
        phone: raw.supplier.phone ?? null,
        profileImage: raw.supplier.profileImage ?? null,
        address: raw.supplier.address ?? null,
        province: raw.supplier.province,
        regency: raw.supplier.regency,
        district: raw.supplier.district ?? null,
        latitude: raw.supplier.latitude ?? null,
        longitude: raw.supplier.longitude ?? null,
        openStatus: raw.supplier.openStatus,
        isMarketSeller: raw.supplier.isMarketSeller,
        marketName: raw.supplier.marketName ?? null,
      },
    };
  }

  private buildMarketPricesResult(
    item: string,
    filter: MarketLocationFilterDto,
    resolved: ResolvedScope,
  ) {
    const prices = resolved.items.map((si) => si.basePrice);
    const statistics = this.buildDualStatistics(prices);
    const bounds =
      prices.length >= MIN_IQR_SAMPLE
        ? this.calculateIQRBounds([...prices].sort((a, b) => a - b))
        : null;

    const hasGps =
      filter.latitude !== undefined && filter.longitude !== undefined;
    const sorted = this.sortSupplierItems(resolved.items, hasGps, filter);
    const suppliers = this.mapSuppliers(sorted, filter, bounds);

    return {
      item,
      filter: this.serializeFilter(filter, resolved.effectiveRadiusKm),
      scopeUsed: resolved.scopeUsed,
      sampleCount: resolved.items.length,
      effectiveRadiusKm: resolved.effectiveRadiusKm ?? null,
      statistics,
      iqrBounds: bounds,
      suppliers,
    };
  }

  async getDistinctMarkets(
    province: string,
    regency: string,
    item?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const where: any = {
      isMarketSeller: true,
      province: { equals: normalizeRegion(province), mode: "insensitive" },
      regency: { equals: normalizeRegion(regency), mode: "insensitive" },
      marketName: { not: null },
    };

    const suppliers = await this.prisma.supplier.findMany({
      where,
      select: {
        id: true,
        marketName: true,
        items: {
          where: {
            deletedAt: null,
            stock: { gt: 0 },
            ...(item ? { name: { contains: item, mode: "insensitive" } } : {}),
          },
          select: { id: true },
        },
      },
      orderBy: { marketName: "asc" },
    });

    const marketData = new Map<
      string,
      { suppliers: Set<string>; items: Set<string> }
    >();

    for (const s of suppliers) {
      if (s.marketName && s.items.length > 0) {
        if (!marketData.has(s.marketName)) {
          marketData.set(s.marketName, {
            suppliers: new Set(),
            items: new Set(),
          });
        }
        const data = marketData.get(s.marketName)!;
        data.suppliers.add(s.id);
        s.items.forEach((item) => data.items.add(item.id));
      }
    }

    const allMarkets = Array.from(marketData.entries())
      .map(([name, data]) => ({
        name,
        supplierCount: data.suppliers.size,
        itemCount: data.items.size,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const total = allMarkets.length;
    const start = (page - 1) * limit;
    const pagedMarkets = allMarkets.slice(start, start + limit);

    return buildMarketPaginatedResponse(pagedMarkets, total, page, limit);
  }

  async getSupplierRegions(page: number = 1, limit: number = 20) {
    const suppliers = await this.prisma.supplier.findMany({
      where: {
        items: { some: { deletedAt: null, stock: { gt: 0 } } },
      },
      select: { province: true, regency: true },
      distinct: ["province", "regency"],
      orderBy: [{ province: "asc" }, { regency: "asc" }],
    });

    const provinceMap = new Map<string, Set<string>>();
    for (const s of suppliers) {
      if (!provinceMap.has(s.province)) {
        provinceMap.set(s.province, new Set());
      }
      provinceMap.get(s.province)!.add(s.regency);
    }

    const allProvinces = Array.from(provinceMap.entries()).map(
      ([province, regencies]) => ({
        province,
        regencies: Array.from(regencies).sort(),
      }),
    );

    const total = allProvinces.length;
    const start = (page - 1) * limit;
    const pagedProvinces = allProvinces.slice(start, start + limit);

    return buildMarketPaginatedResponse(pagedProvinces, total, page, limit);
  }

  async getAnomalies(filter: MarketLocationFilterDto = {}) {
    this.validateLocationFilter(filter);

    const allItems = await this.fetchSupplierItems(undefined, filter);
    const scopedItems = this.resolveScope(allItems, filter).items;

    // Group by commodityId (fallback to name for items without commodity)
    const itemGroups = new Map<string, { name: string; prices: number[] }>();
    for (const supplierItem of scopedItems) {
      const groupKey = supplierItem.commodityId ?? supplierItem.name;
      const existing = itemGroups.get(groupKey);
      if (existing) {
        existing.prices.push(supplierItem.basePrice);
      } else {
        itemGroups.set(groupKey, {
          name: supplierItem.name,
          prices: [supplierItem.basePrice],
        });
      }
    }

    const allAnomalies: Array<{
      item: string;
      commodityId: string | null;
      outlierCount: number;
      prices: number[];
    }> = [];

    for (const [groupKey, group] of itemGroups) {
      if (group.prices.length < MIN_IQR_SAMPLE) continue;

      const sorted = [...group.prices].sort((a, b) => a - b);
      const bounds = this.calculateIQRBounds(sorted);
      if (!bounds) continue;

      const outlierPrices = group.prices.filter(
        (price) => price < bounds.lower || price > bounds.upper,
      );

      if (outlierPrices.length > 0) {
        allAnomalies.push({
          item: group.name,
          commodityId: groupKey === group.name ? null : groupKey,
          outlierCount: outlierPrices.length,
          prices: outlierPrices,
        });
      }
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const total = allAnomalies.length;
    const start = (page - 1) * limit;
    const pagedAnomalies = allAnomalies.slice(start, start + limit);

    return buildMarketPaginatedResponse(
      {
        filter: this.serializeFilter(filter),
        anomalies: pagedAnomalies,
      },
      total,
      page,
      limit,
    );
  }

  async getHETSuggestion(item: string, filter: MarketLocationFilterDto = {}) {
    const result = await this.getMarketPricesRaw(item, filter);
    const masterPrice = await this.getMasterReferencePrice(
      item,
      filter.commodityId,
    );
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

  // =========================================================================
  // PRICE VALIDATION
  // =========================================================================

  async getMarketContextForItem(
    itemName: string,
    filter: MarketLocationFilterDto = {},
  ): Promise<MarketValidationContext> {
    const masterPrice = await this.getMasterReferencePrice(
      itemName,
      filter.commodityId,
    );
    const marketPrices = await this.getMarketPricesRaw(itemName, filter);

    let basedOn: HETBasedOn;
    if (marketPrices.sampleCount === 0 || marketPrices.scopeUsed === "master") {
      basedOn = "master_reference_cold_start";
    } else if (marketPrices.sampleCount < MIN_MATURE_SAMPLE) {
      basedOn = "blended_small_sample";
    } else {
      basedOn = "clean_dynamic_median";
    }

    return {
      itemName,
      masterPrice,
      scopeUsed: marketPrices.scopeUsed,
      sampleCount: marketPrices.sampleCount,
      statistics: marketPrices.statistics,
      iqrBounds: marketPrices.iqrBounds ?? null,
      basedOn,
    };
  }

  async validatePrice(
    itemName: string,
    proposedPrice: number,
    filter: MarketLocationFilterDto = {},
  ): Promise<IntegratedValidationResult> {
    const ctx = await this.getMarketContextForItem(itemName, filter);
    return this.evaluatePrice(ctx, proposedPrice);
  }

  private evaluatePrice(
    ctx: MarketValidationContext,
    proposedPrice: number,
  ): IntegratedValidationResult {
    // ── Cold Start ──
    if (ctx.basedOn === "master_reference_cold_start") {
      if (proposedPrice > ctx.masterPrice * 1.2) {
        return {
          status: "INVALID",
          reason: `Harga melebihi jaring pengaman batas atas nasional sebesar 20% (Master: Rp ${ctx.masterPrice.toLocaleString("id-ID")})`,
          recommendation: `Negosiasikan harga di bawah Rp ${(ctx.masterPrice * 1.2).toLocaleString("id-ID")}`,
          marketMedianSnapshot: ctx.masterPrice,
        };
      }
      if (proposedPrice > ctx.masterPrice * 1.05) {
        return {
          status: "WARNING",
          reason: "Harga sedikit berada di atas acuan master baku nasional",
          recommendation:
            "Diizinkan jika stok lokal langka, namun wajib input alasan justifikasi",
          marketMedianSnapshot: ctx.masterPrice,
        };
      }
      return {
        status: "VALID",
        reason: "",
        recommendation: "",
        marketMedianSnapshot: ctx.masterPrice,
      };
    }

    // ── Mature Market (clean_dynamic_median / blended_small_sample) ──
    if (ctx.iqrBounds) {
      if (proposedPrice > ctx.iqrBounds.upper) {
        return {
          status: "INVALID",
          reason:
            "Harga terdeteksi sebagai outlier ekstrem di atas batas wajar pasar lokal",
          recommendation: `Batas atas pasar: Rp ${ctx.iqrBounds.upper.toLocaleString("id-ID")}`,
          marketMedianSnapshot: ctx.statistics.clean.median ?? ctx.masterPrice,
        };
      }
      if (proposedPrice < ctx.iqrBounds.lower) {
        return {
          status: "WARNING",
          reason:
            "Harga dicurigai terlalu rendah di bawah batas bawah statistik pasar. Potensi kualitas komoditas buruk",
          recommendation:
            "Lakukan verifikasi fisik kualitas bahan makanan ke supplier sebelum menerima pengiriman",
          marketMedianSnapshot: ctx.statistics.clean.median ?? ctx.masterPrice,
        };
      }
    }

    // ── Deviasi Median Pasar Bersih ──
    if (ctx.statistics.clean.count > 0) {
      const deviation =
        (proposedPrice - ctx.statistics.clean.median) /
        ctx.statistics.clean.median;
      if (deviation > 0.15) {
        return {
          status: "WARNING",
          reason: `Harga mengalami pembengkakan sebesar ${(deviation * 100).toFixed(1)}% dari rata-rata median pasar bersih riil`,
          recommendation:
            "Pertimbangkan harga lebih rendah atau justifikasi alasan kenaikan",
          marketMedianSnapshot: ctx.statistics.clean.median,
        };
      }
    }

    return {
      status: "VALID",
      reason: "",
      recommendation: "",
      marketMedianSnapshot: ctx.statistics.clean.median ?? ctx.masterPrice,
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
    const where: Prisma.SupplierItemWhereInput = {
      deletedAt: null,
      stock: { gt: 0 },
    };

    if (item) {
      where.name = { contains: item, mode: "insensitive" };
    }

    // Taxonomy filters
    if (filter.commodityId) {
      where.commodityId = filter.commodityId;
    }

    if (filter.categoryId) {
      where.commodity = { categoryId: filter.categoryId };
    }

    const supplierFilter: Record<string, any> = {};

    if (filter.province) {
      supplierFilter.province = {
        equals: normalizeRegion(filter.province),
        mode: "insensitive",
      };
    }

    if (filter.regency) {
      supplierFilter.regency = {
        equals: normalizeRegion(filter.regency),
        mode: "insensitive",
      };
    }

    if (filter.marketName) {
      supplierFilter.marketName = {
        equals: filter.marketName,
        mode: "insensitive",
      };
    }

    if (Object.keys(supplierFilter).length > 0) {
      where.supplier = { is: supplierFilter };
    }

    return this.prisma.supplierItem.findMany({
      where,
      select: {
        id: true,
        name: true,
        basePrice: true,
        stock: true,
        priceUpdatedAt: true,
        stockUpdatedAt: true,
        commodityId: true,
        supplier: {
          select: {
            id: true,
            name: true,
            address: true,
            province: true,
            regency: true,
            district: true,
            latitude: true,
            longitude: true,
            isMarketSeller: true,
            marketName: true,
            openStatus: true,
          },
        },
      },
    }) as unknown as Promise<SupplierItemWithSupplier[]>;
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
      !this.matchesRegionField(item.supplier.district ?? "", scope.district)
    ) {
      return false;
    }

    return true;
  }

  private matchesRegionField(value: string, expected: string): boolean {
    return matchesRegion(value, expected);
  }

  private sortSupplierItems(
    items: SupplierItemWithSupplier[],
    isGpsMode: boolean,
    filter: MarketLocationFilterDto,
  ): SupplierItemWithSupplier[] {
    if (!isGpsMode) {
      return [...items].sort((a, b) => {
        if (b.stock !== a.stock) return b.stock - a.stock;
        if (a.priceUpdatedAt && b.priceUpdatedAt) {
          const diff = b.priceUpdatedAt.getTime() - a.priceUpdatedAt.getTime();
          if (diff !== 0) return diff;
        } else if (a.priceUpdatedAt) return -1;
        else if (b.priceUpdatedAt) return 1;
        if (a.stockUpdatedAt && b.stockUpdatedAt) {
          const diff = b.stockUpdatedAt.getTime() - a.stockUpdatedAt.getTime();
          if (diff !== 0) return diff;
        } else if (a.stockUpdatedAt) return -1;
        else if (b.stockUpdatedAt) return 1;
        return a.id.localeCompare(b.id);
      });
    }

    const center = new GpsCoordinate(filter.latitude!, filter.longitude!);
    const scored = items.map((item) => {
      const coordinate = GpsCoordinate.fromPrisma(item.supplier);
      const distanceKm =
        center && coordinate
          ? calculateDistanceKm(center, coordinate)
          : Infinity;
      return { item, distanceKm };
    });

    scored.sort((a, b) => {
      if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      if (b.item.stock !== a.item.stock) return b.item.stock - a.item.stock;
      if (a.item.priceUpdatedAt && b.item.priceUpdatedAt) {
        const diff =
          b.item.priceUpdatedAt.getTime() - a.item.priceUpdatedAt.getTime();
        if (diff !== 0) return diff;
      } else if (a.item.priceUpdatedAt) return -1;
      else if (b.item.priceUpdatedAt) return 1;
      return a.item.id.localeCompare(b.item.id);
    });

    return scored.map((s) => s.item);
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

    const isSimulation = process.env.NODE_ENV !== "production";

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
        id: `${item.supplier.id}-${item.id}`,
        supplierId: item.supplier.id,
        itemId: item.id,
        name: item.supplier.name,
        price: item.basePrice,
        stock: item.stock,
        priceUpdatedAt: item.priceUpdatedAt?.toISOString() ?? null,
        stockUpdatedAt: item.stockUpdatedAt?.toISOString() ?? null,
        isAnomaly,
        address: item.supplier.address ?? undefined,
        province: item.supplier.province ?? undefined,
        regency: item.supplier.regency ?? undefined,
        district: item.supplier.district ?? undefined,
        latitude: item.supplier.latitude ?? undefined,
        longitude: item.supplier.longitude ?? undefined,
        distanceKm,
        isMarketSeller: item.supplier.isMarketSeller,
        openStatus: item.supplier.openStatus,
        marketName: item.supplier.marketName ?? undefined,
        isSimulation,
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

  private async getMasterReferencePrice(
    itemName: string,
    commodityId?: string,
  ): Promise<number> {
    // 1. If commodityId provided, look up referencePrice from ItemCommodity
    if (commodityId) {
      const commodity = await this.prisma.itemCommodity.findUnique({
        where: { id: commodityId },
        select: { referencePrice: true, name: true },
      });
      if (commodity) return commodity.referencePrice;
    }

    // 2. Try to find a matching commodity by item name
    const commodities = await this.prisma.itemCommodity.findMany({
      where: { isActive: true },
      select: { name: true, referencePrice: true },
    });

    const normalizedItem = itemName.toLowerCase();
    for (const c of commodities) {
      if (
        normalizedItem.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(normalizedItem)
      ) {
        return c.referencePrice;
      }
    }

    // 3. Fallback
    return MarketService.FALLBACK_MASTER_PRICE;
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
