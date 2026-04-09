import {
	PaginatedResponseSchema,
	type Season,
	SeasonSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ListSeasonsParams {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
	year?: number;
}

const ListSeasonsResponseSchema = PaginatedResponseSchema(SeasonSchema);

export async function listSeasonsFn(
	params: ListSeasonsParams = {},
): Promise<{ data: Season[]; page: number; limit: number; total: number }> {
	const { data } = await inventoryApi.get<unknown>("/seasons", { params });
	return ListSeasonsResponseSchema.parse(data);
}

export async function getSeasonFn(id: string): Promise<Season> {
	const { data } = await inventoryApi.get<unknown>(`/seasons/${id}`);
	return SeasonSchema.parse(data);
}

export async function getSeasonBySlugFn(slug: string): Promise<Season> {
	const { data } = await inventoryApi.get<unknown>(`/seasons/slug/${slug}`);
	return SeasonSchema.parse(data);
}

export function useListSeasonsQuery(
	params: ListSeasonsParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["seasons", params],
		queryFn: () => listSeasonsFn(params),
		...options,
	});
}

export function useGetSeasonQuery(id: string) {
	return useQuery({
		queryKey: ["seasons", id],
		queryFn: () => getSeasonFn(id),
		enabled: !!id,
	});
}

export function useGetSeasonBySlugQuery(slug: string) {
	return useQuery({
		queryKey: ["seasons", "slug", slug],
		queryFn: () => getSeasonBySlugFn(slug),
		enabled: !!slug,
	});
}
