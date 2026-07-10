export class DateRange {
  readonly startDate: Date;
  readonly endDate: Date;

  constructor(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    }

    this.startDate = startDate;
    this.endDate = endDate;
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  isValid(): boolean {
    return this.startDate < this.endDate;
  }

  durationInDays(): number {
    const diff = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isExpired(): boolean {
    return new Date() > this.endDate;
  }

  overlaps(other: DateRange): boolean {
    return this.startDate < other.endDate && this.endDate > other.startDate;
  }

  equals(other: DateRange): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime()
    );
  }

  static fromPrisma(startDate: Date, endDate: Date): DateRange {
    return new DateRange(startDate, endDate);
  }
}
