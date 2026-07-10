import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../core/dto/pagination.dto";
import { CreateBeneficiaryDto } from "../dto/create-beneficiary.dto";

@Injectable()
export class BeneficiaryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    pagination: PaginationDto,
    sppgId?: string,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const where = sppgId ? { sppgId } : {};
    const [items, total] = await Promise.all([
      this.prisma.beneficiary.findMany({
        where,
        skip: pagination.skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.beneficiary.count({ where }),
    ]);
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const beneficiary = await this.prisma.beneficiary.findUnique({
      where: { id },
    });
    if (!beneficiary)
      throw new NotFoundException(`Beneficiary with ID ${id} not found`);
    return beneficiary;
  }

  async create(dto: CreateBeneficiaryDto, sppgId: string) {
    return this.prisma.beneficiary.create({
      data: { ...dto, sppgId },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.beneficiary.delete({ where: { id } });
  }
}
