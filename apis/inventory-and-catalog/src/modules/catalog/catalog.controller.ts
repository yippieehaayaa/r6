import { type Request, type Response, Router } from "express";
import { validate } from "../../shared/middleware";
import type { ProductStatus } from "../../utils/prisma";
import * as catalogService from "./catalog.service";
import {
  createBrandSchema,
  createCategorySchema,
  createProductSchema,
  createVariantSchema,
  updateBrandSchema,
  updateCategorySchema,
  updateProductSchema,
  updateVariantSchema,
} from "./catalog.validator";

const router = Router();

// ─── Categories ──────────────────────────────────────────────────────────────

router.get("/categories", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = req.query.search as string | undefined;
  const parentId = req.query.parentId as string | undefined;
  const isActive =
    req.query.isActive !== undefined
      ? req.query.isActive === "true"
      : undefined;

  const result = await catalogService.listCategories(tenantSlug, {
    page,
    limit,
    search,
    parentId,
    isActive,
  });
  res.json(result);
});

router.get("/categories/:id/tree", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const tree = await catalogService.getCategoryTree(
    tenantSlug,
    req.params.id as string,
  );
  res.json(tree);
});

router.get("/categories/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const category = await catalogService.getCategoryById(
    tenantSlug,
    req.params.id as string,
  );
  res.json(category);
});

router.post(
  "/categories",
  validate(createCategorySchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const category = await catalogService.createCategory(tenantSlug, req.body);
    res.status(201).json(category);
  },
);

router.patch(
  "/categories/:id",
  validate(updateCategorySchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const category = await catalogService.updateCategory(
      tenantSlug,
      req.params.id as string,
      req.body,
    );
    res.json(category);
  },
);

router.delete("/categories/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  await catalogService.deleteCategory(tenantSlug, req.params.id as string);
  res.sendStatus(204);
});

// ─── Brands ──────────────────────────────────────────────────────────────────

router.get("/brands", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = req.query.search as string | undefined;
  const isActive =
    req.query.isActive !== undefined
      ? req.query.isActive === "true"
      : undefined;

  const result = await catalogService.listBrands(tenantSlug, {
    page,
    limit,
    search,
    isActive,
  });
  res.json(result);
});

router.get("/brands/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const brand = await catalogService.getBrandById(
    tenantSlug,
    req.params.id as string,
  );
  res.json(brand);
});

router.post(
  "/brands",
  validate(createBrandSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const brand = await catalogService.createBrand(tenantSlug, req.body);
    res.status(201).json(brand);
  },
);

router.patch(
  "/brands/:id",
  validate(updateBrandSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const brand = await catalogService.updateBrand(
      tenantSlug,
      req.params.id as string,
      req.body,
    );
    res.json(brand);
  },
);

router.delete("/brands/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  await catalogService.deleteBrand(tenantSlug, req.params.id as string);
  res.sendStatus(204);
});

// ─── Products ────────────────────────────────────────────────────────────────

router.get("/products", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = req.query.search as string | undefined;
  const categoryId = req.query.categoryId as string | undefined;
  const brandId = req.query.brandId as string | undefined;
  const status = req.query.status as ProductStatus | undefined;
  const tags = req.query.tags
    ? (req.query.tags as string).split(",")
    : undefined;

  const result = await catalogService.listProducts(tenantSlug, {
    page,
    limit,
    search,
    categoryId,
    brandId,
    status,
    tags,
  });
  res.json(result);
});

router.get("/products/slug/:slug", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const product = await catalogService.getProductBySlug(
    tenantSlug,
    req.params.slug as string,
  );
  res.json(product);
});

router.get("/products/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const product = await catalogService.getProductById(
    tenantSlug,
    req.params.id as string,
  );
  res.json(product);
});

router.post(
  "/products",
  validate(createProductSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const product = await catalogService.createProduct(tenantSlug, req.body);
    res.status(201).json(product);
  },
);

router.patch(
  "/products/:id",
  validate(updateProductSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const product = await catalogService.updateProduct(
      tenantSlug,
      req.params.id as string,
      req.body,
    );
    res.json(product);
  },
);

router.post("/products/:id/publish", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const product = await catalogService.publishProduct(
    tenantSlug,
    req.params.id as string,
  );
  res.json(product);
});

router.post(
  "/products/:id/discontinue",
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const product = await catalogService.discontinueProduct(
      tenantSlug,
      req.params.id as string,
    );
    res.json(product);
  },
);

router.post("/products/:id/archive", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const product = await catalogService.archiveProduct(
    tenantSlug,
    req.params.id as string,
  );
  res.json(product);
});

router.delete("/products/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  await catalogService.deleteProduct(tenantSlug, req.params.id as string);
  res.sendStatus(204);
});

// ─── Product Variants ────────────────────────────────────────────────────────

router.get(
  "/products/:productId/variants",
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const search = req.query.search as string | undefined;
    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;

    const result = await catalogService.listVariantsByProduct(tenantSlug, {
      productId: req.params.productId as string,
      page,
      limit,
      search,
      isActive,
    });
    res.json(result);
  },
);

router.get("/variants/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const variant = await catalogService.getVariantById(
    tenantSlug,
    req.params.id as string,
  );
  res.json(variant);
});

router.post(
  "/products/:productId/variants",
  validate(createVariantSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const variant = await catalogService.createVariant(tenantSlug, {
      ...req.body,
      productId: req.params.productId as string,
    });
    res.status(201).json(variant);
  },
);

router.patch(
  "/variants/:id",
  validate(updateVariantSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const variant = await catalogService.updateVariant(
      tenantSlug,
      req.params.id as string,
      req.body,
    );
    res.json(variant);
  },
);

router.delete("/variants/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  await catalogService.deleteVariant(tenantSlug, req.params.id as string);
  res.sendStatus(204);
});

export default router;
