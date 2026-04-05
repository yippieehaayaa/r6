import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";

const paginationRowModel = getPaginationRowModel();
const sortedRowModel = getSortedRowModel();
const filteredRowModel = getFilteredRowModel();
const coreRowModel = getCoreRowModel();

import { DataTableBody } from "./data-table-body";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading?: boolean;

	// Pagination config
	defaultPageSize?: number;
	pageSizeOptions?: number[];

	// Server-side pagination — provide all three together
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;

	// Server-side sorting
	sortingState?: SortingState;
	onSortingChange?: OnChangeFn<SortingState>;

	// Server-side filtering
	globalFilterValue?: string;
	onGlobalFilterChange?: (value: string) => void;
	filterPlaceholder?: string;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isLoading = false,
	defaultPageSize = 20,
	pageSizeOptions = [10, 20, 50, 100],
	rowCount,
	paginationState,
	onPaginationChange,
	sortingState,
	onSortingChange,
	globalFilterValue,
	onGlobalFilterChange,
	filterPlaceholder = "Search…",
}: DataTableProps<TData, TValue>) {
	const isManualPagination = !!onPaginationChange;
	const isManualSorting = !!onSortingChange;
	const isManualFiltering = !!onGlobalFilterChange;

	const [internalSorting, setInternalSorting] = useState<SortingState>([]);
	const [internalFilter, setInternalFilter] = useState("");
	const [internalPagination, setInternalPagination] = useState<PaginationState>(
		{
			pageIndex: 0,
			pageSize: defaultPageSize,
		},
	);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

	const activeSorting = isManualSorting
		? (sortingState ?? [])
		: internalSorting;
	const activeFilter = isManualFiltering
		? (globalFilterValue ?? "")
		: internalFilter;
	const activePagination = isManualPagination
		? (paginationState ?? internalPagination)
		: internalPagination;

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting: activeSorting,
			globalFilter: activeFilter,
			pagination: activePagination,
			columnVisibility,
		},
		// Pagination
		manualPagination: isManualPagination,
		rowCount: isManualPagination ? rowCount : undefined,
		onPaginationChange: isManualPagination
			? onPaginationChange
			: setInternalPagination,
		getPaginationRowModel: paginationRowModel,
		// Sorting
		manualSorting: isManualSorting,
		onSortingChange: isManualSorting ? onSortingChange : setInternalSorting,
		getSortedRowModel: sortedRowModel,
		// Filtering
		manualFiltering: isManualFiltering,
		onGlobalFilterChange: isManualFiltering
			? onGlobalFilterChange
			: setInternalFilter,
		getFilteredRowModel: filteredRowModel,
		// Core
		getCoreRowModel: coreRowModel,
		onColumnVisibilityChange: setColumnVisibility,
	});

	const { pageIndex, pageSize } = table.getState().pagination;
	const totalRows = isManualPagination
		? (rowCount ?? 0)
		: table.getFilteredRowModel().rows.length;
	const rangeStart = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
	const rangeEnd = Math.min(pageIndex * pageSize + pageSize, totalRows);

	return (
		<div className="flex flex-col gap-4 animate-apple-enter">
			<DataTableToolbar
				table={table}
				filterValue={activeFilter}
				onFilterChange={(v) =>
					isManualFiltering && onGlobalFilterChange
						? onGlobalFilterChange(v)
						: setInternalFilter(v)
				}
				filterPlaceholder={filterPlaceholder}
			/>
			<DataTableBody
				table={table}
				isLoading={isLoading}
				pageIndex={pageIndex}
			/>
			<DataTablePagination
				table={table}
				pageSizeOptions={pageSizeOptions}
				totalRows={totalRows}
				rangeStart={rangeStart}
				rangeEnd={rangeEnd}
			/>
		</div>
	);
}
