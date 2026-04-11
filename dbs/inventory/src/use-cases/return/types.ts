import type {
  AuditLog,
  InventoryItem,
  InventoryLot,
  ReturnRequest,
  ReturnRequestItem,
  StockAlert,
  StockMovement,
} from "../../../generated/prisma/client.js";

export type {
  AuditLog,
  InventoryItem,
  InventoryLot,
  ReturnRequest,
  ReturnRequestItem,
  StockAlert,
  StockMovement,
};

export type RequestReturnLineInput = {
  variantId: string;
  quantityReturned: number;
  disposition: "RESTOCK" | "DAMAGE" | "RETURN_TO_SUPPLIER";
  lotId?: string;
  serialNumber?: string;
  dispositionNotes?: string;
};

export type RequestReturnInput = {
  tenantId: string;
  performedBy: string;
  referenceId: string;
  referenceType: string;
  returnReason?: string;
  lines: RequestReturnLineInput[];
};

export type RequestReturnResult = {
  returnRequest: ReturnRequest;
  items: ReturnRequestItem[];
};

export type ApproveReturnInput = {
  tenantId: string;
  approvedBy: string;
  returnRequestId: string;
};

export type ApproveReturnResult = {
  returnRequest: ReturnRequest;
};

export type ReceiveReturnLineInput = {
  returnRequestItemId: string;
  disposition?: "RESTOCK" | "DAMAGE" | "RETURN_TO_SUPPLIER";
  dispositionNotes?: string;
};

export type ReceiveReturnInput = {
  tenantId: string;
  performedBy: string;
  returnRequestId: string;
  lines: ReceiveReturnLineInput[];
};

export type ReceiveReturnResult = {
  returnRequest: ReturnRequest;
  items: ReturnRequestItem[];
};

export type DispositionLineResult = {
  item: ReturnRequestItem;
  lot?: InventoryLot;
  movement?: StockMovement;
  inventoryItem?: InventoryItem;
  alerts: StockAlert[];
};

export type ProcessReturnDispositionInput = {
  tenantId: string;
  performedBy: string;
  returnRequestId: string;
  warehouseId: string;
};

export type ProcessReturnDispositionResult = {
  returnRequest: ReturnRequest;
  lines: DispositionLineResult[];
  auditLog: AuditLog;
};
