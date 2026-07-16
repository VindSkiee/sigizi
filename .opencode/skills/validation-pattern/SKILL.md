# validation-pattern

## Tujuan

Validasi input menggunakan class-validator dan class-transformer dengan konsisten.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  VALIDATION PATTERN RULES                                   │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan class-validator decorators di DTO               │
│  2. Gunakan class-transformer untuk transform               │
│  3. Enable ValidationPipe di main.ts atau global            │
│  4. Gunakan custom validator untuk business rules           │
│  5. Return validation error yang jelas                      │
│  6. Jangan validate di controller atau service              │
│  7. Gunakan groups untuk conditional validation             │
│  8. Test semua validation rules                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup

### Enable Global ValidationPipe

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip non-decorated properties
      forbidNonWhitelisted: true, // Throw error for non-whitelisted
      transform: true,            // Transform to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types
      },
    }),
  );
  
  await app.listen(3000);
}
```

### Package Installation

```bash
pnpm add class-validator class-transformer
```

---

## DTO Validation Examples

### Basic Types

```typescript
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEmail, 
  IsNumber, 
  IsBoolean, 
  IsDate,
  IsEnum,
  IsArray,
  ValidateNested,
  Length,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'PT Supplier ABC' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '123456789012345' })
  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  npwp: string;

  @ApiPropertyOptional({ example: 'supplier@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(15)
  phone?: string;

  @ApiProperty({ example: 1000000 })
  @IsNumber()
  @Min(0)
  creditLimit: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  establishedDate?: Date;
}
```

### Enum Validation

```typescript
export enum BatchStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateBatchDto {
  @ApiProperty({ enum: BatchStatus })
  @IsEnum(BatchStatus)
  status: BatchStatus;
}
```

### Nested Object Validation

```typescript
export class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty()
  @IsString()
  @Length(5, 5)
  postalCode: string;
}

export class CreateSupplierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
```

### Array Validation

```typescript
export class CreateBatchItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateBatchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty({ type: [CreateBatchItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBatchItemDto)
  items: CreateBatchItemDto[];
}
```

---

## Custom Validators

### Custom Decorator

```typescript
// validators/is-valid-npwp.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsValidNpwpConstraint implements ValidatorConstraintInterface {
  validate(npwp: string) {
    // NPWP format: 15 digits
    const npwpRegex = /^\d{15}$/;
    return npwpRegex.test(npwp);
  }

  defaultMessage() {
    return 'NPWP must be 15 digits';
  }
}

export function IsValidNpwp(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidNpwpConstraint,
    });
  };
}
```

### Usage

```typescript
import { IsValidNpwp } from '../../validators';

export class CreateSupplierDto {
  @ApiProperty({ example: '123456789012345' })
  @IsString()
  @IsNotEmpty()
  @IsValidNpwp()
  npwp: string;
}
```

---

## Validation with Groups

```typescript
export class CreateSupplierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(15, 15, { groups: ['create'] })
  npwp: string;
}

export class UpdateSupplierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Length(15, 15, { groups: ['update'] })
  npwp?: string;
}

// Usage in controller
@Put(':id')
async update(
  @Param('id') id: string,
  @Body(new ValidationPipe({ groups: ['update'] }))
  body: UpdateSupplierDto,
) {
  return this.supplierService.update(id, body);
}
```

---

## Error Response Format

```typescript
// Standard validation error response
{
  "statusCode": 400,
  "message": [
    "name must be longer than or equal to 3 characters",
    "npwp must be exactly 15 characters",
    "email must be an email"
  ],
  "error": "Bad Request"
}
```

---

## Checklist

- [ ] Enable ValidationPipe di main.ts
- [ ] Gunakan class-validator decorators
- [ ] Gunakan class-transformer untuk transform
- [ ] Tambahkan @ApiProperty untuk swagger
- [ ] Buat custom validator untuk business rules
- [ ] Gunakan groups untuk conditional validation
- [ ] Test semua validation rules

---

## Anti-Patterns

```
❌ Validate di controller
async create(@Body() body: any) {
  if (!body.name) {
    throw new BadRequestException('Name is required');
  }
  if (body.npwp.length !== 15) {
    throw new BadRequestException('NPWP must be 15 digits');
  }
}

✅ Gunakan DTO dengan decorators
export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Length(15, 15)
  npwp: string;
}

❌ Tidak gunakan whitelist
app.useGlobalPipes(new ValidationPipe());

✅ Gunakan whitelist untuk strip extra fields
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

❌ Validate semua fields di setiap request
export class UpdateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Length(15, 15) // Tidak perlu validate npwp saat update
  npwp: string;
}

✅ Gunakan groups atau buat DTO terpisah
export class UpdateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @Length(15, 15)
  npwp?: string;
}
```

---

## References

- [class-validator](https://github.com/typestack/class-validator)
- [class-transformer](https://github.com/typestack/class-transformer)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [docs/backend/PATTERNS.md](../PATTERNS.md)
