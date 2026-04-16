import { prisma } from "../../client.js";
import type { ResolveAlertInput, ResolveAlertResult } from "./types.js";

const resolveAlert = async (
  input: ResolveAlertInput,
): Promise<ResolveAlertResult> => {
  return prisma.$transaction(async (tx) => {
    const alert = await tx.stockAlert.findFirst({
      where: {
        id: input.alertId,
        tenantId: input.tenantId,
      },
    });

    if (!alert) {
      throw new Error(`Alert ${input.alertId} not found`);
    }

    if (alert.status === "RESOLVED") {
      throw new Error(`Alert ${input.alertId} is already resolved`);
    }

    const updated = await tx.stockAlert.update({
      where: { id: alert.id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolvedBy: input.resolvedBy,
        ...(input.notes && { notes: input.notes }),
      },
    });

    return { alert: updated };
  });
};

export { resolveAlert };
