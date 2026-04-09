export const inventoryKeys = {
	all: ["inventory"] as const,
	stock: {
		all: () => [...inventoryKeys.all, "stock"] as const,
		forVariant: (variantId: string, warehouseId: string) =>
			[
				...inventoryKeys.stock.all(),
				"variant",
				variantId,
				warehouseId,
			] as const,
		forProduct: (productId: string) =>
			[...inventoryKeys.stock.all(), "product", productId] as const,
		lowStock: (warehouseId?: string) =>
			[...inventoryKeys.stock.all(), "low-stock", warehouseId] as const,
	},
	warehouses: {
		all: () => [...inventoryKeys.all, "warehouses"] as const,
		list: (params: object) =>
			[...inventoryKeys.warehouses.all(), "list", params] as const,
		detail: (id: string) =>
			[...inventoryKeys.warehouses.all(), "detail", id] as const,
	},
	movements: {
		all: () => [...inventoryKeys.all, "movements"] as const,
		list: (variantId: string, params: object) =>
			[...inventoryKeys.movements.all(), "list", variantId, params] as const,
	},
	damages: {
		all: () => [...inventoryKeys.all, "damages"] as const,
		list: (params: object) =>
			[...inventoryKeys.damages.all(), "list", params] as const,
		detail: (id: string) =>
			[...inventoryKeys.damages.all(), "detail", id] as const,
	},
} as const;
