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
    batchId?: string,
    status?: ComplaintStatus,
  ): Promise<PaginatedResult<any>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const where: any = {};
    if (batchId) where.batchId = batchId;
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        skip: pagination.skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { batch: true },
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
      include: { batch: true },
    });
    if (!complaint)
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    return complaint;
  }

  async submit(reportKey: string, description: string, evidence?: string) {
    const batch = await this.prisma.batch.findUnique({
      where: { reportKey },
    });
    if (!batch) {
      throw new NotFoundException(
        `Batch with report key ${reportKey} not found`,
      );
    }

    return this.prisma.complaint.create({
      data: {
        reportKey,
        description,
        evidence,
        batchId: batch.id,
        status: "PENDING",
      },
    });
  }

  async updateStatus(id: string, newStatus: ComplaintStatus, notes?: string) {
    const complaint = await this.findOne(id);
    const allowed =
      this.VALID_TRANSITIONS[complaint.status as ComplaintStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${complaint.status} to ${newStatus}`,
      );
    }
    return this.prisma.complaint.update({
      where: { id },
      data: { status: newStatus, notes },
    });
  }
}
