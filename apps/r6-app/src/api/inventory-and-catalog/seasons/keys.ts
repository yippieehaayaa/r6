export const seasonsKeys = {
	all: ["seasons"] as const,
	list: (params: object) => [...seasonsKeys.all, "list", params] as const,
	detail: (id: string) => [...seasonsKeys.all, "detail", id] as const,
	bySlug: (slug: string) => [...seasonsKeys.all, "slug", slug] as const,
} as const;
