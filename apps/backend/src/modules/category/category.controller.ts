import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { CategoryService } from "./category.service";

@ApiTags("Item Taxonomy")
@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: "List all active item categories with commodities" })
  findAll() {
    return this.categoryService.findAllCategories();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get category by ID with its commodities" })
  findOne(@Param("id") id: string) {
    return this.categoryService.findCategoryById(id);
  }

  @Get("by-name/:name")
  @ApiOperation({ summary: "Get category by name (case-insensitive)" })
  findByName(@Param("name") name: string) {
    return this.categoryService.findCategoryByName(name);
  }
}

@ApiTags("Item Taxonomy")
@Controller("commodities")
export class CommodityController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: "List all active commodities" })
  @ApiQuery({ name: "categoryId", required: false })
  findAll(@Query("categoryId") categoryId?: string) {
    return this.categoryService.findAllCommodities(categoryId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get commodity by ID" })
  findOne(@Param("id") id: string) {
    return this.categoryService.findCommodityById(id);
  }

  @Get("by-name/:name")
  @ApiOperation({ summary: "Get commodity by name (case-insensitive)" })
  findByName(@Param("name") name: string) {
    return this.categoryService.findCommodityByName(name);
  }
}
