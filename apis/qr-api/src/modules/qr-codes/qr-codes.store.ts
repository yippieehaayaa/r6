import type { DynamicQrRecord } from "./qr-codes.types";

export class QrCodesStore {
  private readonly records = new Map<string, DynamicQrRecord>();

  constructor(private readonly maxRecords: number) {}

  save(record: DynamicQrRecord): void {
    this.records.set(record.id, record);
    this.prune();
  }

  get(id: string): DynamicQrRecord | undefined {
    return this.records.get(id);
  }

  has(id: string): boolean {
    return this.records.has(id);
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
