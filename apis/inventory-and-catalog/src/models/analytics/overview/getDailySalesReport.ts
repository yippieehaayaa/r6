import { toMajorUnits } from "../../../utils/currency";
import { prisma } from "../../../utils/prisma";

export type DailySalesSummary = {
  totalRevenue: number;
  totalUnitsSold: number;
  totalTransactions: number;
  averageTransactionValue: number;
};

export type DailySalesByBrand = {
  brandId: string;
  brandName: string;
  unitsSold: number;
  revenue: number;
};

export type DailySalesByProduct = {
  productId: string;
  productName: string;
  sku: string;
  unitsSold: number;
  revenue: number;
};

export type DailySalesByCategory = {
  categoryId: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
};

export type DailySalesByWarehouse = {
  warehouseId: string;
  warehouseName: string;
  unitsSold: number;
  revenue: number;
};

export type DailySalesTopVariant = {
  variantId: string;
  variantSku: string;
  productName: string;
  unitsSold: number;
  revenue: number;
};

export type DailySalesReport = {
  date: string;
  summary: DailySalesSummary;
  byBrand: DailySalesByBrand[];
  byProduct: DailySalesByProduct[];
  byCategory: DailySalesByCategory[];
  byWarehouse: DailySalesByWarehouse[];
  topVariants: DailySalesTopVariant[];
};

const getDailySalesReport = async (date: Date): Promise<DailySalesReport> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const movements = await prisma.stockMovement.findMany({
    where: {
      type: "SALE",
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    select: {
      quantity: true,
      referenceId: true,
      variant: {
        select: {
          id: true,
          sku: true,
          name: true,
          price: true,
          product: {
            select: {
              id: true,
              sku: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              brand: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      warehouse: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  let totalUnitsSold = 0;
  let totalRevenueMinor = 0;

  const transactionIds = new Set<string>();

  const revenueByBrand = new Map<
    string,
    { name: string; unitsSold: number; revenueMinor: number }
  >();
  const revenueByProduct = new Map<
    string,
    { name: string; sku: string; unitsSold: number; revenueMinor: number }
  >();
  const revenueByCategory = new Map<
    string,
    { name: string; unitsSold: number; revenueMinor: number }
  >();
  const revenueByWarehouse = new Map<
    string,
    { name: string; unitsSold: number; revenueMinor: number }
  >();
  const revenueByVariant = new Map<
    string,
    { sku: string; productName: string; unitsSold: number; revenueMinor: number }
  >();

  for (const movement of movements) {
    const units = Math.abs(movement.quantity);
    if (units === 0) continue;

    const lineRevenueMinor = units * movement.variant.price;

    totalUnitsSold += units;
    totalRevenueMinor += lineRevenueMinor;

    if (movement.referenceId) {
      transactionIds.add(movement.referenceId);
    }

    const product = movement.variant.product;
    const category = product.category;
    const brand = product.brand;
    const warehouse = movement.warehouse;

    if (brand) {
      const existingBrand = revenueByBrand.get(brand.id) ?? {
        name: brand.name,
        unitsSold: 0,
        revenueMinor: 0,
      };
      existingBrand.unitsSold += units;
      existingBrand.revenueMinor += lineRevenueMinor;
      revenueByBrand.set(brand.id, existingBrand);
    }

    const existingProduct = revenueByProduct.get(product.id) ?? {
      name: product.name,
      sku: product.sku,
      unitsSold: 0,
      revenueMinor: 0,
    };
    existingProduct.unitsSold += units;
    existingProduct.revenueMinor += lineRevenueMinor;
    revenueByProduct.set(product.id, existingProduct);

    const existingCategory = revenueByCategory.get(category.id) ?? {
      name: category.name,
      unitsSold: 0,
      revenueMinor: 0,
    };
    existingCategory.unitsSold += units;
    existingCategory.revenueMinor += lineRevenueMinor;
    revenueByCategory.set(category.id, existingCategory);

    const existingWarehouse = revenueByWarehouse.get(warehouse.id) ?? {
      name: warehouse.name,
      unitsSold: 0,
      revenueMinor: 0,
    };
    existingWarehouse.unitsSold += units;
    existingWarehouse.revenueMinor += lineRevenueMinor;
    revenueByWarehouse.set(warehouse.id, existingWarehouse);

    const existingVariant = revenueByVariant.get(movement.variant.id) ?? {
      sku: movement.variant.sku,
      productName: product.name,
      unitsSold: 0,
      revenueMinor: 0,
    };
    existingVariant.unitsSold += units;
    existingVariant.revenueMinor += lineRevenueMinor;
    revenueByVariant.set(movement.variant.id, existingVariant);
  }

  const totalRevenue = toMajorUnits(totalRevenueMinor);
  const totalTransactions = transactionIds.size;
  const averageTransactionValue =
    totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const byBrand: DailySalesByBrand[] = Array.from(
    revenueByBrand.entries(),
  ).map(([brandId, value]) => ({
    brandId,
    brandName: value.name,
    unitsSold: value.unitsSold,
    revenue: toMajorUnits(value.revenueMinor),
  }));

  const byProduct: DailySalesByProduct[] = Array.from(
    revenueByProduct.entries(),
  ).map(([productId, value]) => ({
    productId,
    productName: value.name,
    sku: value.sku,
    unitsSold: value.unitsSold,
    revenue: toMajorUnits(value.revenueMinor),
  }));

  const byCategory: DailySalesByCategory[] = Array.from(
    revenueByCategory.entries(),
  ).map(([categoryId, value]) => ({
    categoryId,
    categoryName: value.name,
    unitsSold: value.unitsSold,
    revenue: toMajorUnits(value.revenueMinor),
  }));

  const byWarehouse: DailySalesByWarehouse[] = Array.from(
    revenueByWarehouse.entries(),
  ).map(([warehouseId, value]) => ({
    warehouseId,
    warehouseName: value.name,
    unitsSold: value.unitsSold,
    revenue: toMajorUnits(value.revenueMinor),
  }));

  const topVariants: DailySalesTopVariant[] = Array.from(
    revenueByVariant.entries(),
  )
    .map(([variantId, value]) => ({
      variantId,
      variantSku: value.sku,
      productName: value.productName,
      unitsSold: value.unitsSold,
      revenue: toMajorUnits(value.revenueMinor),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  byBrand.sort((a, b) => b.revenue - a.revenue);
  byProduct.sort((a, b) => b.revenue - a.revenue);
  byCategory.sort((a, b) => b.revenue - a.revenue);
  byWarehouse.sort((a, b) => b.revenue - a.revenue);

  return {
    date: startOfDay.toISOString().slice(0, 10),
    summary: {
      totalRevenue,
      totalUnitsSold,
      totalTransactions,
      averageTransactionValue,
    },
    byBrand,
    byProduct,
    byCategory,
    byWarehouse,
    topVariants,
  };
};

export default getDailySalesReport;

