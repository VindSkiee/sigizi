import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SPPG_REPOSITORY } from "../../domain";
import type { SppgRepository } from "../../domain";
import { CreateSppgDto } from "../dto/create-sppg.dto";
import { UpdateSppgDto } from "../dto/update-sppg.dto";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../../core/dto/pagination.dto";

@Injectable()
export class SppgService {
  constructor(
    @Inject(SPPG_REPOSITORY)
    private readonly repository: SppgRepository,
  ) {}

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const [items, total] = await Promise.all([
      this.repository.findAll({
        skip: pagination.skip,
        take: limit,
      }),
      this.repository.count(),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const sppg = await this.repository.findById(id);
    if (!sppg) {
      throw new NotFoundException(`SPPG with ID ${id} not found`);
    }
    return sppg;
  }

  async create(dto: CreateSppgDto) {
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateSppgDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`SPPG with ID ${id} not found`);
    }
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`SPPG with ID ${id} not found`);
    }
    await this.repository.delete(id);
  }
}
