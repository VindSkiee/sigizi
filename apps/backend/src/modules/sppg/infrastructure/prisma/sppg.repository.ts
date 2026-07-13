import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../database/prisma.service";
import {
  SppgRepository,
  FindAllSppgParams,
  CreateSppgData,
  UpdateSppgData,
} from "../../domain";
import { Sppg } from "../../domain";

@Injectable()
export class PrismaSppgRepository implements SppgRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllSppgParams = {}): Promise<Sppg[]> {
    const { skip = 0, take = 20 } = params;

    const items = await this.prisma.sppg.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });

    return items.map((item) => this.toDomain(item));
  }

  async findById(id: string): Promise<Sppg | null> {
    const item = await this.prisma.sppg.findUnique({ where: { id } });
    return item ? this.toDomain(item) : null;
  }

  async count(): Promise<number> {
    return this.prisma.sppg.count();
  }

  async create(data: CreateSppgData): Promise<Sppg> {
    const item = await this.prisma.sppg.create({
      data: {
        name: data.name,
        mitraId: data.mitraId,
        address: data.address,
        province: data.province,
        regency: data.regency,
        district: data.district,
        village: data.village,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
    return this.toDomain(item);
  }

  async update(id: string, data: UpdateSppgData): Promise<Sppg> {
    const item = await this.prisma.sppg.update({
      where: { id },
      data,
    });
    return this.toDomain(item);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.sppg.delete({ where: { id } });
  }

  private toDomain(prismaItem: any): Sppg {
    return new Sppg(
      prismaItem.id,
      prismaItem.name,
      prismaItem.mitraId,
      prismaItem.address,
      prismaItem.province,
      prismaItem.regency,
      prismaItem.district,
      prismaItem.village,
      prismaItem.postalCode,
      prismaItem.latitude,
      prismaItem.longitude,
      prismaItem.createdAt,
      prismaItem.updatedAt,
    );
  }
}
