import { type Request, type Response, Router } from "express";
import { validate } from "../../shared/middleware";
import type { PurchaseOrderStatus } from "../../utils/prisma";
import * as procurementService from "./procurement.service";
import {
  addItemToOrderSchema,
  createPurchaseOrderSchema,
  createSupplierSchema,
  receiveItemsSchema,
  updateOrderItemSchema,
  updatePurchaseOrderSchema,
  updateSupplierSchema,
} from "./procurement.validator";

const router = Router();

// ─── Suppliers ───────────────────────────────────────────────────────────────

router.get("/suppliers", async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = req.query.search as string | undefined;
  const isActive =
    req.query.isActive !== undefined
      ? req.query.isActive === "true"
      : undefined;

  const result = await procurementService.listSuppliers({
    page,
    limit,
    search,
    isActive,
  });
  res.json(result);
});

router.get("/suppliers/:id", async (req: Request, res: Response) => {
  const supplier = await procurementService.getSupplierById(
    req.params.id as string,
  );
  res.json(supplier);
});

router.post(
  "/suppliers",
  validate(createSupplierSchema),
  async (req: Request, res: Response) => {
    const supplier = await procurementService.createSupplier(req.body);
    res.status(201).json(supplier);
  },
);

router.patch(
  "/suppliers/:id",
  validate(updateSupplierSchema),
  async (req: Request, res: Response) => {
    const supplier = await procurementService.updateSupplier(
      req.params.id as string,
      req.body,
    );
    res.json(supplier);
  },
);

router.delete("/suppliers/:id", async (req: Request, res: Response) => {
  await procurementService.deleteSupplier(req.params.id as string);
  res.sendStatus(204);
});

// ─── Purchase Orders ─────────────────────────────────────────────────────────

router.get("/orders", async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const supplierId = req.query.supplierId as string | undefined;
  const warehouseId = req.query.warehouseId as string | undefined;
  const status = req.query.status as PurchaseOrderStatus | undefined;
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;

  const result = await procurementService.listPurchaseOrders({
    page,
    limit,
    supplierId,
    warehouseId,
    status,
    from,
    to,
  });
  res.json(result);
});

router.get("/orders/:id", async (req: Request, res: Response) => {
  const order = await procurementService.getPurchaseOrderById(
    req.params.id as string,
  );
  res.json(order);
});

router.post(
  "/orders",
  validate(createPurchaseOrderSchema),
  async (req: Request, res: Response) => {
    const order = await procurementService.createPurchaseOrder(req.body);
    res.status(201).json(order);
  },
);

router.patch(
  "/orders/:id",
  validate(updatePurchaseOrderSchema),
  async (req: Request, res: Response) => {
    const order = await procurementService.updatePurchaseOrder(
      req.params.id as string,
      req.body,
    );
    res.json(order);
  },
);

router.delete("/orders/:id", async (req: Request, res: Response) => {
  await procurementService.deletePurchaseOrder(req.params.id as string);
  res.sendStatus(204);
});

// ─── Purchase Order Lifecycle ────────────────────────────────────────────────

router.post("/orders/:id/send", async (req: Request, res: Response) => {
  const order = await procurementService.sendPurchaseOrder(
    req.params.id as string,
  );
  res.json(order);
});

router.post("/orders/:id/confirm", async (req: Request, res: Response) => {
  const order = await procurementService.confirmPurchaseOrder(
    req.params.id as string,
  );
  res.json(order);
});

router.post("/orders/:id/cancel", async (req: Request, res: Response) => {
  const order = await procurementService.cancelPurchaseOrder(
    req.params.id as string,
  );
  res.json(order);
});

router.post(
  "/orders/:id/receive",
  validate(receiveItemsSchema),
  async (req: Request, res: Response) => {
    const { receipts, performedBy } = req.body;
    const result = await procurementService.receivePurchaseOrder(
      req.params.id as string,
      receipts,
      performedBy,
    );
    res.json(result);
  },
);

// ─── Purchase Order Items ────────────────────────────────────────────────────

router.post(
  "/orders/:id/items",
  validate(addItemToOrderSchema),
  async (req: Request, res: Response) => {
    const item = await procurementService.addItemToOrder(
      req.params.id as string,
      req.body,
    );
    res.status(201).json(item);
  },
);

router.patch(
  "/orders/:id/items/:variantId",
  validate(updateOrderItemSchema),
  async (req: Request, res: Response) => {
    const item = await procurementService.updateOrderItem(
      req.params.id as string,
      req.params.variantId as string,
      req.body,
    );
    res.json(item);
  },
);

router.delete(
  "/orders/:id/items/:variantId",
  async (req: Request, res: Response) => {
    await procurementService.removeItemFromOrder(
      req.params.id as string,
      req.params.variantId as string,
    );
    res.sendStatus(204);
  },
);

export default router;
