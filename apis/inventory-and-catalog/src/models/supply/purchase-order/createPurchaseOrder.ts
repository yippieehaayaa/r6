import { toMinorUnits } from "../../../utils/currency";
import {
  ProductVariantNotFoundError,
  PurchaseOrderNumberExistsError,
  SupplierNotFoundError,
  WarehouseNotFoundError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type CreatePurchaseOrderItem = {
  variantId: string;
  quantityOrdered: number;
  unitCost: number;
};

export type CreatePurchaseOrderInput = {
  orderNumber: string;
  supplierId: string;
  warehouseId: string;
  expectedAt?: Date;
  notes?: string;
  items: CreatePurchaseOrderItem[];
};

const createPurchaseOrder = async (input: CreatePurchaseOrderInput) => {
  const [supplier, warehouse] = await Promise.all([
    prisma.supplier.findUnique({
      where: { id: input.supplierId, deletedAt: { isSet: false } },
    }),
    prisma.warehouse.findUnique({
      where: { id: input.warehouseId, deletedAt: { isSet: false } },
    }),
  ]);

  if (!supplier) throw new SupplierNotFoundError();
  if (!warehouse) throw new WarehouseNotFoundError();

  const variantIds = input.items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, deletedAt: { isSet: false } },
    select: { id: true },
  });

  if (variants.length !== variantIds.length) {
    throw new ProductVariantNotFoundError();
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          orderNumber: input.orderNumber,
          supplierId: input.supplierId,
          warehouseId: input.warehouseId,
          expectedAt: input.expectedAt,
          notes: input.notes,
        },
      });

      await Promise.all(
        input.items.map((item) =>
          tx.purchaseOrderItem.create({
            data: {
              purchaseOrderId: po.id,
              variantId: item.variantId,
              quantityOrdered: item.quantityOrdered,
              unitCost: toMinorUnits(item.unitCost),
            },
          }),
        ),
      );

      return tx.purchaseOrder.findUnique({
        where: { id: po.id },
        include: { items: true },
      });
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new PurchaseOrderNumberExistsError();
    }
    throw error;
  }
};

export default createPurchaseOrder;
