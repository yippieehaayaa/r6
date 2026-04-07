import { flexRender, type Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	Table as TableRoot,
	TableRow,
} from "@/components/ui/table";

interface DataTableBodyProps<TData> {
	table: Table<TData>;
	isLoading: boolean;
	pageIndex: number;
	onRowClick?: (row: TData) => void;
}

export function DataTableBody<TData>({
	table,
	isLoading,
	pageIndex,
	onRowClick,
}: DataTableBodyProps<TData>) {
	const rows = table.getRowModel().rows;
	const colCount = table.getVisibleLeafColumns().length;

	return (
		<div className="overflow-hidden rounded-md border">
			<TableRoot>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder ? null : header.column.getCanSort() ? (
										<Button
											variant="ghost"
											size="sm"
											className="-ml-2.5 h-7 data-[state=sorted]:text-foreground"
											data-state={
												header.column.getIsSorted() ? "sorted" : undefined
											}
											onClick={header.column.getToggleSortingHandler()}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
											{header.column.getIsSorted() === "asc" ? (
												<ArrowUp className="ml-1 size-3.5 text-muted-foreground" />
											) : header.column.getIsSorted() === "desc" ? (
												<ArrowDown className="ml-1 size-3.5 text-muted-foreground" />
											) : (
												<ArrowUpDown className="ml-1 size-3.5 text-muted-foreground opacity-40" />
											)}
										</Button>
									) : (
										flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)
									)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody
					key={isLoading ? "loading" : `page-${pageIndex}`}
					className={
						!isLoading && rows.length > 0
							? "animate-stagger-children"
							: undefined
					}
				>
					{isLoading ? (
						<TableRow>
							<TableCell
								colSpan={colCount}
								className="h-24 text-center text-muted-foreground"
							>
								Loading…
							</TableCell>
						</TableRow>
					) : rows.length > 0 ? (
						rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
								className={onRowClick ? "cursor-pointer" : undefined}
								onClick={() => onRowClick?.(row.original)}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={colCount}
								className="h-24 text-center text-muted-foreground"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</TableRoot>
		</div>
	);
}
