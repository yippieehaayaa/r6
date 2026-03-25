import {
  createTenant,
  getTenantById,
  listTenants,
  restoreTenant,
  softDeleteTenant,
  updateTenant,
} from "@r6/db-identity-and-access";
import {
  CreateTenantSchema,
  UpdateTenantSchema,
} from "@r6/schemas/identity-and-access";
import { type Request, type Response, Router } from "express";
import { AppError } from "../../lib/errors";
import { authMiddleware } from "../../middleware/auth";
import {
  requireAdmin,
  requireAdminOrTenantOwner,
} from "../../middleware/guard";
import identitiesRouter from "../identities";
import policiesRouter from "../policies";
import rolesRouter from "../roles";

const router: Router = Router();

router.use(authMiddleware());

// ─── POST / — create tenant (admin only) ─────────────────────

router.post("/", requireAdmin(), async (req: Request, res: Response) => {
  const body = CreateTenantSchema.parse(req.body);
  const tenant = await createTenant(body);
  return res.status(201).json(tenant);
});

// ─── GET / — list tenants (admin only) ───────────────────────

router.get("/", requireAdmin(), async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const isActive =
    req.query.isActive === "true"
      ? true
      : req.query.isActive === "false"
        ? false
        : undefined;
  const result = await listTenants({ page, limit, isActive });
  return res.status(200).json(result);
});

// ─── GET /:tenantId ───────────────────────────────────────────

router.get(
  "/:tenantId",
  requireAdminOrTenantOwner(),
  async (req: Request, res: Response) => {
    const tenantId = req.params.tenantId as string;
    const tenant = await getTenantById(tenantId);
    if (!tenant) throw new AppError(404, "not_found", "Tenant not found");
    return res.status(200).json(tenant);
  },
);

// ─── PATCH /:tenantId ─────────────────────────────────────────

router.patch(
  "/:tenantId",
  requireAdminOrTenantOwner(),
  async (req: Request, res: Response) => {
    const tenantId = req.params.tenantId as string;
    const tenant = await getTenantById(tenantId);
    if (!tenant) throw new AppError(404, "not_found", "Tenant not found");
    const body = UpdateTenantSchema.parse(req.body);
    const updated = await updateTenant(tenantId, body);
    return res.status(200).json(updated);
  },
);

// ─── DELETE /:tenantId — soft delete (admin only) ────────────

router.delete(
  "/:tenantId",
  requireAdmin(),
  async (req: Request, res: Response) => {
    const tenantId = req.params.tenantId as string;
    const tenant = await getTenantById(tenantId);
    if (!tenant) throw new AppError(404, "not_found", "Tenant not found");
    await softDeleteTenant(tenantId);
    return res.status(204).send();
  },
);

// ─── POST /:tenantId/restore — restore (admin only) ──────────

router.post(
  "/:tenantId/restore",
  requireAdmin(),
  async (req: Request, res: Response) => {
    const restored = await restoreTenant(req.params.tenantId as string);
    return res.status(200).json(restored);
  },
);

// ─── Sub-routers: identities, roles, policies ────────────────

router.use("/:tenantId/identities", identitiesRouter);
router.use("/:tenantId/roles", rolesRouter);
router.use("/:tenantId/policies", policiesRouter);

export default router;
