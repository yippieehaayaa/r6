import { prisma } from "../../client.js";
import type {
  LotExpiryAlertResult,
  ProcessLotExpiryAlertsInput,
  ProcessLotExpiryAlertsResult,
} from "./types.js";

const processLotExpiryAlerts = async (
  input: ProcessLotExpiryAlertsInput,
): Promise<ProcessLotExpiryAlertsResult> => {
  const config = await prisma.tenantInventoryConfig.findUnique({
    where: { tenantId: input.tenantId },
  });
  if (!config) {
    throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
  }

  const now = new Date();
  const alertWindowEnd = new Date(
    now.getTime() + config.lotExpiryAlertDays * 24 * 60 * 60 * 1000,
  );

  const [expiringLots, expiredLots] = await Promise.all([
    prisma.inventoryLot.findMany({
      where: {
        tenantId: input.tenantId,
        quantityRemaining: { gt: 0 },
        isQuarantined: false,
        expiresAt: { gte: now, lte: alertWindowEnd },
      },
    }),
    prisma.inventoryLot.findMany({
      where: {
        tenantId: input.tenantId,
        quantityRemaining: { gt: 0 },
        expiresAt: { lt: now },
      },
    }),
  ]);

  const expiring: LotExpiryAlertResult[] = [];
  const expired: LotExpiryAlertResult[] = [];

  for (const lot of expiringLots) {
    const result = await createLotAlert(
      input.tenantId,
      lot.id,
      lot.variantId,
      lot.warehouseId,
      "LOT_EXPIRING",
      lot.quantityRemaining,
    );
    if (result) {
      expiring.push({ lot, alert: result });
    }
  }

  for (const lot of expiredLots) {
    const result = await createLotAlert(
      input.tenantId,
      lot.id,
      lot.variantId,
      lot.warehouseId,
      "LOT_EXPIRED",
      lot.quantityRemaining,
    );
    if (result) {
      expired.push({ lot, alert: result });
    }
  }

  return { expiring, expired };
};

const createLotAlert = async (
  tenantId: string,
  lotId: string,
  variantId: string,
  warehouseId: string,
  alertType: "LOT_EXPIRING" | "LOT_EXPIRED",
  currentQty: number,
) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.stockAlert.findFirst({
      where: {
        tenantId,
        variantId,
        warehouseId,
        lotId,
        alertType,
        status: "OPEN",
      },
    });

    if (existing) return null;

    return tx.stockAlert.create({
      data: {
        tenantId,
        variantId,
        warehouseId,
        lotId,
        alertType,
        status: "OPEN",
        currentQty,
      },
    });
  });
};

export { processLotExpiryAlerts };
