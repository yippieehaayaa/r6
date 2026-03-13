export {
  type DomainEventMap,
  domainEvents,
  type LowStockDetectedPayload,
  type ProductPublishedPayload,
  type PurchaseOrderReceivedPayload,
  type StockLevelChangedPayload,
} from "./domain-events";
export { registerEventHandlers } from "./handlers";
