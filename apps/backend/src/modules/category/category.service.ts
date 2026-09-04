import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllCategories() {
    return this.prisma.itemCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        commodities: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            referencePrice: true,
          },
        },
      },
    });
  }

  async findCategoryById(id: string) {
    return this.prisma.itemCategory.findUnique({
      where: { id },
      include: {
        commodities: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            referencePrice: true,
          },
        },
      },
    });
  }

  async findCategoryByName(name: string) {
    return this.prisma.itemCategory.findFirst({
      where: { name, isActive: true },
      include: {
        commodities: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            referencePrice: true,
          },
        },
      },
    });
  }

  async findAllCommodities(categoryId?: string) {
    const where: any = { isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.prisma.itemCommodity.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        referencePrice: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findCommodityById(id: string) {
    return this.prisma.itemCommodity.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        referencePrice: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findCommodityByName(name: string) {
    return this.prisma.itemCommodity.findFirst({
      where: { name, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        referencePrice: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}
