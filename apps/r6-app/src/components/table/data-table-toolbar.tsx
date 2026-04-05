import type { Table } from "@tanstack/react-table";
import { Search, SlidersHorizontal } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	filterValue: string;
	onFilterChange: (value: string) => void;
	filterPlaceholder: string;
}

function DataTableToolbarInner<TData>({
	table,
	filterValue,
	onFilterChange,
	filterPlaceholder,
}: DataTableToolbarProps<TData>) {
	return (
		<div className="flex items-center gap-2">
			<div className="relative flex-1 max-w-sm">
				<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
				<Input
					placeholder={filterPlaceholder}
					value={filterValue}
					onChange={(e) => onFilterChange(e.target.value)}
					className="pl-8"
				/>
			</div>

			<div className="ml-auto">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="default">
							<SlidersHorizontal />
							Columns
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						<DropdownMenuLabel>Columns</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{table
							.getAllColumns()
							.filter((col) => col.getCanHide())
							.map((col) => (
								<DropdownMenuCheckboxItem
									key={col.id}
									checked={col.getIsVisible()}
									onCheckedChange={(value) => col.toggleVisibility(!!value)}
									className="capitalize"
								>
									{typeof col.columnDef.header === "string"
										? col.columnDef.header
										: col.id}
								</DropdownMenuCheckboxItem>
							))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

export const DataTableToolbar = memo(
	DataTableToolbarInner,
) as typeof DataTableToolbarInner;
