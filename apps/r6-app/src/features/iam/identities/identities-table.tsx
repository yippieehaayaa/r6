import type { IdentitySafe } from "@r6/schemas";
import type {
	ColumnDef,
	OnChangeFn,
	PaginationState,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
	ArchiveRestoreIcon,
	MoreHorizontalIcon,
	PencilIcon,
	ShieldIcon,
	Trash2Icon,
} from "lucide-react";
import { useMemo } from "react";
import { Can } from "@/components/can";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_VARIANTS: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	ACTIVE: "default",
	INACTIVE: "secondary",
	SUSPENDED: "destructive",
	PENDING_VERIFICATION: "outline",
};

const STATUS_LABELS: Record<string, string> = {
	ACTIVE: "Active",
	INACTIVE: "Inactive",
	SUSPENDED: "Suspended",
	PENDING_VERIFICATION: "Pending",
};

interface IdentitiesTableProps {
	data: IdentitySafe[];
	isLoading: boolean;
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;
	globalFilterValue?: string;
	onGlobalFilterChange?: (value: string) => void;
	onEdit: (row: IdentitySafe) => void;
	onDelete: (row: IdentitySafe) => void;
	onRestore: (row: IdentitySafe) => void;
	onManagePolicies: (row: IdentitySafe) => void;
}

export function IdentitiesTable({
	data,
	isLoading,
	rowCount,
	paginationState,
	onPaginationChange,
	globalFilterValue,
	onGlobalFilterChange,
	onEdit,
	onDelete,
	onRestore,
	onManagePolicies,
}: IdentitiesTableProps) {
	const columns = useMemo<ColumnDef<IdentitySafe>[]>(
		() => [
			{
				accessorKey: "username",
				header: "Username",
				cell: ({ row }) => (
					<span className="font-medium text-[var(--text-primary)]">
						{row.original.username}
					</span>
				),
			},
			{
				id: "name",
				header: "Name",
				cell: ({ row }) => {
					const { firstName, middleName, lastName } = row.original;
					const full = [firstName, middleName, lastName]
						.filter(Boolean)
						.join(" ");
					return <span className="text-sm">{full}</span>;
				},
			},
			{
				accessorKey: "email",
				header: "Email",
				cell: ({ row }) => (
					<span className="text-sm text-muted-foreground">
						{row.original.email}
					</span>
				),
			},
			{
				accessorKey: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge variant={STATUS_VARIANTS[row.original.status] ?? "outline"}>
						{STATUS_LABELS[row.original.status] ?? row.original.status}
					</Badge>
				),
			},
			{
				accessorKey: "kind",
				header: "Kind",
				cell: ({ row }) => (
					<Badge variant="outline" className="capitalize">
						{row.original.kind.toLowerCase()}
					</Badge>
				),
			},
			{
				accessorKey: "totpEnabled",
				header: "2FA",
				cell: ({ row }) =>
					row.original.totpEnabled ? (
						<Badge variant="default" className="gap-1">
							<ShieldIcon className="size-3" />
							On
						</Badge>
					) : (
						<span className="text-xs text-muted-foreground">Off</span>
					),
			},
			{
				accessorKey: "createdAt",
				header: "Created",
				cell: ({ row }) => (
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(row.original.createdAt), {
							addSuffix: true,
						})}
					</span>
				),
			},
			{
				id: "actions",
				enableSorting: false,
				enableHiding: false,
				cell: ({ row }) => {
					const isDeleted = !!row.original.deletedAt;
					return (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon-sm">
									<MoreHorizontalIcon className="size-4" />
									<span className="sr-only">Open menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-44">
								{!isDeleted && (
									<>
										<Can permission="iam:identity:update">
											<DropdownMenuItem onClick={() => onEdit(row.original)}>
												<PencilIcon className="mr-2 size-3.5" />
												Edit
											</DropdownMenuItem>
										</Can>
										<Can permission="iam:role:assign">
											<DropdownMenuItem
												onClick={() => onManagePolicies(row.original)}
											>
												<ShieldIcon className="mr-2 size-3.5" />
												Manage Policies
											</DropdownMenuItem>
										</Can>
										<Can permission="iam:identity:delete">
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => onDelete(row.original)}
												className="text-destructive focus:text-destructive"
											>
												<Trash2Icon className="mr-2 size-3.5" />
												Remove
											</DropdownMenuItem>
										</Can>
									</>
								)}
								{isDeleted && (
									<Can permission="iam:identity:restore">
										<DropdownMenuItem onClick={() => onRestore(row.original)}>
											<ArchiveRestoreIcon className="mr-2 size-3.5" />
											Restore
										</DropdownMenuItem>
									</Can>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					);
				},
			},
		],
		[onEdit, onDelete, onRestore, onManagePolicies],
	);

	return (
		<DataTable
			columns={columns}
			data={data}
			isLoading={isLoading}
			rowCount={rowCount}
			paginationState={paginationState}
			onPaginationChange={onPaginationChange}
			globalFilterValue={globalFilterValue}
			onGlobalFilterChange={onGlobalFilterChange}
			filterPlaceholder="Search identities…"
		/>
	);
}
