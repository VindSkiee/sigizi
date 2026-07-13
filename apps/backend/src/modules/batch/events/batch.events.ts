export class BatchCancelledEvent {
  constructor(
    public readonly batchId: string,
    public readonly batchNumber: string,
    public readonly sppgId: string,
    public readonly cancelledById: string,
    public readonly items: Array<{
      batchItemId: string;
      itemId: string;
      inventoryStockId: string | null;
      quantity: number;
      unitPrice: number;
    }>,
    public readonly reason: string,
  ) {}
}

export class BatchFailedEvent {
  constructor(
    public readonly batchId: string,
    public readonly batchNumber: string,
    public readonly sppgId: string,
    public readonly failedById: string,
    public readonly items: Array<{
      batchItemId: string;
      itemId: string;
      inventoryStockId: string | null;
      quantity: number;
      unitPrice: number;
    }>,
    public readonly failedReason: string,
    public readonly failedEvidence: string,
  ) {}
}
