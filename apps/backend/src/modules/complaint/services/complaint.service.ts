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
import { ComplaintStatus } from "@sigizi/shared";

const CS = ComplaintStatus;

interface FindAllComplaintFilter {
  batchId?: string;
  status?: ComplaintStatus;
  sppgId?: string;
}

@Injectable()
export class ComplaintService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly VALID_TRANSITIONS: Record<
    ComplaintStatus,
    ComplaintStatus[]
  > = {
    [CS.PENDING]: [CS.REVIEWED],
    [CS.REVIEWED]: [CS.RESOLVED],
    [CS.RESOLVED]: [],
  };

  async findAll(
    pagination: PaginationDto,
    filter: FindAllComplaintFilter = {},
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const where: any = {};

    if (filter.batchId) {
      where.batchId = filter.batchId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.sppgId) {
      where.batch = { sppgId: filter.sppgId };
    }

    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip: pagination.skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          batch: {
            include: { sppg: true },
          },
        },
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        batch: {
          include: { sppg: true },
        },
      },
    });
    if (!complaint)
      throw new NotFoundException(`Komplain dengan ID ${id} tidak ditemukan`);
    return complaint;
  }

  async findOneAndMarkReviewed(id: string) {
    const complaint = await this.findOne(id);

    if (complaint.status === CS.PENDING) {
      await this.prisma.complaint.update({
        where: { id },
        data: { status: CS.REVIEWED },
      });
      complaint.status = CS.REVIEWED;
    }

    return complaint;
  }

  async submit(reportKey: string, description: string, evidence?: string) {
    if (!reportKey || reportKey.trim().length === 0) {
      throw new BadRequestException("reportKey wajib diisi");
    }

    if (!description || description.trim().length === 0) {
      throw new BadRequestException("description wajib diisi");
    }

    const batch = await this.prisma.batch.findUnique({
      where: { reportKey },
      include: { sppg: true },
    });
    if (!batch) {
      throw new NotFoundException(
        `Batch dengan report key ${reportKey} tidak ditemukan`,
      );
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        reportKey,
        description: description.trim(),
        evidence,
        batchId: batch.id,
        status: "PENDING",
      },
      include: {
        batch: {
          include: { sppg: true },
        },
      },
    });

    return complaint;
  }

  async updateStatus(id: string, newStatus: ComplaintStatus, notes?: string) {
    const complaint = await this.findOne(id);

    const allowed =
      this.VALID_TRANSITIONS[complaint.status as ComplaintStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Tidak dapat transisi dari ${complaint.status} ke ${newStatus}`,
      );
    }

    if (newStatus === CS.RESOLVED && (!notes || notes.trim().length === 0)) {
      throw new BadRequestException(
        "notes wajib diisi ketika menandai komplain sebagai RESOLVED",
      );
    }

    return this.prisma.complaint.update({
      where: { id },
      data: {
        status: newStatus,
        notes: notes?.trim() ?? null,
      },
      include: {
        batch: {
          include: { sppg: true },
        },
      },
    });
  }
}
