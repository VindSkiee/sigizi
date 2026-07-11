import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../core/dto/pagination.dto";
import { CreateSppgDto } from "../dto/create-sppg.dto";
import { UpdateSppgDto } from "../dto/update-sppg.dto";

@Injectable()
export class SppgService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const [items, total] = await Promise.all([
      this.prisma.sppg.findMany({
        skip: pagination.skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.sppg.count(),
    ]);
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const sppg = await this.prisma.sppg.findUnique({ where: { id } });
    if (!sppg) throw new NotFoundException(`SPPG with ID ${id} not found`);
    return sppg;
  }

  async create(dto: CreateSppgDto) {
    return this.prisma.sppg.create({ data: dto });
  }

  async update(id: string, dto: UpdateSppgDto) {
    await this.findOne(id);
    return this.prisma.sppg.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.sppg.delete({ where: { id } });
  }
}
