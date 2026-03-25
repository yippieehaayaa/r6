import { attachPolicyToRole } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ensureRoleBelongsToTenant } from "../helpers";

const UuidSchema = z.string().uuid();

export async function attachPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const id = req.params.id as string;
    await ensureRoleBelongsToTenant(id, tenantId);
    const { policyId } = z.object({ policyId: UuidSchema }).parse(req.body);
    const result = await attachPolicyToRole({ roleId: id, policyId });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
