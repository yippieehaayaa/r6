import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { getBrandHandler, listBrandsHandler } from "./controller/brands";
import {
  getCategoryHandler,
  listCategoriesHandler,
} from "./controller/categories";
import { getProductHandler, listProductsHandler } from "./controller/products";
import { listUomsHandler } from "./controller/uoms";
import { getVariantHandler, listVariantsHandler } from "./controller/variants";

const router: Router = Router({ mergeParams: true });

router.get(
  "/products",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_READ),
  listProductsHandler,
);

router.get(
  "/products/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_READ),
  getProductHandler,
);

router.get(
  "/variants",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_READ),
  listVariantsHandler,
);

router.get(
  "/variants/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_READ),
  getVariantHandler,
);

router.get(
  "/categories",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_READ),
  listCategoriesHandler,
);

router.get(
  "/categories/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_READ),
  getCategoryHandler,
);

router.get(
  "/brands",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_READ),
  listBrandsHandler,
);

router.get(
  "/brands/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_READ),
  getBrandHandler,
);

router.get(
  "/uoms",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_READ),
  listUomsHandler,
);

export default router;
