import { EventEmitter } from "node:events";

export interface StockLevelChangedPayload {
  variantId: string;
  warehouseId: string;
  quantityOnHand: number;
  quantityReserved: number;
  reorderPoint: number;
}

export interface PurchaseOrderReceivedPayload {
  purchaseOrderId: string;
  warehouseId: string;
  items: { variantId: string; quantityReceived: number }[];
  performedBy: string;
}

export interface ProductPublishedPayload {
  productId: string;
  sku: string;
  slug: string;
}

export interface LowStockDetectedPayload {
  variantId: string;
  warehouseId: string;
  quantityOnHand: number;
  reorderPoint: number;
  reorderQuantity: number;
}

export interface DomainEventMap {
  "stock.level.changed": StockLevelChangedPayload;
  "purchase-order.received": PurchaseOrderReceivedPayload;
  "product.published": ProductPublishedPayload;
  "low-stock.detected": LowStockDetectedPayload;
}

type EventName = keyof DomainEventMap;

class DomainEventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  emit<E extends EventName>(event: E, payload: DomainEventMap[E]): void {
    this.emitter.emit(event, payload);
  }

  on<E extends EventName>(
    event: E,
    handler: (payload: DomainEventMap[E]) => void | Promise<void>,
  ): void {
    this.emitter.on(event, handler);
  }

  off<E extends EventName>(
    event: E,
    handler: (payload: DomainEventMap[E]) => void | Promise<void>,
  ): void {
    this.emitter.off(event, handler);
  }

  once<E extends EventName>(
    event: E,
    handler: (payload: DomainEventMap[E]) => void | Promise<void>,
  ): void {
    this.emitter.once(event, handler);
  }

  removeAllListeners(event?: EventName): void {
    this.emitter.removeAllListeners(event);
  }
}

export const domainEvents = new DomainEventBus();
