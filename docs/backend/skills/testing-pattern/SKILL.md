# testing-pattern

## Tujuan

Menulis unit tests dan E2E tests yang terstruktur menggunakan Jest.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  TESTING PATTERN RULES                                      │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan Jest sebagai test runner                        │
│  2. Test file harus dekat dengan source file                │
│  3. Gunakan AAA pattern (Arrange, Act, Assert)              │
│  4. Mock dependencies untuk unit tests                      │
│  5. Gunakan real database untuk E2E tests                   │
│  6. Test semua edge cases dan error scenarios               │
│  7. Test coverage minimal 80%                               │
│  8. Jalankan tests sebelum commit                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup

### Package Installation

```bash
pnpm add -D jest @types/jest ts-jest
```

### Jest Configuration

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.module.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/index.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default config;
```

---

## Unit Tests

### Service Test

```typescript
// application/services/supplier.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SupplierService } from './supplier.service';
import { SUPPLIER_REPOSITORY } from '../../domain';
import { SupplierNotFoundException, DuplicateNpwpException } from '../../exceptions';
import { Supplier } from '../../domain/entities';

describe('SupplierService', () => {
  let service: SupplierService;
  let repository: jest.Mocked<any>;

  const mockSupplier = new Supplier({
    id: '1',
    name: 'PT Supplier ABC',
    npwp: '123456789012345',
    phone: '08123456789',
    address: 'Jl. Supplier No. 1',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByNpwp: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierService,
        {
          provide: SUPPLIER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SupplierService>(SupplierService);
    repository = module.get(SUPPLIER_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of suppliers', async () => {
      repository.findAll.mockResolvedValue([mockSupplier]);

      const result = await service.findAll({});

      expect(result).toEqual([mockSupplier]);
      expect(repository.findAll).toHaveBeenCalledWith({});
    });

    it('should return empty array when no suppliers', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll({});

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return supplier by id', async () => {
      repository.findById.mockResolvedValue(mockSupplier);

      const result = await service.findById('1');

      expect(result).toEqual(mockSupplier);
      expect(repository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw SupplierNotFoundException when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(
        SupplierNotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create new supplier', async () => {
      const createDto = {
        name: 'PT Supplier ABC',
        npwp: '123456789012345',
        phone: '08123456789',
      };

      repository.findByNpwp.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockSupplier);

      const result = await service.create(createDto);

      expect(result).toEqual(mockSupplier);
      expect(repository.findByNpwp).toHaveBeenCalledWith(createDto.npwp);
      expect(repository.create).toHaveBeenCalled();
    });

    it('should throw DuplicateNpwpException when NPWP exists', async () => {
      const createDto = {
        name: 'PT Supplier ABC',
        npwp: '123456789012345',
      };

      repository.findByNpwp.mockResolvedValue(mockSupplier);

      await expect(service.create(createDto)).rejects.toThrow(
        DuplicateNpwpException,
      );
    });
  });

  describe('update', () => {
    it('should update supplier', async () => {
      const updateDto = { name: 'PT Updated Supplier' };
      const updatedSupplier = { ...mockSupplier, name: 'PT Updated Supplier' };

      repository.findById.mockResolvedValue(mockSupplier);
      repository.update.mockResolvedValue(updatedSupplier);

      const result = await service.update('1', updateDto);

      expect(result).toEqual(updatedSupplier);
      expect(repository.update).toHaveBeenCalledWith('1', updateDto);
    });

    it('should throw SupplierNotFoundException when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('999', {})).rejects.toThrow(
        SupplierNotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete supplier', async () => {
      repository.findById.mockResolvedValue(mockSupplier);
      repository.delete.mockResolvedValue(undefined);

      await service.delete('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw SupplierNotFoundException when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(
        SupplierNotFoundException,
      );
    });
  });
});
```

### Repository Test

```typescript
// infrastructure/prisma/supplier.repository.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaSupplierRepository } from './supplier.repository';
import { PrismaService } from '../../database';
import { SupplierMapper } from './prisma-supplier.mapper';

