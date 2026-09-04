import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { SUPPLIER_REPOSITORY } from "../../domain";
import type { SupplierRepository } from "../../domain";
import { CreateSupplierDto } from "../dto/create-supplier.dto";
import { UpdateSupplierDto } from "../dto/update-supplier.dto";
import { UpdateSupplierProfileDto } from "../dto/update-supplier-profile.dto";
import { CreateSupplierItemDto } from "../dto/create-supplier-item.dto";
import { UpdateSupplierItemDto } from "../dto/update-supplier-item.dto";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../../core/dto/pagination.dto";
import type { UpdateSupplierItemData } from "../../domain";
import { CategoryService } from "../../../category/category.service";

@Injectable()
export class SupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY)
    private readonly repository: SupplierRepository,
    private readonly categoryService: CategoryService,
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
      throw new NotFoundException(`Supplier with ID ${id} not found`);
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
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return this.repository.update(id, dto);
  }

  async updateProfile(supplierId: string, dto: UpdateSupplierProfileDto) {
    const existing = await this.repository.findById(supplierId);
    if (!existing) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }
    return this.repository.update(supplierId, dto);
  }

  async remove(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    await this.repository.delete(id);
  }

  async findItems(supplierId: string) {
    await this.findOne(supplierId);
    return this.repository.findItems(supplierId);
  }

  async addItem(supplierId: string, dto: CreateSupplierItemDto) {
    await this.findOne(supplierId);
    const now = new Date();
    return this.repository.addItem(supplierId, {
      ...dto,
      priceUpdatedAt: now,
      stockUpdatedAt: now,
      updatedAt: now,
    });
  }

  async updateItem(itemId: string, dto: UpdateSupplierItemDto) {
    const existing = await this.repository.findItemById(itemId);
    if (!existing) {
      throw new NotFoundException(`Supplier item with ID ${itemId} not found`);
    }

    const now = new Date();
    const patch: UpdateSupplierItemData = { ...dto, updatedAt: now };

    if ("basePrice" in dto) {
      patch.priceUpdatedAt = now;
    }
    if ("stock" in dto) {
      patch.stockUpdatedAt = now;
    }

    return this.repository.updateItem(itemId, patch);
  }

  async removeItem(itemId: string) {
    const refCheck = await this.repository.hasItemReferences(itemId);
    if (refCheck.hasReferences) {
      return this.repository.updateItem(itemId, {
        isAvailable: false,
        deletedAt: new Date(),
      });
    }
    await this.repository.removeItem(itemId);
  }

  async findTaxonomy() {
    return this.categoryService.findAllCategories();
  }
}
