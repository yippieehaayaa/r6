import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
	pageSizeOptions: number[];
	totalRows: number;
	rangeStart: number;
	rangeEnd: number;
}

function DataTablePaginationInner<TData>({
	table,
	pageSizeOptions,
	totalRows,
	rangeStart,
	rangeEnd,
}: DataTablePaginationProps<TData>) {
	const { pageSize } = table.getState().pagination;

	return (
		<div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
			<div className="flex items-center gap-2">
				<span className="shrink-0">Rows per page</span>
				<Select
					value={String(pageSize)}
					onValueChange={(val) =>
						table.setPagination({ pageIndex: 0, pageSize: Number(val) })
					}
				>
					<SelectTrigger size="sm" className="w-16">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{pageSizeOptions.map((size) => (
							<SelectItem key={size} value={String(size)}>
								{size}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<span className="shrink-0">
				{totalRows === 0
					? "0 results"
					: `${rangeStart}–${rangeEnd} of ${totalRows}`}
			</span>

			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon-sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					aria-label="Previous page"
				>
					<ChevronLeft />
				</Button>
				<Button
					variant="outline"
					size="icon-sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					aria-label="Next page"
				>
					<ChevronRight />
				</Button>
			</div>
		</div>
	);
}

export const DataTablePagination = memo(
	DataTablePaginationInner,
) as typeof DataTablePaginationInner;
