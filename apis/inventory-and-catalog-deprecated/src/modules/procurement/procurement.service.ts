import * as poRepo from "./purchase-order.repository";
import * as supplierRepo from "./supplier.repository";

export type {
  AddItemToOrderInput,
  CreatePurchaseOrderInput,
  CreatePurchaseOrderItem,
  ListPurchaseOrdersInput,
  ReceiptItem,
  UpdateOrderItemInput,
  UpdatePurchaseOrderInput,
} from "./purchase-order.repository";
export type {
  CreateSupplierInput,
  ListSuppliersInput,
  UpdateSupplierInput,
} from "./supplier.repository";

// --- Suppliers ---

export const createSupplier = (
  tenantSlug: string,
  input: supplierRepo.CreateSupplierInput,
) => supplierRepo.createSupplier(tenantSlug, input);

export const listSuppliers = (
  tenantSlug: string,
  input: supplierRepo.ListSuppliersInput,
) => supplierRepo.listSuppliers(tenantSlug, input);

export const getSupplierById = (tenantSlug: string, id: string) =>
  supplierRepo.getSupplierById(tenantSlug, id);

export const updateSupplier = (
  tenantSlug: string,
  id: string,
  input: supplierRepo.UpdateSupplierInput,
) => supplierRepo.updateSupplier(tenantSlug, id, input);

export const deleteSupplier = (tenantSlug: string, id: string) =>
  supplierRepo.deleteSupplier(tenantSlug, id);

// --- Purchase Orders ---

export const createPurchaseOrder = (
  tenantSlug: string,
  input: poRepo.CreatePurchaseOrderInput,
) => poRepo.createPurchaseOrder(tenantSlug, input);

export const listPurchaseOrders = (
  tenantSlug: string,
  input: poRepo.ListPurchaseOrdersInput,
) => poRepo.listPurchaseOrders(tenantSlug, input);

export const getPurchaseOrderById = (tenantSlug: string, id: string) =>
  poRepo.getPurchaseOrderById(tenantSlug, id);

export const updatePurchaseOrder = (
  tenantSlug: string,
  id: string,
  input: poRepo.UpdatePurchaseOrderInput,
) => poRepo.updatePurchaseOrder(tenantSlug, id, input);

export const deletePurchaseOrder = (tenantSlug: string, id: string) =>
  poRepo.deletePurchaseOrder(tenantSlug, id);

// --- Purchase Order Lifecycle ---

export const sendPurchaseOrder = (tenantSlug: string, id: string) =>
  poRepo.sendPurchaseOrder(tenantSlug, id);

export const confirmPurchaseOrder = (tenantSlug: string, id: string) =>
  poRepo.confirmPurchaseOrder(tenantSlug, id);

export const cancelPurchaseOrder = (tenantSlug: string, id: string) =>
  poRepo.cancelPurchaseOrder(tenantSlug, id);

export const receivePurchaseOrder = (
  tenantSlug: string,
  id: string,
  receipts: poRepo.ReceiptItem[],
  performedBy: string,
) => poRepo.receivePurchaseOrder(tenantSlug, id, receipts, performedBy);

// --- Purchase Order Items ---

export const addItemToOrder = (
  tenantSlug: string,
  purchaseOrderId: string,
  input: poRepo.AddItemToOrderInput,
) => poRepo.addItemToOrder(tenantSlug, purchaseOrderId, input);

export const removeItemFromOrder = (
  tenantSlug: string,
  purchaseOrderId: string,
  variantId: string,
) => poRepo.removeItemFromOrder(tenantSlug, purchaseOrderId, variantId);

export const updateOrderItem = (
  tenantSlug: string,
  purchaseOrderId: string,
  variantId: string,
  input: poRepo.UpdateOrderItemInput,
) => poRepo.updateOrderItem(tenantSlug, purchaseOrderId, variantId, input);
