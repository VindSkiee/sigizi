# controller-pattern

## Tujuan

Membuat controller yang konsisten, terstruktur, dan mengikuti best practices REST API.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  CONTROLLER PATTERN RULES                                   │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan @Controller decorator dengan prefix route        │
│  2. Delegate business logic ke service                      │
│  3. Gunakan DTO untuk request/response                      │
│  4. Gunakan @ApiTags untuk swagger grouping                 │
│  5. Gunakan @ApiOperation untuk endpoint docs               │
│  6. Handle error dengan proper HTTP status                   │
│  7. Gunakan @HttpCode untuk custom status code              │
│  8. Jangan contain business logic di controller             │
└─────────────────────────────────────────────────────────────┘
```

---

## Template

### Basic Controller

```typescript
// presentation/http/supplier.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupplierService } from '../../application';
import { 
  CreateSupplierRequestDto,
  UpdateSupplierRequestDto,
  SupplierResponseDto,
  FindAllSuppliersRequestDto,
} from './dto';

@Controller('suppliers')
@ApiTags('Suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'List all suppliers' })
  @ApiResponse({ status: 200, description: 'Success', type: [SupplierResponseDto] })
  async findAll(@Query() query: FindAllSuppliersRequestDto) {
    return this.supplierService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Success', type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findById(@Param('id') id: string) {
    return this.supplierService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create supplier' })
  @ApiResponse({ status: 201, description: 'Created', type: SupplierResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() body: CreateSupplierRequestDto) {
    return this.supplierService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Success', type: SupplierResponseDto })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSupplierRequestDto,
  ) {
    return this.supplierService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async delete(@Param('id') id: string) {
    await this.supplierService.delete(id);
  }
}
```

### CRUD Template

```typescript
// Complete CRUD controller template
@Controller('batches')
@ApiTags('Batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get()
  async findAll(@Query() query: FindAllBatchesRequestDto) {
    return this.batchService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.batchService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateBatchRequestDto) {
    return this.batchService.create(body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateBatchRequestDto,
  ) {
    return this.batchService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.batchService.delete(id);
  }
}
```

### Controller with Relations

```typescript
// presentation/http/batch.controller.ts
@Controller('batches')
@ApiTags('Batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get(':id/items')
  @ApiOperation({ summary: 'Get batch items' })
  async findItems(@Param('id') id: string) {
    return this.batchService.findItems(id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Add item to batch' })
  async addItem(
    @Param('id') id: string,
    @Body() body: AddItemToBatchRequestDto,
  ) {
    return this.batchService.addItem(id, body);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    await this.batchService.removeItem(id, itemId);
  }
}
```

---

## Request/Response DTO

### Request DTO

```typescript
// presentation/http/dto/request/create-supplier.request.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateSupplierRequestDto {
  @ApiProperty({ example: 'PT Supplier ABC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123456789012345' })
  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  npwp: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Jl. Supplier No. 1' })
  @IsString()
  @IsOptional()
  address?: string;
}
```

### Response DTO

```typescript
// presentation/http/dto/response/supplier.response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SupplierResponseDto {
  @ApiProperty({ example: 'clx1234567890' })
  id: string;

  @ApiProperty({ example: 'PT Supplier ABC' })
  name: string;

  @ApiProperty({ example: '123456789012345' })
  npwp: string;

  @ApiPropertyOptional({ example: '08123456789' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Jl. Supplier No. 1' })
  address?: string;

  @ApiProperty({ example: '2026-07-09T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-09T00:00:00.000Z' })
  updatedAt: Date;
}
```

### Query DTO

```typescript
// presentation/http/dto/request/find-all-suppliers.request.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllSuppliersRequestDto {
  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take?: number;

  @ApiPropertyOptional({ example: 'ABC' })
  @IsOptional()
  @IsString()
  search?: string;
}
```

---

## Checklist

- [ ] Gunakan @Controller dengan prefix route
- [ ] Delegate logic ke service
- [ ] Gunakan DTO untuk request/response
- [ ] Tambahkan @ApiTags untuk swagger
- [ ] Tambahkan @ApiOperation untuk docs
- [ ] Tambahkan @ApiResponse untuk status codes
- [ ] Gunakan @HttpCode untuk custom status
- [ ] Jangan contain business logic di controller

---

## Anti-Patterns

```
❌ Business logic di controller
async create(@Body() body: CreateSupplierDto) {
  // Validation logic
  if (body.npwp.length !== 15) {
    throw new BadRequestException('NPWP must be 15');
  }
  
  // Business logic
  const supplier = new Supplier(...);
  supplier.validate();
  
  // Data access
  await this.prisma.supplier.create({ data: body });
}

✅ Controller hanya delegate ke service
async create(@Body() body: CreateSupplierRequestDto) {
  return this.supplierService.create(body);
}

❌ Return Prisma model
async findAll() {
  return this.prisma.supplier.findMany();
}

✅ Return response DTO
async findAll() {
  const suppliers = await this.supplierService.findAll();
  return suppliers.map((s) => SupplierResponseDto.from(s));
}

❌ Tidak handle error
async findById(id: string) {
  return this.supplierService.findById(id);
}

✅ Handle error dengan proper status
@ApiResponse({ status: 404, description: 'Supplier not found' })
async findById(id: string) {
  return this.supplierService.findById(id);
}
```

---

## References

- [NestJS Controllers](https://docs.nestjs.com/controllers)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [NestJS Pipes](https://docs.nestjs.com/pipes)
- [docs/backend/PATTERNS.md](../PATTERNS.md)
