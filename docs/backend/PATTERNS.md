# Backend Patterns & Conventions

## Code Style

### 1. Module Structure

```
modules/
└── feature/
    ├── feature.module.ts
    ├── feature.controller.ts
    ├── feature.service.ts
    └── dto/
        ├── create-feature.dto.ts
        └── update-feature.dto.ts
```

### 2. Naming Convention

| Item | Convention | Example |
|------|------------|---------|
| Module | PascalCase + Module | `SupplierModule` |
| Service | PascalCase + Service | `SupplierService` |
| Controller | PascalCase + Controller | `SupplierController` |
| DTO | PascalCase +Dto | `CreateSupplierDto` |
| File | kebab-case | `supplier.service.ts` |

### 3. Controller Pattern

```typescript
@Controller('suppliers')
@ApiTags('Suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'List suppliers' })
  async findAll(@Query() query: ListSupplierDto) {
    return this.supplierService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier' })
  async findById(@Param('id') id: string) {
    return this.supplierService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create supplier' })
  async create(@Body() body: CreateSupplierDto) {
    return this.supplierService.create(body);
  }
}
```

### 4. Service Pattern

```typescript
@Injectable()
export class SupplierService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ListSupplierDto) {
    const { search, page = 1, limit = 20 } = query;
    
    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }
}
```

### 5. DTO Pattern

```typescript
// create-supplier.dto.ts
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsString()
  npwp: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}
```

---

## Error Handling

```typescript
// 1. Use built-in exceptions
import { NotFoundException, BadRequestException, ForbiddenException };

throw new NotFoundException('Resource not found');
throw new BadRequestException('Invalid input');
throw new ForbiddenException('Insufficient permissions');

// 2. Custom error response
throw new HttpException(
  {
    statusCode: 400,
    message: 'Custom error',
    error: 'CUSTOM_ERROR',
  },
  HttpStatus.BAD_REQUEST,
);
```

---

## Auth Patterns

### Protected Route

```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async protectedRoute(@Request() req) {
  // req.user = { sub, email, role }
  return this.service.findByUser(req.user.sub);
}
```

### Role-Based Access

```typescript
@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SPPG_ADMIN)
@ApiBearerAuth()
async create(@Body() body: CreateBatchDto) {
  // Only SPPG_ADMIN can create
}
```

### Get Current User

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async getMe(@Request() req) {
  return this.authService.validateUser(req.user.sub);
}
```

---

## Database Patterns

### Transaction

```typescript
async transferStock(fromId: string, toId: string, amount: number) {
  return this.prisma.$transaction(async (tx) => {
    const from = await tx.stock.update({
      where: { id: fromId },
      data: { quantity: { decrement: amount } },
    });
    
    const to = await tx.stock.update({
      where: { id: toId },
      data: { quantity: { increment: amount } },
    });
    
    return { from, to };
  });
}
```

### Include Relations

```typescript
const batch = await this.prisma.batch.findUnique({
  where: { id },
  include: {
    sppg: true,
    complaints: true,
  },
});
```

### Pagination

```typescript
const page = 1;
const limit = 20;

const items = await this.prisma.supplier.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' },
});
```

---

## Shared Types Usage

```typescript
// Import from shared package
import { Role, BatchStatus, Supplier } from '@sigizi/shared';

// Use in code
const user: User = {
  role: Role.SPPG_ADMIN,
  // ...
};
```

---

## Git Commit Convention

```bash
[backend] add supplier CRUD endpoint
[backend] implement dynamic median algorithm
[backend] fix batch number generation
```

---

## See Also

- [GUIDE.md](./GUIDE.md) - Main development guide
- [CONTEXT_RECOVERY.md](./CONTEXT_RECOVERY.md) - Context recovery protocol
