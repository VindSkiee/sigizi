# exception-pattern

## Tujuan

Menangani error dengan konsisten menggunakan NestJS exception filters dan custom exceptions.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  EXCEPTION PATTERN RULES                                    │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan built-in exceptions dari NestJS                 │
│  2. Buat custom exceptions untuk business logic             │
│  3. Buat exception filter untuk global error handling       │
│  4. Return error response yang konsisten                    │
│  5. Log semua error untuk debugging                         │
│  6. Jangan expose internal error ke client                  │
│  7. Gunakan error codes untuk programmatic handling         │
│  8. Test semua error scenarios                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Built-in Exceptions

```typescript
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  GoneException,
  InternalServerErrorException,
  NotImplementedException,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

// Usage examples
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Insufficient permissions');
throw new NotFoundException('Supplier not found');
throw new ConflictException('NPWP already exists');
throw new GoneException('Resource has been deleted');
throw new InternalServerErrorException('Something went wrong');
```

---

## Custom Exceptions

### Business Exception

```typescript
// exceptions/business.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    code: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        message,
        code,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}
```

### Specific Business Exceptions

```typescript
// exceptions/supplier-not-found.exception.ts
import { NotFoundException } from '@nestjs/common';

export class SupplierNotFoundException extends NotFoundException {
  constructor(id: string) {
    super({
      message: `Supplier with ID ${id} not found`,
      error: 'SUPPLIER_NOT_FOUND',
      timestamp: new Date().toISOString(),
    });
  }
}

// exceptions/duplicate-npwp.exception.ts
import { ConflictException } from '@nestjs/common';

export class DuplicateNpwpException extends ConflictException {
  constructor(npwp: string) {
    super({
      message: `Supplier with NPWP ${npwp} already exists`,
      error: 'DUPLICATE_NPWP',
      timestamp: new Date().toISOString(),
    });
  }
}

// exceptions/insufficient-stock.exception.ts
import { BadRequestException } from '@nestjs/common';

export class InsufficientStockException extends BadRequestException {
  constructor(itemId: string, requested: number, available: number) {
    super({
      message: `Insufficient stock for item ${itemId}. Requested: ${requested}, Available: ${available}`,
      error: 'INSUFFICIENT_STOCK',
      details: { itemId, requested, available },
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## Exception Filter

### Global Exception Filter

```typescript
// filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        code = (exceptionResponse as any).error || code;
        details = (exceptionResponse as any).details || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      code,
      details,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Validation Exception Filter

```typescript
// filters/validation-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(HttpException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const exceptionResponse = exception.getResponse();
      
      if (
        typeof exceptionResponse === 'object' &&
        Array.isArray((exceptionResponse as any).message)
      ) {
        const messages = (exceptionResponse as any).message;
        
        response.status(status).json({
          statusCode: status,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: messages.map((msg: string) => ({
            message: msg,
          })),
          timestamp: new Date().toISOString(),
        });
        return;
      }
    }

    response.status(status).json(exception.getResponse());
  }
}
```

---

## Register Filters

### Global Filter

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global filters
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new ValidationExceptionFilter(),
  );

  await app.listen(3000);
}
bootstrap();
```

### Module-level Filter

```typescript
// supplier.module.ts
import { Module } from '@nestjs/common';
import { AllExceptionsFilter } from '../filters/http-exception.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class SupplierModule {}
```

---

## Usage in Service

```typescript
// application/services/supplier.service.ts
import { Injectable } from '@nestjs/common';
import { SupplierRepository } from '../../domain';
import { SupplierNotFoundException } from '../../exceptions';
import { DuplicateNpwpException } from '../../exceptions';

@Injectable()
export class SupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async findById(id: string) {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new SupplierNotFoundException(id);
    }
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    // Check for duplicate NPWP
    const existing = await this.supplierRepository.findByNpwp(dto.npwp);
    if (existing) {
      throw new DuplicateNpwpException(dto.npwp);
    }

    return this.supplierRepository.create(dto);
  }
}
```

---

## Error Response Format

```json
{
  "statusCode": 400,
  "message": "Supplier with NPWP 123456789012345 already exists",
  "code": "DUPLICATE_NPWP",
  "details": null,
  "path": "/api/suppliers",
  "method": "POST",
  "timestamp": "2026-07-09T00:00:00.000Z"
}
```

---

## Checklist

- [ ] Gunakan built-in exceptions untuk cases umum
- [ ] Buat custom exceptions untuk business logic
- [ ] Buat global exception filter
- [ ] Return error response yang konsisten
- [ ] Log semua error untuk debugging
- [ ] Jangan expose internal error ke client
- [ ] Gunakan error codes untuk programmatic handling
- [ ] Test semua error scenarios

---

## Anti-Patterns

```
❌ Throw generic error
throw new Error('Supplier not found');

✅ Throw specific exception
throw new SupplierNotFoundException(id);

❌ Return error manually
async findById(id: string) {
  const supplier = await this.supplierRepository.findById(id);
  if (!supplier) {
    return { error: 'Not found', status: 404 };
  }
  return supplier;
}

✅ Throw exception
async findById(id: string) {
  const supplier = await this.supplierRepository.findById(id);
  if (!supplier) {
    throw new SupplierNotFoundException(id);
  }
  return supplier;
}

❌ Expose internal error
catch (error) {
  throw new InternalServerErrorException(error.message);
}

✅ Hide internal error
catch (error) {
  this.logger.error(error.message, error.stack);
  throw new InternalServerErrorException('Something went wrong');
}

❌ Inconsistent error response
{ error: 'Invalid input' }
{ message: 'Validation failed', errors: [...] }

✅ Consistent error response
{
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [...],
  "timestamp": "2026-07-09T00:00:00.000Z"
}
```

---

## References

- [NestJS Exceptions](https://docs.nestjs.com/exception-filters)
- [HTTP Exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
- [Custom Exceptions](https://docs.nestjs.com/exception-filters#throwing-standard-exceptions)
- [docs/backend/PATTERNS.md](../PATTERNS.md)
