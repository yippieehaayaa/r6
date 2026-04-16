import { prisma } from "../../client.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { ReceiveReturnInput, ReceiveReturnResult } from "./types.js";

const receiveReturn = async (
  input: ReceiveReturnInput,
): Promise<ReceiveReturnResult> => {
  if (!input.lines.length) {
    throw new Error("At least one line item is required");
  }

  return prisma.$transaction(async (tx) => {
    const config = await tx.tenantInventoryConfig.findUnique({
      where: { tenantId: input.tenantId },
    });
    if (!config) {
      throw new Error(`Tenant ${input.tenantId} has not been onboarded`);
    }

    const returnRequest = await tx.returnRequest.findFirst({
      where: {
        id: input.returnRequestId,
        tenantId: input.tenantId,
        deletedAt: null,
      },
      include: { items: true },
    });

    if (!returnRequest) {
      throw new Error(`Return request ${input.returnRequestId} not found`);
    }
    if (returnRequest.status !== "APPROVED") {
      throw new Error(
        `Return request ${input.returnRequestId} cannot be received (status: ${returnRequest.status})`,
      );
    }

    const itemMap = new Map(returnRequest.items.map((i) => [i.id, i]));
    for (const line of input.lines) {
      if (!itemMap.has(line.returnRequestItemId)) {
        throw new Error(
          `Return request item ${line.returnRequestItemId} not found on request ${input.returnRequestId}`,
        );
      }
    }

    const updatedItems = await Promise.all(
      input.lines.map((line) => {
        const data: Record<string, unknown> = {};
        if (line.disposition) data.disposition = line.disposition;
        if (line.dispositionNotes !== undefined)
          data.dispositionNotes = line.dispositionNotes;

        if (!Object.keys(data).length) {
          return tx.returnRequestItem.findUniqueOrThrow({
            where: { id: line.returnRequestItemId },
          });
        }

        return tx.returnRequestItem.update({
          where: { id: line.returnRequestItemId },
          data,
        });
      }),
    );

    const before = { ...returnRequest };
    const updatedRequest = await tx.returnRequest.update({
      where: { id: returnRequest.id },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
      },
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "ReturnRequest",
      entityId: returnRequest.id,
      action: "UPDATE",
      changedBy: input.performedBy,
      before,
      after: updatedRequest,
    });

    return { returnRequest: updatedRequest, items: updatedItems };
  });
};

export { receiveReturn };
