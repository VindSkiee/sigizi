import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../database/prisma.service";
import {
  BeneficiaryRepository,
  FindAllBeneficiaryParams,
  CreateBeneficiaryData,
  UpdateBeneficiaryData,
} from "../../domain";
import { Beneficiary } from "../../domain";

@Injectable()
export class PrismaBeneficiaryRepository implements BeneficiaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllBeneficiaryParams = {}): Promise<Beneficiary[]> {
    const { skip = 0, take = 20, sppgId, search } = params;

    const where: any = {};
    if (sppgId) where.sppgId = sppgId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { institution: { contains: search, mode: "insensitive" } },
      ];
    }

    const items = await this.prisma.beneficiary.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { sppg: true },
    });

    return items.map((item) => this.toDomain(item));
  }

  async findById(id: string): Promise<Beneficiary | null> {
    const item = await this.prisma.beneficiary.findUnique({
      where: { id },
      include: { sppg: true },
    });
    return item ? this.toDomain(item) : null;
  }

  async count(
    params: { sppgId?: string; search?: string } = {},
  ): Promise<number> {
    const { sppgId, search } = params;

    const where: any = {};
    if (sppgId) where.sppgId = sppgId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { institution: { contains: search, mode: "insensitive" } },
      ];
    }

    return this.prisma.beneficiary.count({ where });
  }

  async create(data: CreateBeneficiaryData): Promise<Beneficiary> {
    const item = await this.prisma.beneficiary.create({
      data: {
        name: data.name,
        institution: data.institution,
        institutionType: data.institutionType,
        totalBeneficiary: data.totalBeneficiary,
        address: data.address,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        sppgId: data.sppgId,
      },
      include: { sppg: true },
    });
    return this.toDomain(item);
  }

  async update(id: string, data: UpdateBeneficiaryData): Promise<Beneficiary> {
    const item = await this.prisma.beneficiary.update({
      where: { id },
      data,
      include: { sppg: true },
    });
    return this.toDomain(item);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.beneficiary.delete({ where: { id } });
  }

  private toDomain(prismaItem: any): Beneficiary {
    return new Beneficiary(
      prismaItem.id,
      prismaItem.name,
      prismaItem.institution,
      prismaItem.institutionType,
      prismaItem.totalBeneficiary,
      prismaItem.address,
      prismaItem.contactPhone,
      prismaItem.contactEmail,
      prismaItem.sppgId,
      prismaItem.createdAt,
      prismaItem.updatedAt,
    );
  }
}
