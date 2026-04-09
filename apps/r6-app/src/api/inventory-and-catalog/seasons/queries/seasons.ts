import {
	PaginatedResponseSchema,
	type Season,
	SeasonSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { seasonsKeys } from "../keys";

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
		queryKey: seasonsKeys.list(params),
		queryFn: () => listSeasonsFn(params),
		staleTime: 1000 * 60 * 2,
		gcTime: 1000 * 60 * 10,
		placeholderData: keepPreviousData,
		...options,
	});
}

export function useGetSeasonQuery(id: string) {
	return useQuery({
		queryKey: seasonsKeys.detail(id),
		queryFn: () => getSeasonFn(id),
		enabled: !!id,
		staleTime: 1000 * 60 * 5,
	});
}

export function useGetSeasonBySlugQuery(slug: string) {
	return useQuery({
		queryKey: seasonsKeys.bySlug(slug),
		queryFn: () => getSeasonBySlugFn(slug),
		enabled: !!slug,
		staleTime: 1000 * 60 * 5,
	});
}
