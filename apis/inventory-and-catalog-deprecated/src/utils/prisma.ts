import { PrismaClient } from "../../generated/client";

export * from "../../generated/client";

const SOFT_DELETABLE_MODELS: ReadonlySet<string> = new Set([
  "Category",
  "Brand",
  "Product",
  "ProductVariant",
  "Warehouse",
  "Supplier",
  "PurchaseOrder",
  "Season",
]);

// biome-ignore lint/suspicious/noExplicitAny: Prisma args types are highly generic unions; narrowing is impractical here
function injectSoftDeleteFilter<T extends { where?: any }>(args: T): T {
  if (args.where?.deletedAt !== undefined) return args;
  return { ...args, where: { ...args.where, deletedAt: { isSet: false } } };
}

const basePrisma = new PrismaClient();

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async findUnique({ model, args, query }) {
        return query(
          SOFT_DELETABLE_MODELS.has(model)
            ? injectSoftDeleteFilter(args)
            : args,
        );
      },
      async findFirst({ model, args, query }) {
        return query(
          SOFT_DELETABLE_MODELS.has(model)
            ? injectSoftDeleteFilter(args)
            : args,
        );
      },
      async findMany({ model, args, query }) {
        return query(
          SOFT_DELETABLE_MODELS.has(model)
            ? injectSoftDeleteFilter(args)
            : args,
        );
      },
      async count({ model, args, query }) {
        return query(
          SOFT_DELETABLE_MODELS.has(model)
            ? injectSoftDeleteFilter(args)
            : args,
        );
      },
      async aggregate({ model, args, query }) {
        return query(
          SOFT_DELETABLE_MODELS.has(model)
            ? injectSoftDeleteFilter(args)
            : args,
        );
      },
      async groupBy({ model, args, query }) {
        return query(
          SOFT_DELETABLE_MODELS.has(model)
            ? injectSoftDeleteFilter(args)
            : args,
        );
      },
    },
  },
});

export type TransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export { prisma };
