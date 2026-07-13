import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { SUPPLIER_REPOSITORY } from "../../domain";
import type { SupplierRepository } from "../../domain";
import { CreateSupplierDto } from "../dto/create-supplier.dto";
import { UpdateSupplierDto } from "../dto/update-supplier.dto";
import { UpdateSupplierProfileDto } from "../dto/update-supplier-profile.dto";
import { CreateSupplierItemDto } from "../dto/create-supplier-item.dto";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../../core/dto/pagination.dto";

@Injectable()
export class SupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly repository: SupplierRepository,
  ) {}

  async findAll(
    pagination: PaginationDto,
    search?: string,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const [items, total] = await Promise.all([
      this.repository.findAll({
        skip: pagination.skip,
        take: limit,
        search,
      }),
      this.repository.count({ search }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const supplier = await this.repository.findById(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier dengan ID ${id} tidak ditemukan`);
    }
    return supplier;
  }

  async findByNib(nib: string) {
    return this.repository.findByNib(nib);
  }

  async create(dto: CreateSupplierDto) {
    const existing = await this.repository.findByNib(dto.nib);
    if (existing) {
      throw new ConflictException("NIB sudah terdaftar");
    }
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateSupplierDto) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Supplier dengan ID ${id} tidak ditemukan`);
    }
    return this.repository.update(id, dto);
  }

  async updateProfile(supplierId: string, dto: UpdateSupplierProfileDto) {
    const existing = await this.repository.findById(supplierId);
    if (!existing) {
      throw new NotFoundException(
        `Supplier dengan ID ${supplierId} tidak ditemukan`,
      );
    }
    return this.repository.update(supplierId, dto);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Supplier dengan ID ${id} tidak ditemukan`);
    }
    await this.repository.delete(id);
  }

  async findItems(supplierId: string) {
    await this.findOne(supplierId);
    return this.repository.findItems(supplierId);
  }

  async addItem(supplierId: string, dto: CreateSupplierItemDto) {
    await this.findOne(supplierId);
    return this.repository.addItem(supplierId, dto);
  }

  async removeItem(itemId: string) {
    await this.repository.removeItem(itemId);
  }
}
