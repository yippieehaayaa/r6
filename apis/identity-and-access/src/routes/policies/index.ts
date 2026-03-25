import {
  createPolicy,
  getPolicyById,
  listPolicies,
  restorePolicy,
  softDeletePolicy,
  updatePolicy,
} from "@r6/db-identity-and-access";
import {
  CreatePolicySchema,
  UpdatePolicySchema,
} from "@r6/schemas/identity-and-access";
import { type Request, type Response, Router } from "express";
import { AppError } from "../../lib/errors";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin, requireTenantScope } from "../../middleware/guards";

const router: Router = Router({ mergeParams: true });

const ensurePolicyBelongsToTenant = async (id: string, tenantId: string) => {
  const policy = await getPolicyById(id);
  if (!policy) throw new AppError(404, "not_found", "Policy not found");
  if (policy.tenantId !== tenantId) {
    throw new AppError(
      403,
      "forbidden",
      "Policy does not belong to this tenant",
    );
  }
  return policy;
};

router.use(authMiddleware(), requireTenantScope());

// ─── POST / — create policy ───────────────────────────────────

router.post("/", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const body = CreatePolicySchema.parse(req.body);
  const policy = await createPolicy({ ...body, tenantId });
  return res.status(201).json(policy);
});

// ─── GET / — paginated list ───────────────────────────────────

router.get("/", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const result = await listPolicies({ tenantId, page, limit });
  return res.status(200).json(result);
});

// ─── GET /:id ─────────────────────────────────────────────────

router.get("/:id", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  const policy = await ensurePolicyBelongsToTenant(id, tenantId);
  return res.status(200).json(policy);
});

// ─── PATCH /:id ───────────────────────────────────────────────

router.patch("/:id", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensurePolicyBelongsToTenant(id, tenantId);
  const body = UpdatePolicySchema.parse(req.body);
  const updated = await updatePolicy(id, body);
  return res.status(200).json(updated);
});

// ─── DELETE /:id — soft delete ────────────────────────────────

router.delete("/:id", async (req: Request, res: Response) => {
  const tenantId = req.params.tenantId as string;
  const id = req.params.id as string;
  await ensurePolicyBelongsToTenant(id, tenantId);
  await softDeletePolicy(id);
  return res.status(204).send();
});

// ─── POST /:id/restore — admin only ──────────────────────────

router.post(
  "/:id/restore",
  requireAdmin(),
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const restored = await restorePolicy(id);
    return res.status(200).json(restored);
  },
);

export default router;
