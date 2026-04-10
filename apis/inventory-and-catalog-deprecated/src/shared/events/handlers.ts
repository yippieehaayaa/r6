import { domainEvents } from "./domain-events";

export function registerEventHandlers(): void {
  domainEvents.on("stock.level.changed", (payload) => {
    if (payload.quantityOnHand <= payload.reorderPoint) {
      domainEvents.emit("low-stock.detected", {
        variantId: payload.variantId,
        warehouseId: payload.warehouseId,
        quantityOnHand: payload.quantityOnHand,
        reorderPoint: payload.reorderPoint,
        reorderQuantity: 0,
      });
    }
  });

  domainEvents.on("low-stock.detected", (payload) => {
    console.log(
      `[LowStock] variant=${payload.variantId} warehouse=${payload.warehouseId} qty=${payload.quantityOnHand} reorder=${payload.reorderPoint}`,
    );
  });

  domainEvents.on("purchase-order.received", (payload) => {
    console.log(
      `[POReceived] po=${payload.purchaseOrderId} warehouse=${payload.warehouseId} items=${payload.items.length}`,
    );
  });

  domainEvents.on("product.published", (payload) => {
    console.log(
      `[ProductPublished] product=${payload.productId} sku=${payload.sku}`,
    );
  });
}
