import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController, CommodityController } from "./category.controller";

@Module({
  controllers: [CategoryController, CommodityController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
