import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BENEFICIARY_REPOSITORY } from "../../domain";
import type { BeneficiaryRepository } from "../../domain";
import { CreateBeneficiaryDto } from "../dto/create-beneficiary.dto";
import { UpdateBeneficiaryDto } from "../dto/update-beneficiary.dto";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../../core/dto/pagination.dto";

@Injectable()
export class BeneficiaryService {
  constructor(
    @Inject(BENEFICIARY_REPOSITORY)
    private readonly repository: BeneficiaryRepository,
  ) {}

  async findAll(
    pagination: PaginationDto,
    sppgId?: string,
    search?: string,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const [items, total] = await Promise.all([
      this.repository.findAll({
        skip: pagination.skip,
        take: limit,
        sppgId,
        search,
      }),
      this.repository.count({ sppgId, search }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const beneficiary = await this.repository.findById(id);
    if (!beneficiary) {
      throw new NotFoundException(`Beneficiary with ID ${id} not found`);
    }
    return beneficiary;
  }

  async create(dto: CreateBeneficiaryDto, sppgId: string) {
    return this.repository.create({ ...dto, sppgId });
  }

  async update(id: string, dto: UpdateBeneficiaryDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Beneficiary with ID ${id} not found`);
    }
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Beneficiary with ID ${id} not found`);
    }
    await this.repository.delete(id);
  }
}
