import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { randomBytes } from "crypto";
import { JwtAuthGuard } from "../../../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../../../../common";
import { Role } from "@sigizi/shared";
import { SupplierService } from "../../application/services/supplier.service";
import { CreateSupplierDto } from "../../application/dto/create-supplier.dto";
import { UpdateSupplierDto } from "../../application/dto/update-supplier.dto";
import { UpdateSupplierProfileDto } from "../../application/dto/update-supplier-profile.dto";
import { CreateSupplierItemDto } from "../../application/dto/create-supplier-item.dto";
import { UpdateSupplierItemDto } from "../../application/dto/update-supplier-item.dto";
import { PaginationDto } from "../../../../core/dto/pagination.dto";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

function imageFileFilter(
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, accept: boolean) => void,
) {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return callback(
      new BadRequestException("Only JPEG, PNG, and WebP images are allowed"),
      false,
    );
  }
  callback(null, true);
}

function storageFor(subdir: string) {
  return diskStorage({
    destination: join(process.cwd(), "uploads", subdir),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${randomBytes(8).toString("hex")}`;
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
}

@ApiTags("Suppliers")
@Controller("suppliers")
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all suppliers" })
  @ApiQuery({ name: "search", required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query("search") search?: string,
  ) {
    return this.supplierService.findAll(pagination, search);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current supplier profile" })
  getProfile(@Request() req: any) {
    return this.supplierService.findOne(req.user.supplierId);
  }

  @Get("taxonomy")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Get item taxonomy (categories + commodities + reference prices) for SupplierItem form",
  })
  getTaxonomy() {
    return this.supplierService.findTaxonomy();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get supplier by ID" })
  findOne(@Param("id") id: string) {
    return this.supplierService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Register supplier" })
  create(@Body() dto: CreateSupplierDto) {
    return this.supplierService.create(dto);
  }

  @Put("me/profile")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: storageFor("profiles"),
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_SIZE },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Update own profile" })
  updateProfile(
    @Request() req: any,
    @Body() dto: UpdateSupplierProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      (dto as any).profileImage = `/uploads/profiles/${file.filename}`;
    }
    return this.supplierService.updateProfile(req.user.supplierId, dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update supplier" })
  update(@Param("id") id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SPPG_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete supplier" })
  remove(@Param("id") id: string) {
    return this.supplierService.remove(id);
  }

  @Get(":id/items")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List supplier items" })
  findItems(@Param("id") id: string) {
    return this.supplierService.findItems(id);
  }

  @Post(":id/items")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: storageFor("items"),
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_SIZE },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Add supplier item" })
  addItem(
    @Param("id") id: string,
    @Body() dto: CreateSupplierItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      (dto as any).image = `/uploads/items/${file.filename}`;
    }
    return this.supplierService.addItem(id, dto);
  }

  @Patch(":id/items/:itemId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: storageFor("items"),
      fileFilter: imageFileFilter,
      limits: { fileSize: MAX_SIZE },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Update supplier item (name, price, availability, image, etc.)",
  })
  updateItem(
    @Param("id") id: string,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateSupplierItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      (dto as any).image = `/uploads/items/${file.filename}`;
    }
    return this.supplierService.updateItem(itemId, dto);
  }

  @Delete("items/:itemId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPPLIER)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove supplier item" })
  removeItem(@Param("itemId") itemId: string) {
    return this.supplierService.removeItem(itemId);
  }
}
