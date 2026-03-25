import {
  assignRoleToIdentity,
  createIdentity,
  getIdentityById,
  listIdentities,
  removeRoleFromIdentity,
  restoreIdentity,
  setRolesForIdentity,
  softDeleteIdentity,
  updateIdentity,
} from "@r6/db-identity-and-access";
import {
  CreateIdentitySchema,
  UpdateIdentitySchema,
} from "@r6/schemas/identity-and-access";
import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { AppError } from "../../lib/errors";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin, requireTenantScope } from "../../middleware/guards";

const UuidSchema = z.string().uuid();

const router: Router = Router({ mergeParams: true });

const toSafeIdentity = <T extends { hash: string; salt: string }>(
  identity: T,
) => {
  const { hash, salt, ...safe } = identity;
  return safe;
};

const ensureIdentityBelongsToTenant = async (id: string, tenantId: string) => {
  const identity = await getIdentityById(id);
  if (!identity) throw new AppError(404, "not_found", "Identity not found");
  if (identity.tenantId !== tenantId) {
    throw new AppError(
      403,
      "forbidden",
      "Identity does not belong to this tenant",
    );
  }
  return identity;
};

router.use(authMiddleware(), requireTenantScope());

// ─── POST / — create identity in tenant ──────────────────────

router.post("/", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const body = CreateIdentitySchema.parse(req.body);

  const identity = await createIdentity({
    tenantId,
    username: body.username,
    email: body.email ?? null,
    password: body.plainPassword,
    kind: body.kind ?? "USER",
    mustChangePassword: false,
  });

  await updateIdentity(identity.id, { status: "ACTIVE" });
  const fresh = await getIdentityById(identity.id);
  if (!fresh)
    throw new AppError(500, "internal", "Failed to retrieve created identity");
  return res.status(201).json(toSafeIdentity(fresh));
});

// ─── GET / — paginated list ───────────────────────────────────

router.get("/", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const result = await listIdentities({ tenantId, page, limit });
  return res.status(200).json({
    ...result,
    data: result.data.map(toSafeIdentity),
  });
});

// ─── GET /:id ─────────────────────────────────────────────────

router.get("/:id", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  const identity = await ensureIdentityBelongsToTenant(id, tenantId);
  return res.status(200).json(toSafeIdentity(identity));
});

// ─── PATCH /:id ───────────────────────────────────────────────

router.patch("/:id", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensureIdentityBelongsToTenant(id, tenantId);
  const body = UpdateIdentitySchema.parse(req.body);
  const updated = await updateIdentity(id, body);
  return res.status(200).json(toSafeIdentity(updated));
});

// ─── DELETE /:id — soft delete ────────────────────────────────

router.delete("/:id", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensureIdentityBelongsToTenant(id, tenantId);
  await softDeleteIdentity(id);
  return res.status(204).send();
});

// ─── POST /:id/restore — admin only ──────────────────────────

router.post(
  "/:id/restore",
  requireAdmin(),
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const restored = await restoreIdentity(id);
    return res.status(200).json(toSafeIdentity(restored));
  },
);

// ─── POST /:id/roles — assign single role ────────────────────

router.post("/:id/roles", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensureIdentityBelongsToTenant(id, tenantId);
  const { roleId } = z.object({ roleId: UuidSchema }).parse(req.body);
  const result = await assignRoleToIdentity({ identityId: id, roleId });
  return res.status(200).json(toSafeIdentity(result));
});

// ─── DELETE /:id/roles/:roleId — remove single role ──────────

router.delete("/:id/roles/:roleId", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  const roleId = req.params.roleId as string;
  await ensureIdentityBelongsToTenant(id, tenantId);
  const result = await removeRoleFromIdentity({ identityId: id, roleId });
  return res.status(200).json(toSafeIdentity(result));
});

// ─── PUT /:id/roles — replace entire role set ────────────────

router.put("/:id/roles", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensureIdentityBelongsToTenant(id, tenantId);
  const { roleIds } = z
    .object({ roleIds: z.array(UuidSchema) })
    .parse(req.body);
  const result = await setRolesForIdentity(id, roleIds);
  return res.status(200).json(toSafeIdentity(result));
});

export default router;
