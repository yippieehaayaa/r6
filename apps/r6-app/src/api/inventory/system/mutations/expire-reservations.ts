import { useMutation } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function expireReservationsFn(): Promise<unknown> {
	const { data } = await inventoryApi.post<unknown>(
		"/system/expire-reservations",
	);
	return data;
}

export function useExpireReservationsMutation() {
	return useMutation({
		mutationFn: expireReservationsFn,
	});
}
