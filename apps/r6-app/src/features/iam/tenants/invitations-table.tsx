import type { InvitationSafe } from "@r6/schemas";
import type {
	ColumnDef,
	OnChangeFn,
	PaginationState,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";

interface InvitationsTableProps {
	data: InvitationSafe[];
	isLoading: boolean;
	rowCount?: number;
	paginationState?: PaginationState;
	onPaginationChange?: OnChangeFn<PaginationState>;
	globalFilterValue?: string;
	onGlobalFilterChange?: (value: string) => void;
}

export function InvitationsTable({
	data,
	isLoading,
	rowCount,
	paginationState,
	onPaginationChange,
	globalFilterValue,
	onGlobalFilterChange,
}: InvitationsTableProps) {
	const columns = useMemo<ColumnDef<InvitationSafe>[]>(
		() => [
			{
				accessorKey: "email",
				header: "Email",
				cell: ({ row }) => (
					<span className="font-medium text-[var(--text-primary)]">
						{row.original.email}
					</span>
				),
			},
			{
				id: "status",
				header: "Status",
				cell: ({ row }) => {
					const isAccepted = !!row.original.acceptedAt;
					const isExpired =
						!isAccepted && new Date(row.original.expiresAt) < new Date();
					if (isAccepted) return <Badge variant="default">Accepted</Badge>;
					if (isExpired) return <Badge variant="destructive">Expired</Badge>;
					return <Badge variant="outline">Pending</Badge>;
				},
			},
			{
				accessorKey: "expiresAt",
				header: "Expires",
				cell: ({ row }) => (
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(row.original.expiresAt), {
							addSuffix: true,
						})}
					</span>
				),
			},
			{
				accessorKey: "createdAt",
				header: "Sent",
				cell: ({ row }) => (
					<span className="text-xs text-muted-foreground">
						{formatDistanceToNow(new Date(row.original.createdAt), {
							addSuffix: true,
						})}
					</span>
				),
			},
		],
		[],
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
			filterPlaceholder="Search invitations…"
		/>
	);
}
