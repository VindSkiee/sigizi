export class Money {
  readonly amount: number;
  readonly currency: string;

  constructor(amount: number, currency: string = "IDR") {
    if (amount < 0) {
      throw new Error("Money amount cannot be negative");
    }

    this.amount = amount;
    this.currency = currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot add money with different currencies");
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Cannot subtract money with different currencies");
    }
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error("Insufficient amount");
    }
    return new Money(result, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  greaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error("Cannot compare money with different currencies");
    }
    return this.amount > other.amount;
  }

  format(): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: this.currency,
      minimumFractionDigits: 0,
    }).format(this.amount);
  }

  toJSON() {
    return { amount: this.amount, currency: this.currency };
  }
}
