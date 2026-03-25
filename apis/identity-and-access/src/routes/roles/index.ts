import {
  attachPolicyToRole,
  createRole,
  detachPolicyFromRole,
  getRoleById,
  getRoleWithPolicies,
  listRoles,
  restoreRole,
  setPoliciesForRole,
  softDeleteRole,
  updateRole,
} from "@r6/db-identity-and-access";
import {
  AssignPoliciesToRoleSchema,
  CreateRoleSchema,
  UpdateRoleSchema,
} from "@r6/schemas/identity-and-access";
import { z } from "zod";
import { type Request, type Response, Router } from "express";
import { AppError } from "../../lib/errors";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin, requireTenantScope } from "../../middleware/guards";

const UuidSchema = z.string().uuid();

const router: Router = Router({ mergeParams: true });

const ensureRoleBelongsToTenant = async (id: string, tenantId: string) => {
  const role = await getRoleById(id);
  if (!role) throw new AppError(404, "not_found", "Role not found");
  if (role.tenantId !== tenantId) {
    throw new AppError(403, "forbidden", "Role does not belong to this tenant");
  }
  return role;
};

router.use(authMiddleware(), requireTenantScope());

// ─── POST / — create role ─────────────────────────────────────

router.post("/", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const body = CreateRoleSchema.parse(req.body);
  const role = await createRole({ tenantId, name: body.name, description: body.description ?? null });
  return res.status(201).json(role);
});

// ─── GET / — paginated list ───────────────────────────────────

router.get("/", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const result = await listRoles({ tenantId, page, limit });
  return res.status(200).json(result);
});

// ─── GET /:id — get role with policies ───────────────────────

router.get("/:id", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensureRoleBelongsToTenant(id, tenantId);
  const role = await getRoleWithPolicies(id);
  return res.status(200).json(role);
});

// ─── PATCH /:id ───────────────────────────────────────────────

router.patch("/:id", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensureRoleBelongsToTenant(id, tenantId);
  const body = UpdateRoleSchema.parse(req.body);
  const updated = await updateRole(id, body);
  return res.status(200).json(updated);
});

// ─── DELETE /:id — soft delete ────────────────────────────────

router.delete("/:id", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensureRoleBelongsToTenant(id, tenantId);
  await softDeleteRole(id);
  return res.status(204).send();
});

// ─── POST /:id/restore — admin only ──────────────────────────

router.post("/:id/restore", requireAdmin(), async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const restored = await restoreRole(id);
  return res.status(200).json(restored);
});

// ─── POST /:id/policies — attach single policy ───────────────

router.post("/:id/policies", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensureRoleBelongsToTenant(id, tenantId);
  const { policyId } = z.object({ policyId: UuidSchema }).parse(req.body);
  const result = await attachPolicyToRole({ roleId: id, policyId });
  return res.status(200).json(result);
});

// ─── DELETE /:id/policies/:policyId — detach single policy ───

router.delete("/:id/policies/:policyId", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  const policyId = req.params.policyId as string;
  await ensureRoleBelongsToTenant(id, tenantId);
  const result = await detachPolicyFromRole({ roleId: id, policyId });
  return res.status(200).json(result);
});

// ─── PUT /:id/policies — replace entire policy set ───────────

router.put("/:id/policies", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensureRoleBelongsToTenant(id, tenantId);
  const { policyIds } = AssignPoliciesToRoleSchema.parse(req.body);
  const result = await setPoliciesForRole(id, policyIds);
  return res.status(200).json(result);
});

export default router;
