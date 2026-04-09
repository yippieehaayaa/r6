import {
	type CreateSeason,
	CreateSeasonSchema,
	type Season,
	SeasonSchema,
	type UpdateSeason,
	UpdateSeasonSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function createSeasonFn(body: CreateSeason): Promise<Season> {
	const { data } = await inventoryApi.post<unknown>(
		"/seasons",
		CreateSeasonSchema.parse(body),
	);
	return SeasonSchema.parse(data);
}

export async function updateSeasonFn(
	id: string,
	body: UpdateSeason,
): Promise<Season> {
	const { data } = await inventoryApi.patch<unknown>(
		`/seasons/${id}`,
		UpdateSeasonSchema.parse(body),
	);
	return SeasonSchema.parse(data);
}

export async function deleteSeasonFn(id: string): Promise<void> {
	await inventoryApi.delete(`/seasons/${id}`);
}

export function useCreateSeasonMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createSeasonFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["seasons"] }),
	});
}

export function useUpdateSeasonMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, body }: { id: string; body: UpdateSeason }) =>
			updateSeasonFn(id, body),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["seasons"] }),
	});
}

export function useDeleteSeasonMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteSeasonFn,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["seasons"] }),
	});
}
