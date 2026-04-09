export const catalogKeys = {
	all: ["catalog"] as const,
	products: {
		all: () => [...catalogKeys.all, "products"] as const,
		list: (params: object) =>
			[...catalogKeys.products.all(), "list", params] as const,
		detail: (id: string) =>
			[...catalogKeys.products.all(), "detail", id] as const,
		bySlug: (slug: string) =>
			[...catalogKeys.products.all(), "slug", slug] as const,
	},
	brands: {
		all: () => [...catalogKeys.all, "brands"] as const,
		list: (params: object) =>
			[...catalogKeys.brands.all(), "list", params] as const,
		detail: (id: string) =>
			[...catalogKeys.brands.all(), "detail", id] as const,
	},
	categories: {
		all: () => [...catalogKeys.all, "categories"] as const,
		list: (params: object) =>
			[...catalogKeys.categories.all(), "list", params] as const,
		detail: (id: string) =>
			[...catalogKeys.categories.all(), "detail", id] as const,
		tree: (id: string) =>
			[...catalogKeys.categories.all(), "tree", id] as const,
	},
	variants: {
		all: () => [...catalogKeys.all, "variants"] as const,
		list: (productId: string, params: object) =>
			[...catalogKeys.variants.all(), "list", productId, params] as const,
		detail: (id: string) =>
			[...catalogKeys.variants.all(), "detail", id] as const,
	},
} as const;
