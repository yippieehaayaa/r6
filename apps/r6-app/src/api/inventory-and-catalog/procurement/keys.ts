export const procurementKeys = {
	all: ["procurement"] as const,
	suppliers: {
		all: () => [...procurementKeys.all, "suppliers"] as const,
		list: (params: object) =>
			[...procurementKeys.suppliers.all(), "list", params] as const,
		detail: (id: string) =>
			[...procurementKeys.suppliers.all(), "detail", id] as const,
	},
	orders: {
		all: () => [...procurementKeys.all, "orders"] as const,
		list: (params: object) =>
			[...procurementKeys.orders.all(), "list", params] as const,
		detail: (id: string) =>
			[...procurementKeys.orders.all(), "detail", id] as const,
	},
} as const;
