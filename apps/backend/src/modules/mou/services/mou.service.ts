import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import {
  PaginationDto,
  PaginatedResult,
} from "../../../core/dto/pagination.dto";
import { CreateMouDto } from "../dto/create-mou.dto";
import { UpdateMouDto } from "../dto/update-mou.dto";
import { MouStatus } from "@sigizi/shared";

const MS = MouStatus;

@Injectable()
export class MouService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly VALID_TRANSITIONS: Record<MouStatus, MouStatus[]> = {
    [MS.DRAFT]: [MS.ACTIVE],
    [MS.ACTIVE]: [MS.EXPIRED, MS.TERMINATED],
    [MS.EXPIRED]: [],
    [MS.TERMINATED]: [],
  };

  async findAll(
    pagination: PaginationDto,
    sppgId?: string,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const where = sppgId ? { sppgId } : {};
    const [items, total] = await Promise.all([
      this.prisma.mou.findMany({
        where,
        skip: pagination.skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { items: true, sppg: true, supplier: true },
      }),
      this.prisma.mou.count({ where }),
    ]);
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const mou = await this.prisma.mou.findUnique({
      where: { id },
      include: { items: true, sppg: true, supplier: true },
    });
    if (!mou)
      throw new NotFoundException(`MoU dengan ID ${id} tidak ditemukan`);
    return mou;
  }

  async create(dto: CreateMouDto, createdById: string) {
    const mouNumber = `MOU-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    return this.prisma.mou.create({
      data: {
        mouNumber,
        sppgId: dto.sppgId,
        supplierId: dto.supplierId,
        title: dto.title,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        terms: dto.terms as any,
        documentUrl: dto.documentUrl,
        notes: dto.notes,
        createdById,
        status: "DRAFT",
        items: dto.items
          ? {
              create: dto.items.map((item) => ({
                itemId: item.itemId,
                agreedPrice: item.agreedPrice,
                minOrderQty: item.minOrderQty,
                maxOrderQty: item.maxOrderQty,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, newStatus: MouStatus) {
    const mou = await this.findOne(id);
    const allowed = this.VALID_TRANSITIONS[mou.status as MouStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Tidak dapat transisi dari ${mou.status} ke ${newStatus}`,
      );
    }
    return this.prisma.mou.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async remove(id: string) {
    const mou = await this.findOne(id);
    if (mou.status !== "DRAFT") {
      throw new BadRequestException(
        "Hanya MoU berstatus DRAFT yang dapat dihapus",
      );
    }
    await this.prisma.mouItem.deleteMany({ where: { mouId: id } });
    await this.prisma.mou.delete({ where: { id } });
  }
}
