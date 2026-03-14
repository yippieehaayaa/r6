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

export const createSupplier = (input: supplierRepo.CreateSupplierInput) =>
  supplierRepo.createSupplier(input);

export const listSuppliers = (input: supplierRepo.ListSuppliersInput) =>
  supplierRepo.listSuppliers(input);

export const getSupplierById = (id: string) => supplierRepo.getSupplierById(id);

export const updateSupplier = (
  id: string,
  input: supplierRepo.UpdateSupplierInput,
) => supplierRepo.updateSupplier(id, input);

export const deleteSupplier = (id: string) => supplierRepo.deleteSupplier(id);

// --- Purchase Orders ---

export const createPurchaseOrder = (input: poRepo.CreatePurchaseOrderInput) =>
  poRepo.createPurchaseOrder(input);

export const listPurchaseOrders = (input: poRepo.ListPurchaseOrdersInput) =>
  poRepo.listPurchaseOrders(input);

export const getPurchaseOrderById = (id: string) =>
  poRepo.getPurchaseOrderById(id);

export const updatePurchaseOrder = (
  id: string,
  input: poRepo.UpdatePurchaseOrderInput,
) => poRepo.updatePurchaseOrder(id, input);

export const deletePurchaseOrder = (id: string) =>
  poRepo.deletePurchaseOrder(id);

// --- Purchase Order Lifecycle ---

export const sendPurchaseOrder = (id: string) => poRepo.sendPurchaseOrder(id);

export const confirmPurchaseOrder = (id: string) =>
  poRepo.confirmPurchaseOrder(id);

export const cancelPurchaseOrder = (id: string) =>
  poRepo.cancelPurchaseOrder(id);

export const receivePurchaseOrder = (
  id: string,
  receipts: poRepo.ReceiptItem[],
  performedBy: string,
) => poRepo.receivePurchaseOrder(id, receipts, performedBy);

// --- Purchase Order Items ---

export const addItemToOrder = (
  purchaseOrderId: string,
  input: poRepo.AddItemToOrderInput,
) => poRepo.addItemToOrder(purchaseOrderId, input);

export const removeItemFromOrder = (
  purchaseOrderId: string,
  variantId: string,
) => poRepo.removeItemFromOrder(purchaseOrderId, variantId);

export const updateOrderItem = (
  purchaseOrderId: string,
  variantId: string,
  input: poRepo.UpdateOrderItemInput,
) => poRepo.updateOrderItem(purchaseOrderId, variantId, input);
