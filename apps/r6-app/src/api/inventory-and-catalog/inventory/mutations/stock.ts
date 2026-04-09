import { type InventoryItem, InventoryItemSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";
import { inventoryKeys } from "../keys";

export interface ReserveStockParams {
	variantId: string;
	warehouseId: string;
	qty: number;
	performedBy: string;
}

export interface ReleaseReservationParams {
	variantId: string;
	warehouseId: string;
	qty: number;
	performedBy: string;
}

export interface CommitSaleParams {
	variantId: string;
	warehouseId: string;
	qty: number;
	referenceId: string;
	performedBy: string;
}

export interface AdjustStockParams {
	variantId: string;
	warehouseId: string;
	delta: number;
	notes?: string;
	performedBy: string;
}

export interface TransferStockParams {
	variantId: string;
	fromWarehouseId: string;
	toWarehouseId: string;
	qty: number;
	performedBy: string;
}

export interface RecordDamageParams {
	variantId: string;
	warehouseId: string;
	qty: number;
	notes?: string;
	performedBy: string;
}

export async function reserveStockFn(
	params: ReserveStockParams,
): Promise<InventoryItem> {
	const { data } = await inventoryApi.post<unknown>(
		"/inventory/stock/reserve",
		params,
	);
	return InventoryItemSchema.parse(data);
}

export async function releaseReservationFn(
	params: ReleaseReservationParams,
): Promise<InventoryItem> {
	const { data } = await inventoryApi.post<unknown>(
		"/inventory/stock/release",
		params,
	);
	return InventoryItemSchema.parse(data);
}

export async function commitSaleFn(
	params: CommitSaleParams,
): Promise<InventoryItem> {
	const { data } = await inventoryApi.post<unknown>(
		"/inventory/stock/commit-sale",
		params,
	);
	return InventoryItemSchema.parse(data);
}

export async function adjustStockFn(
	params: AdjustStockParams,
): Promise<InventoryItem> {
	const { data } = await inventoryApi.post<unknown>(
		"/inventory/stock/adjust",
		params,
	);
	return InventoryItemSchema.parse(data);
}

export async function transferStockFn(
	params: TransferStockParams,
): Promise<InventoryItem> {
	const { data } = await inventoryApi.post<unknown>(
		"/inventory/stock/transfer",
		params,
	);
	return InventoryItemSchema.parse(data);
}

export async function recordDamageFn(
	params: RecordDamageParams,
): Promise<InventoryItem> {
	const { data } = await inventoryApi.post<unknown>(
		"/inventory/stock/record-damage",
		params,
	);
	return InventoryItemSchema.parse(data);
}

export function useReserveStockMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: reserveStockFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: inventoryKeys.stock.all() }),
	});
}

export function useReleaseReservationMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: releaseReservationFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: inventoryKeys.stock.all() }),
	});
}

export function useCommitSaleMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: commitSaleFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: inventoryKeys.stock.all() }),
	});
}

export function useAdjustStockMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: adjustStockFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: inventoryKeys.stock.all() }),
	});
}

export function useTransferStockMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: transferStockFn,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: inventoryKeys.stock.all() }),
	});
}

export function useRecordDamageMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: recordDamageFn,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: inventoryKeys.stock.all() });
			qc.invalidateQueries({ queryKey: inventoryKeys.damages.all() });
		},
	});
}
