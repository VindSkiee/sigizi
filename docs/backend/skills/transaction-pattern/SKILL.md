# transaction-pattern

## Tujuan

Mengelola database transactions dengan Prisma $transaction untuk operasi yang memerlukan atomicity.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  TRANSACTION PATTERN RULES                                  │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan $transaction untuk operasi atomic               │
│  2. Gunakan interactive transactions untuk operasi kompleks │
│  3. Handle rollback dengan proper error                     │
│  4. Jangan gunakan transaction untuk operasi read-only      │
│  5. Batasi waktu transaction (timeout)                      │
│  6. Jangan hold transaction terlalu lama                    │
│  7. Test transaction dengan error scenarios                 │
│  8. Document semua operasi yang butuh transaction            │
└─────────────────────────────────────────────────────────────┘
```

---

## Template

### Basic Transaction

```typescript
// infrastructure/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService 
  extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy 
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### Interactive Transaction

```typescript
// infrastructure/prisma/batch.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import { Batch } from '../../domain/entities';

@Injectable()
export class PrismaBatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create batch with items in transaction
   */
  async createWithItems(
    batchData: CreateBatchData,
    itemsData: CreateBatchItemData[],
  ): Promise<Batch> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create batch
      const batch = await tx.batch.create({
        data: {
          batchNumber: batchData.batchNumber,
          date: batchData.date,
          sppgId: batchData.sppgId,
          status: 'ACTIVE',
        },
      });

      // 2. Create batch items
      const items = await Promise.all(
        itemsData.map((item) =>
          tx.batchItem.create({
            data: {
              batchId: batch.id,
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            },
          }),
        ),
      );

      // 3. Return batch with items
      return new Batch({
        id: batch.id,
        batchNumber: batch.batchNumber,
        date: batch.date,
        status: batch.status as BatchStatus,
        items: items.map((item) => new BatchItem(item)),
        createdAt: batch.createdAt,
        updatedAt: batch.updatedAt,
      });
    });
  }

  /**
   * Transfer batch between SPPGs
   */
  async transferBatch(
    batchId: string,
    fromSppgId: string,
    toSppgId: string,
  ): Promise<Batch> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify batch exists and belongs to source SPPG
      const batch = await tx.batch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        throw new NotFoundException('Batch not found');
      }

      if (batch.sppgId !== fromSppgId) {
        throw new BadRequestException('Batch does not belong to source SPPG');
      }

      // 2. Update batch ownership
      const updatedBatch = await tx.batch.update({
        where: { id: batchId },
        data: { sppgId: toSppgId },
      });

      // 3. Create transfer log
      await tx.transferLog.create({
        data: {
          batchId,
          fromSppgId,
          toSppgId,
          transferredAt: new Date(),
        },
      });

      return updatedBatch;
    });
  }
}
```

### Transaction with Timeout

```typescript
async createBatchWithTimeout(
  batchData: CreateBatchData,
  itemsData: CreateBatchItemData[],
): Promise<Batch> {
  // Set timeout to 5 seconds
  return this.prisma.$transaction(
    async (tx) => {
      const batch = await tx.batch.create({
        data: batchData,
      });

      await tx.batchItem.createMany({
        data: itemsData.map((item) => ({
          batchId: batch.id,
          ...item,
        })),
      });

      return batch;
    },
    {
      maxWait: 5000,  // Maximum time to wait for transaction slot
      timeout: 10000, // Maximum time transaction can run
    },
  );
}
```

### Nested Transactions (Savepoints)

```typescript
async complexOperation(): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    // Outer transaction
    await tx.batch.create({ data: { batchNumber: 'BATCH-001' } });

    // Nested transaction (savepoint)
    try {
      await tx.$transaction(async (tx2) => {
        // This will create a savepoint
        await tx2.batchItem.create({ data: { batchId: '1', itemId: '1' } });
      });
    } catch (error) {
      // Nested transaction failed, but outer continues
      console.log('Nested transaction failed, continuing...');
    }

    // Outer transaction continues
    await tx.batch.create({ data: { batchNumber: 'BATCH-002' } });
  });
}
```

