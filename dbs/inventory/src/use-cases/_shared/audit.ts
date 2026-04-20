import type {
  AuditAction,
  PrismaClient,
} from "../../../generated/prisma/client.js";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type WriteAuditLogParams = {
  tenantId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  changedBy: string;
  before?: unknown;
  after?: unknown;
};

const writeAuditLog = (tx: TransactionClient, params: WriteAuditLogParams) => {
  return tx.auditLog.create({
    data: {
      tenantId: params.tenantId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      changedBy: params.changedBy,
      before: params.before as never,
      after: params.after as never,
    },
  });
};

const writeAuditLogs = (
  tx: TransactionClient,
  entries: WriteAuditLogParams[],
) => {
  return Promise.all(entries.map((entry) => writeAuditLog(tx, entry)));
};

export { writeAuditLog, writeAuditLogs };
export type { TransactionClient, WriteAuditLogParams };
