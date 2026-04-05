import type { IdentitySafe } from "@r6/schemas";
import type {
	ColumnDef,
	OnChangeFn,
	PaginationState,
} from "@tanstack/react-table";
import { MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const kindVariant: Record<string, "default" | "secondary" | "outline"> = {
	USER: "default",
	SERVICE: "secondary",
	ADMIN: "outline",
};

const statusVariant: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	ACTIVE: "default",
	INACTIVE: "secondary",
	SUSPENDED: "destructive",
	PENDING_VERIFICATION: "outline",
};

interface Props {
	data: IdentitySafe[];
	isLoading: boolean;
	onEdit: (identity: IdentitySafe) => void;
	onDelete: (identity: IdentitySafe) => void;
	onRestore: (identity: IdentitySafe) => void;
	canUpdate: boolean;
	canDelete: boolean;
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;
}

export function IdentitiesTable({
	data,
	isLoading,
	onEdit,
	onDelete,
	onRestore,
	canUpdate,
	canDelete,
	rowCount,
	paginationState,
	onPaginationChange,
}: Props) {
	const columns = useMemo<ColumnDef<IdentitySafe>[]>(
		() => [
			{
				accessorKey: "username",
				header: "Username",
				cell: ({ row }) => (
					<span className="font-medium">{row.original.username}</span>
				),
			},
			{
				accessorKey: "email",
				header: "Email",
				cell: ({ row }) => (
					<span className="text-muted-foreground">
						{row.original.email ?? "—"}
					</span>
				),
			},
			{
				accessorKey: "kind",
				header: "Kind",
				cell: ({ row }) => (
					<Badge variant={kindVariant[row.original.kind] ?? "outline"}>
						{row.original.kind}
					</Badge>
				),
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge variant={statusVariant[row.original.status] ?? "outline"}>
						{row.original.status.replace("_", " ")}
					</Badge>
				),
			},
			{
				accessorKey: "createdAt",
				header: "Created",
				cell: ({ row }) => (
					<span className="text-muted-foreground text-xs">
						{new Date(row.original.createdAt).toLocaleDateString()}
					</span>
				),
			},
			{
				id: "actions",
				header: "",
				enableHiding: false,
				enableSorting: false,
				cell: ({ row }) => {
					const identity = row.original;
					if (!canUpdate && !canDelete) return null;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon-sm">
									<MoreHorizontal />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{canUpdate && (
									<DropdownMenuItem onSelect={() => onEdit(identity)}>
										<Pencil />
										Edit
									</DropdownMenuItem>
								)}
								{canDelete &&
									(identity.deletedAt ? (
										<DropdownMenuItem onSelect={() => onRestore(identity)}>
											<RotateCcw />
											Restore
										</DropdownMenuItem>
									) : (
										<DropdownMenuItem
											variant="destructive"
											onSelect={() => onDelete(identity)}
										>
											<Trash2 />
											Delete
										</DropdownMenuItem>
									))}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[canUpdate, canDelete, onEdit, onDelete, onRestore],
	);

	return (
		<DataTable
			columns={columns}
			data={data}
			isLoading={isLoading}
			rowCount={rowCount}
			paginationState={paginationState}
			onPaginationChange={onPaginationChange}
			filterPlaceholder="Search identities…"
		/>
	);
}