describe('PrismaSupplierRepository', () => {
  let repository: PrismaSupplierRepository;
  let prisma: jest.Mocked<any>;
  let mapper: jest.Mocked<any>;

  const mockPrismaSupplier = {
    id: '1',
    name: 'PT Supplier ABC',
    npwp: '123456789012345',
    phone: '08123456789',
    address: 'Jl. Supplier No. 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockDomainSupplier = {
    id: '1',
    name: 'PT Supplier ABC',
    npwp: '123456789012345',
    phone: '08123456789',
    address: 'Jl. Supplier No. 1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrisma = {
      supplier: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const mockMapper = {
      toDomain: jest.fn(),
      toPrismaCreate: jest.fn(),
      toPrismaUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaSupplierRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SupplierMapper, useValue: mockMapper },
      ],
    }).compile();

    repository = module.get<PrismaSupplierRepository>(PrismaSupplierRepository);
    prisma = module.get(PrismaService);
    mapper = module.get(SupplierMapper);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of suppliers', async () => {
      prisma.supplier.findMany.mockResolvedValue([mockPrismaSupplier]);
      mapper.toDomain.mockReturnValue(mockDomainSupplier);

      const result = await repository.findAll();

      expect(result).toEqual([mockDomainSupplier]);
      expect(prisma.supplier.findMany).toHaveBeenCalled();
      expect(mapper.toDomain).toHaveBeenCalledWith(mockPrismaSupplier);
    });

    it('should apply pagination', async () => {
      prisma.supplier.findMany.mockResolvedValue([]);
      mapper.toDomain.mockReturnValue(null);

      await repository.findAll({ skip: 10, take: 5 });

      expect(prisma.supplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  describe('findById', () => {
    it('should return supplier by id', async () => {
      prisma.supplier.findUnique.mockResolvedValue(mockPrismaSupplier);
      mapper.toDomain.mockReturnValue(mockDomainSupplier);

      const result = await repository.findById('1');

      expect(result).toEqual(mockDomainSupplier);
      expect(prisma.supplier.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when not found', async () => {
      prisma.supplier.findUnique.mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new supplier', async () => {
      const createData = {
        name: 'PT Supplier ABC',
        npwp: '123456789012345',
        phone: '08123456789',
      };

      mapper.toPrismaCreate.mockReturnValue(createData);
      prisma.supplier.create.mockResolvedValue(mockPrismaSupplier);
      mapper.toDomain.mockReturnValue(mockDomainSupplier);

      const result = await repository.create(createData);

      expect(result).toEqual(mockDomainSupplier);
      expect(prisma.supplier.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });
});
```

---

## E2E Tests

### Setup

```typescript
// test/supplier.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Supplier (e2e)', () => {
  let app: INestApplication;
  let createdSupplierId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/suppliers (POST)', () => {
    it('should create a new supplier', () => {
      return request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: 'PT Test Supplier',
          npwp: '123456789012345',
          phone: '08123456789',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('PT Test Supplier');
          expect(res.body.npwp).toBe('123456789012345');
          createdSupplierId = res.body.id;
        });
    });

    it('should return 400 for invalid input', () => {
      return request(app.getHttpServer())
        .post('/suppliers')
        .send({
          name: '',
          npwp: '123',
        })
        .expect(400);
    });
  });

  describe('/suppliers (GET)', () => {
    it('should return array of suppliers', () => {
      return request(app.getHttpServer())
        .get('/suppliers')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/suppliers/:id (GET)', () => {
    it('should return supplier by id', () => {
      return request(app.getHttpServer())
        .get(`/suppliers/${createdSupplierId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdSupplierId);
        });
    });

    it('should return 404 for non-existent supplier', () => {
      return request(app.getHttpServer())
        .get('/suppliers/non-existent-id')
        .expect(404);
    });
  });

  describe('/suppliers/:id (PUT)', () => {
    it('should update supplier', () => {
      return request(app.getHttpServer())
        .put(`/suppliers/${createdSupplierId}`)
        .send({
          name: 'PT Updated Supplier',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('PT Updated Supplier');
        });
    });
  });

  describe('/suppliers/:id (DELETE)', () => {
    it('should delete supplier', () => {
      return request(app.getHttpServer())
        .delete(`/suppliers/${createdSupplierId}`)
        .expect(204);
    });
  });
});
```

---

## Test Coverage

### Run with Coverage

```bash
# Run tests with coverage
pnpm test:cov

# View coverage report
open coverage/lcov-report/index.html
```

### Coverage Configuration

```typescript
// jest.config.ts
const config: Config = {
  // ... other config
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/index.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## Checklist

- [ ] Setup Jest configuration
- [ ] Write unit tests untuk services
- [ ] Write unit tests untuk repositories
- [ ] Write E2E tests untuk API endpoints
- [ ] Mock dependencies untuk unit tests
- [ ] Test semua edge cases dan error scenarios
- [ ] Maintain test coverage minimal 80%
- [ ] Jalankan tests sebelum commit

---

## Anti-Patterns

```
❌ Test implementation details
it('should call repository.findById', () => {
  service.findById('1');
  expect(repository.findById).toHaveBeenCalledWith('1');
});

✅ Test behavior
it('should return supplier by id', async () => {
  repository.findById.mockResolvedValue(mockSupplier);
  const result = await service.findById('1');
  expect(result).toEqual(mockSupplier);
});

❌ Hardcoded test data
it('should create supplier', async () => {
  const result = await service.create({
    name: 'Test',
    npwp: '123456789012345',
  });
  expect(result).toBeDefined();
});

✅ Use factory functions
const createSupplierDto = (overrides?: Partial<CreateSupplierDto>) => ({
  name: 'PT Test Supplier',
  npwp: '123456789012345',
  ...overrides,
});

it('should create supplier', async () => {
  const dto = createSupplierDto();
  const result = await service.create(dto);
  expect(result).toBeDefined();
});

❌ No cleanup after tests
afterAll(async () => {
  // Database still has test data
});

✅ Clean up after tests
afterAll(async () => {
  await prisma.supplier.deleteMany();
  await app.close();
});
```

---

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/ladakh/supertest)
- [docs/backend/PATTERNS.md](../PATTERNS.md)
