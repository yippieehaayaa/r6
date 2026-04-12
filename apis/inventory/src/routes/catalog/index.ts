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
import {
  deleteBrandHandler,
  updateBrandHandler,
} from "./controller/update-brand";
import {
  deleteCategoryHandler,
  updateCategoryHandler,
} from "./controller/update-category";
import {
  deleteProductHandler,
  updateProductHandler,
} from "./controller/update-product";
import {
  deleteVariantHandler,
  updateVariantHandler,
} from "./controller/update-variant";
import { getVariantHandler, listVariantsHandler } from "./controller/variants";

const router: Router = Router({ mergeParams: true });

// ── Products ────────────────────────────────────────────────

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

router.patch(
  "/products/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_UPDATE),
  updateProductHandler,
);

router.delete(
  "/products/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_UPDATE),
  deleteProductHandler,
);

// ── Variants ────────────────────────────────────────────────

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

router.patch(
  "/variants/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_UPDATE),
  updateVariantHandler,
);

router.delete(
  "/variants/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_UPDATE),
  deleteVariantHandler,
);

// ── Categories ──────────────────────────────────────────────

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

router.patch(
  "/categories/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_UPDATE),
  updateCategoryHandler,
);

router.delete(
  "/categories/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_UPDATE),
  deleteCategoryHandler,
);

// ── Brands ──────────────────────────────────────────────────

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

router.patch(
  "/brands/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_UPDATE),
  updateBrandHandler,
);

router.delete(
  "/brands/:id",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_UPDATE),
  deleteBrandHandler,
);

// ── UOMs ────────────────────────────────────────────────────

router.get(
  "/uoms",
  requirePermission(INVENTORY_PERMISSIONS.CATALOG_READ),
  listUomsHandler,
);

export default router;
