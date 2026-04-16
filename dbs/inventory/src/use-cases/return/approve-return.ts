import { prisma } from "../../client.js";
import { writeAuditLog } from "../_shared/audit.js";
import type { ApproveReturnInput, ApproveReturnResult } from "./types.js";

const approveReturn = async (
  input: ApproveReturnInput,
): Promise<ApproveReturnResult> => {
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
    if (returnRequest.status !== "REQUESTED") {
      throw new Error(
        `Return request ${input.returnRequestId} cannot be approved (status: ${returnRequest.status})`,
      );
    }

    const before = { ...returnRequest };
    const updatedRequest = await tx.returnRequest.update({
      where: { id: returnRequest.id },
      data: {
        status: "APPROVED",
        approvedBy: input.approvedBy,
        approvedAt: new Date(),
      },
    });

    await writeAuditLog(tx, {
      tenantId: input.tenantId,
      entityType: "ReturnRequest",
      entityId: returnRequest.id,
      action: "UPDATE",
      changedBy: input.approvedBy,
      before,
      after: updatedRequest,
    });

    return { returnRequest: updatedRequest };
  });
};

export { approveReturn };
