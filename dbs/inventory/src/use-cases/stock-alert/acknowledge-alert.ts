import { prisma } from "../../client.js";
import type { AcknowledgeAlertInput, AcknowledgeAlertResult } from "./types.js";

const acknowledgeAlert = async (
  input: AcknowledgeAlertInput,
): Promise<AcknowledgeAlertResult> => {
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

    if (alert.status !== "OPEN") {
      throw new Error(
        `Alert ${input.alertId} cannot be acknowledged (status: ${alert.status})`,
      );
    }

    const updated = await tx.stockAlert.update({
      where: { id: alert.id },
      data: {
        status: "ACKNOWLEDGED",
        ...(input.notes && { notes: input.notes }),
      },
    });

    return { alert: updated };
  });
};

export { acknowledgeAlert };
