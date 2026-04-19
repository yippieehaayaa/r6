import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { createTenant } from "./controller/create";

const router: Router = Router();

// Defense-in-depth — authMiddleware is also applied at the mount point in routes/index.ts.
router.use(authMiddleware());

// POST /tenants
//   Creates a new tenant with the caller as the owner.
//   Only authenticated identities that do not already belong to a tenant may call this.
router.post("/", createTenant);

export default router;