---

## Service Layer Transaction

```typescript
// application/services/batch.service.ts
import { Injectable } from '@nestjs/common';
import { BatchRepository } from '../../domain';
import { PrismaService } from '../../infrastructure';

@Injectable()
export class BatchService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Service-level transaction
   */
  async transferBatch(
    batchId: string,
    fromSppgId: string,
    toSppgId: string,
  ): Promise<BatchResponseDto> {
    return this.prisma.$transaction(async () => {
      // 1. Get batch
      const batch = await this.batchRepository.findById(batchId);
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }

      // 2. Validate transfer
      if (batch.sppgId !== fromSppgId) {
        throw new BadRequestException('Invalid source SPPG');
      }

      // 3. Update batch
      const updated = await this.batchRepository.update(batchId, {
        sppgId: toSppgId,
      });

      // 4. Log transfer
      await this.transferLogService.log({
        batchId,
        fromSppgId,
        toSppgId,
      });

      return updated;
    });
  }
}
```

---

## Error Handling in Transactions

```typescript
async safeTransaction(): Promise<Batch> {
  try {
    return await this.prisma.$transaction(async (tx) => {
      const batch = await tx.batch.create({
        data: { batchNumber: 'BATCH-001' },
      });

      // This will cause rollback
      await tx.batchItem.create({
        data: {
          batchId: 'non-existent-id', // Foreign key error
          itemId: '1',
        },
      });

      return batch;
    });
  } catch (error) {
    // Transaction was rolled back
    if (error.code === 'P2003') {
      throw new BadRequestException('Referenced record not found');
    }
    throw error;
  }
}
```

---

## Checklist

- [ ] Gunakan $transaction untuk operasi atomic
- [ ] Gunakan interactive transactions untuk operasi kompleks
- [ ] Set timeout untuk transaction
- [ ] Handle rollback dengan proper error
- [ ] Test transaction dengan error scenarios
- [ ] Document operasi yang butuh transaction
- [ ] Jangan hold transaction terlalu lama

---

## Anti-Patterns

```
❌ Multiple separate queries
async createBatchWithItems(batch, items) {
  const batch = await this.prisma.batch.create({ data: batch });
  for (const item of items) {
    await this.prisma.batchItem.create({ data: item }); // Not atomic!
  }
  return batch;
}

✅ Use transaction
async createBatchWithItems(batch, items) {
  return this.prisma.$transaction(async (tx) => {
    const batch = await tx.batch.create({ data: batch });
    await tx.batchItem.createMany({
      data: items.map((item) => ({ batchId: batch.id, ...item })),
    });
    return batch;
  });
}

❌ Long-running transaction
async longTransaction() {
  return this.prisma.$transaction(async (tx) => {
    // Processing for 30 seconds
    await this.processData(tx);
    // Timeout!
  });
}

✅ Keep transactions short
async shortTransaction() {
  // Pre-process data
  const data = await this.prepareData();
  
  return this.prisma.$transaction(async (tx) => {
    // Quick operations only
    await tx.batch.create({ data });
  });
}

❌ No error handling
async createBatch() {
  return this.prisma.$transaction(async (tx) => {
    await tx.batch.create({ data: { batchNumber: 'BATCH-001' } });
    await tx.batchItem.create({ data: { batchId: '1', itemId: '1' } });
  });
}

✅ Handle errors properly
async createBatch() {
  try {
    return await this.prisma.$transaction(async (tx) => {
      const batch = await tx.batch.create({
        data: { batchNumber: 'BATCH-001' },
      });
      await tx.batchItem.create({
        data: { batchId: batch.id, itemId: '1' },
      });
      return batch;
    });
  } catch (error) {
    if (error.code === 'P2003') {
      throw new BadRequestException('Referenced record not found');
    }
    throw error;
  }
}
```

---

## References

- [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)
- [Interactive Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions#interactive-transactions)
- [docs/backend/PATTERNS.md](../PATTERNS.md)
