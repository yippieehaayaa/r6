import { prisma } from "../../client.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { RejectReturnInput, RejectReturnResult } from "./types.js";

const rejectReturn = async (
  input: RejectReturnInput,
): Promise<RejectReturnResult> => {
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
    });

    if (!returnRequest) {
      throw new Error(`Return request ${input.returnRequestId} not found`);
    }
    if (
      returnRequest.status !== "REQUESTED" &&
      returnRequest.status !== "APPROVED"
    ) {
      throw new Error(
        `Return request ${input.returnRequestId} cannot be rejected (status: ${returnRequest.status})`,
      );
    }

    const before = { ...returnRequest };
    const updatedRequest = await tx.returnRequest.update({
      where: { id: returnRequest.id },
      data: {
        status: "REJECTED",
      },
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "ReturnRequest",
      entityId: returnRequest.id,
      action: "UPDATE",
      changedBy: input.rejectedBy,
      before,
      after: updatedRequest,
    });

    return { returnRequest: updatedRequest };
  });
};

export { rejectReturn };
