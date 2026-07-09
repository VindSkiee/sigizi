import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateComplaintRequest, UpdateComplaintRequest, ComplaintStatus } from '@sigizi/shared';

@Injectable()
export class ComplaintService {
  constructor(private prisma: PrismaService) {}

  async findAll(sppgId?: string, status?: string, batchId?: string) {
    const where: any = {};

    if (status) where.status = status;
    if (batchId) where.batchId = batchId;

    // If SPPG admin, only show complaints for their batches
    if (sppgId) {
      where.batch = { sppgId };
    }

    return this.prisma.complaint.findMany({
      where,
      include: {
        batch: {
          include: { sppg: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateComplaintRequest) {
    // Find batch by reportKey
    const batch = await this.prisma.batch.findFirst({
      where: { reportKey: data.reportKey },
    });

    if (!batch) {
      throw new BadRequestException('Report Key tidak valid');
    }

    return this.prisma.complaint.create({
      data: {
        reportKey: data.reportKey,
        description: data.description,
        evidence: data.evidence,
        batchId: batch.id,
      },
      include: {
        batch: true,
      },
    });
  }

  async update(id: string, data: UpdateComplaintRequest) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException('Komplain tidak ditemukan');
    }

    return this.prisma.complaint.update({
      where: { id },
      data: { status: data.status as ComplaintStatus },
      include: {
        batch: true,
      },
    });
  }
}
