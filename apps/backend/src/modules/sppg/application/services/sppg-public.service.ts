import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../../database/prisma.service";
import { SppgLocationFilterDto } from "../dto/sppg-location-filter.dto";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../../core/dto/pagination.dto";
import { GpsCoordinate } from "../../../../core/domain/value-objects/gps-coordinate.vo";
import { findWithinRadius } from "../../../../core/utils/geolocation";

const SPPG_SELECT_PUBLIC = {
  id: true,
  name: true,
  address: true,
  province: true,
  regency: true,
  district: true,
  village: true,
  latitude: true,
  longitude: true,
} as const;

const BATCH_SELECT_PUBLIC = {
  id: true,
  batchNumber: true,
  date: true,
  menu: true,
  status: true,
  costPerPortion: true,
  totalCost: true,
  beneficiaryCount: true,
} as const;

@Injectable()
export class SppgPublicService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    pagination: PaginationDto,
    filter: SppgLocationFilterDto,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    this.validateFilter(filter);

    // GPS mode: fetch all with coordinates, filter in-memory
    if (filter.latitude !== undefined && filter.longitude !== undefined) {
      return this.findByGps(page, limit, filter);
    }

    // Region mode or no filter
    const where: any = {};
    if (filter.province)
      where.province = {
        equals: this.normalizeRegionValue(filter.province),
        mode: "insensitive",
      };
    if (filter.regency)
      where.regency = {
        equals: this.normalizeRegionValue(filter.regency),
        mode: "insensitive",
      };
    if (filter.district)
      where.district = {
        equals: this.normalizeRegionValue(filter.district),
        mode: "insensitive",
      };
    if (filter.village)
      where.village = {
        equals: filter.village,
        mode: "insensitive",
      };

    const [items, total] = await Promise.all([
      this.prisma.sppg.findMany({
        where,
        select: {
          ...SPPG_SELECT_PUBLIC,
          _count: { select: { batches: true, beneficiaries: true } },
        },
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      this.prisma.sppg.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        batchCount: item._count.batches,
        totalBeneficiary: item._count.beneficiaries,
        _count: undefined,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const sppg = await this.prisma.sppg.findUnique({
      where: { id },
      select: {
        ...SPPG_SELECT_PUBLIC,
        _count: { select: { batches: true, beneficiaries: true } },
        beneficiaries: {
          select: { totalBeneficiary: true },
        },
        batches: {
          select: {
            ...BATCH_SELECT_PUBLIC,
          },
          orderBy: { date: "desc" },
          take: 50,
        },
      },
    });

    if (!sppg) {
      throw new NotFoundException(`SPPG with ID ${id} not found`);
    }

    const totalPortions = sppg.batches.reduce(
      (sum, b) => sum + (b.beneficiaryCount ?? 0),
      0,
    );

    const totalBeneficiary = sppg.beneficiaries.reduce(
      (sum, b) => sum + b.totalBeneficiary,
      0,
    );

    return {
      id: sppg.id,
      name: sppg.name,
      address: sppg.address,
      province: sppg.province,
      regency: sppg.regency,
      district: sppg.district,
      village: sppg.village,
      latitude: sppg.latitude,
      longitude: sppg.longitude,
      batchCount: sppg._count.batches,
      totalBeneficiary,
      totalPortions,
      batches: sppg.batches,
    };
  }

  async findBatches(
    sppgId: string,
    pagination: PaginationDto,
    status?: string,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { sppgId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.batch.findMany({
        where,
        select: BATCH_SELECT_PUBLIC,
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      this.prisma.batch.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private async findByGps(
    page: number,
    limit: number,
    filter: SppgLocationFilterDto,
  ): Promise<PaginatedResult<any>> {
    const radiusKm = filter.radiusKm ?? 25;
    const center = new GpsCoordinate(filter.latitude!, filter.longitude!);

    // Fetch all SPPGs with GPS coordinates
    const allSppgs = await this.prisma.sppg.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        ...SPPG_SELECT_PUBLIC,
        _count: { select: { batches: true, beneficiaries: true } },
      },
    });

    // Map to GPS points for radius filtering
    const points = allSppgs
      .map((sppg) => {
        const coordinate = GpsCoordinate.fromPrisma(sppg);
        if (!coordinate) return null;
        return { id: sppg.id, coordinate, data: sppg };
      })
      .filter(
        (
          p,
        ): p is {
          id: string;
          coordinate: GpsCoordinate;
          data: (typeof allSppgs)[number];
        } => p !== null,
      );

    const withinRadius = findWithinRadius(center, points, radiusKm);

    // Paginate results
    const total = withinRadius.length;
    const start = (page - 1) * limit;
    const paginatedItems = withinRadius.slice(start, start + limit);

    return {
      items: paginatedItems.map((point) => ({
        ...point.data,
        batchCount: point.data._count.batches,
        totalBeneficiary: point.data._count.beneficiaries,
        _count: undefined,
        distanceKm: Math.round(point.distance * 100) / 100,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private validateFilter(filter: SppgLocationFilterDto): void {
    const hasAdmin = !!(
      filter.province ||
      filter.regency ||
      filter.district ||
      filter.village
    );
    const hasGps =
      filter.latitude !== undefined && filter.longitude !== undefined;

    if (hasAdmin && hasGps) {
      throw new Error(
        "Filter admin (province/regency/district) dan filter GPS (latitude/longitude) tidak bisa digunakan bersamaan.",
      );
    }
  }

  /**
   * Normalize dropdown display values to DB format.
   * DB stores: "JAWA_BARAT", "PURWAKARTA"
   * Dropdown sends: "Jawa Barat", "Kab. Purwakarta"
   *
   * Steps: strip "Kab. "/"Kota " prefix → replace spaces with underscores → uppercase
   */
  private normalizeRegionValue(val: string): string {
    return val
      .replace(/^(Kab\.|Kota)\s+/i, "")
      .replace(/\s+/g, "_")
      .toUpperCase();
  }
}
