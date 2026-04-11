import type {
  InventoryLot,
  StockAlert,
} from "../../../generated/prisma/client.js";

export type { InventoryLot, StockAlert };

export type ProcessLotExpiryAlertsInput = {
  tenantId: string;
};

export type LotExpiryAlertResult = {
  lot: InventoryLot;
  alert: StockAlert;
};

export type ProcessLotExpiryAlertsResult = {
  expiring: LotExpiryAlertResult[];
  expired: LotExpiryAlertResult[];
};

export type AcknowledgeAlertInput = {
  tenantId: string;
  alertId: string;
  acknowledgedBy: string;
  notes?: string;
};

export type AcknowledgeAlertResult = {
  alert: StockAlert;
};

export type ResolveAlertInput = {
  tenantId: string;
  alertId: string;
  resolvedBy: string;
  notes?: string;
};

export type ResolveAlertResult = {
  alert: StockAlert;
};
