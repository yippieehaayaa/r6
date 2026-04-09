import { type Request, type Response, Router } from "express";
import { validate } from "../../shared/middleware";
import type { MovementType } from "../../utils/prisma";
import * as inventoryService from "./inventory.service";
import {
  adjustStockSchema,
  commitSaleSchema,
  createWarehouseSchema,
  recordDamageSchema,
  releaseReservationSchema,
  reserveStockSchema,
  transferStockSchema,
  updateWarehouseSchema,
} from "./inventory.validator";

const router = Router();

// ─── Warehouses ──────────────────────────────────────────────────────────────

router.get("/warehouses", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = req.query.search as string | undefined;
  const isActive =
    req.query.isActive !== undefined
      ? req.query.isActive === "true"
      : undefined;

  const result = await inventoryService.listWarehouses(tenantSlug, {
    page,
    limit,
    search,
    isActive,
  });
  res.json(result);
});

router.get("/warehouses/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  const warehouse = await inventoryService.getWarehouseById(
    tenantSlug,
    req.params.id as string,
  );
  res.json(warehouse);
});

router.post(
  "/warehouses",
  validate(createWarehouseSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload?.tenantSlug as string;
    const warehouse = await inventoryService.createWarehouse(
      tenantSlug,
      req.body,
    );
    res.status(201).json(warehouse);
  },
);

router.patch(
  "/warehouses/:id",
  validate(updateWarehouseSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload?.tenantSlug as string;
    const warehouse = await inventoryService.updateWarehouse(
      tenantSlug,
      req.params.id as string,
      req.body,
    );
    res.json(warehouse);
  },
);

router.delete("/warehouses/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  await inventoryService.deleteWarehouse(tenantSlug, req.params.id as string);
  res.sendStatus(204);
});

// ─── Stock Queries ───────────────────────────────────────────────────────────

router.get(
  "/stock/:variantId/:warehouseId",
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload?.tenantSlug as string;
    const item = await inventoryService.getStockForVariant(
      tenantSlug,
      req.params.variantId as string,
      req.params.warehouseId as string,
    );
    res.json(item);
  },
);

router.get("/stock/product/:productId", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  const items = await inventoryService.getStockForProduct(
    tenantSlug,
    req.params.productId as string,
  );
  res.json(items);
});

router.get("/low-stock", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  const warehouseId = req.query.warehouseId as string | undefined;
  const items = await inventoryService.getLowStockItems(
    tenantSlug,
    warehouseId,
  );
  res.json(items);
});

router.get("/in-stock", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  const warehouseId = req.query.warehouseId as string | undefined;
  const items = await inventoryService.getInStockItems(tenantSlug, warehouseId);
  res.json(items);
});

router.get("/out-of-stock", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  const warehouseId = req.query.warehouseId as string | undefined;
  const items = await inventoryService.getOutOfStockItems(
    tenantSlug,
    warehouseId,
  );
  res.json(items);
});

router.get("/stock-counts", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  const warehouseId = req.query.warehouseId as string | undefined;
  const counts = await inventoryService.getStockCounts(tenantSlug, warehouseId);
  res.json(counts);
});

// ─── Stock Mutations ─────────────────────────────────────────────────────────

router.post(
  "/stock/reserve",
  validate(reserveStockSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload?.tenantSlug as string;
    const { variantId, warehouseId, qty, performedBy } = req.body;
    const result = await inventoryService.reserveStock(
      tenantSlug,
      variantId,
      warehouseId,
      qty,
      performedBy,
    );
    res.json(result);
  },
);

router.post(
  "/stock/release",
  validate(releaseReservationSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload?.tenantSlug as string;
    const { variantId, warehouseId, qty, performedBy } = req.body;
    const result = await inventoryService.releaseReservation(
      tenantSlug,
      variantId,
      warehouseId,
      qty,
      performedBy,
    );
    res.json(result);
  },
);

router.post(
  "/stock/commit-sale",
  validate(commitSaleSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload?.tenantSlug as string;
    const { variantId, warehouseId, qty, referenceId, performedBy } = req.body;
    const result = await inventoryService.commitSale(
      tenantSlug,
      variantId,
      warehouseId,
      qty,
      referenceId,
      performedBy,
    );
    res.json(result);
  },
);

router.post(
  "/stock/adjust",
  validate(adjustStockSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload?.tenantSlug as string;
    const { variantId, warehouseId, delta, notes, performedBy } = req.body;
    const result = await inventoryService.adjustStock(
      tenantSlug,
      variantId,
      warehouseId,
      delta,
      notes,
      performedBy,
    );
    res.json(result);
  },
);

router.post(
  "/stock/transfer",
  validate(transferStockSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload?.tenantSlug as string;
    const { variantId, fromWarehouseId, toWarehouseId, qty, performedBy } =
      req.body;
    const result = await inventoryService.transferStock(
      tenantSlug,
      variantId,
      fromWarehouseId,
      toWarehouseId,
      qty,
      performedBy,
    );
    res.json(result);
  },
);

// ─── Damage & Losses ─────────────────────────────────────────────────────────

router.get("/damages", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const variantId = req.query.variantId as string | undefined;
  const warehouseId = req.query.warehouseId as string | undefined;
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;

  const result = await inventoryService.listDamages(tenantSlug, {
    page,
    limit,
    variantId,
    warehouseId,
    from,
    to,
  });
  res.json(result);
});

router.get("/damages/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  const record = await inventoryService.getDamage(
    tenantSlug,
    req.params.id as string,
  );
  res.json(record);
});

router.post(
  "/stock/record-damage",
  validate(recordDamageSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload?.tenantSlug as string;
    const { variantId, warehouseId, qty, notes, performedBy } = req.body;
    const result = await inventoryService.recordDamage(
      tenantSlug,
      variantId,
      warehouseId,
      qty,
      notes,
      performedBy,
    );
    res.json(result);
  },
);

// ─── Movement History ────────────────────────────────────────────────────────

router.get("/movements/:variantId", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload?.tenantSlug as string;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const type = req.query.type as MovementType | undefined;
  const warehouseId = req.query.warehouseId as string | undefined;
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;

  const result = await inventoryService.listMovements(tenantSlug, {
    variantId: req.params.variantId as string,
    page,
    limit,
    type,
    warehouseId,
    from,
    to,
  });
  res.json(result);
});

export default router;
