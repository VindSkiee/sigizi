export class OrderCompletedEvent {
  constructor(
    public readonly orderId: string,
    public readonly sppgId: string,
    public readonly items: Array<{
      orderItemId: string;
      itemId: string;
      quantity: number;
      unitPrice: number;
    }>,
    public readonly completedById: string,
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly orderId: string,
    public readonly sppgId: string,
    public readonly previousStatus: string,
    public readonly cancelledById: string,
    public readonly reason: string,
  ) {}
}
