import type { BusinessCardRecord } from "./business-cards.types";

export class BusinessCardsStore {
  private readonly records = new Map<string, BusinessCardRecord>();

  constructor(private readonly maxRecords: number) {}

  save(record: BusinessCardRecord): void {
    this.records.set(record.id, record);
    this.prune();
  }

  get(id: string): BusinessCardRecord | undefined {
    return this.records.get(id);
  }

  private prune(): void {
    while (this.records.size > this.maxRecords) {
      const oldestKey = this.records.keys().next().value;
      if (!oldestKey) {
        return;
      }

      this.records.delete(oldestKey);
    }
  }
}
