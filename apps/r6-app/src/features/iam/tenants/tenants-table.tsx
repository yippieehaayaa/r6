import type { Tenant } from "@r6/schemas";
import { MoreHorizontal, Pencil, Trash2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Props {
	data: Tenant[];
	isLoading: boolean;
	onEdit: (tenant: Tenant) => void;
	onDelete: (tenant: Tenant) => void;
	onRestore: (tenant: Tenant) => void;
}

export function TenantsTable({ data, isLoading, onEdit, onDelete, onRestore }: Props) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Slug</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Modules</TableHead>
					<TableHead>Created</TableHead>
					<TableHead className="w-10" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{isLoading ? (
					<TableRow>
						<TableCell colSpan={6} className="text-center text-muted-foreground py-8">
							Loading…
						</TableCell>
					</TableRow>
				) : data.length === 0 ? (
					<TableRow>
						<TableCell colSpan={6} className="text-center text-muted-foreground py-8">
							No tenants found.
						</TableCell>
					</TableRow>
				) : (
					data.map((tenant) => (
						<TableRow key={tenant.id} data-deleted={!!tenant.deletedAt}>
							<TableCell className="font-medium">{tenant.name}</TableCell>
							<TableCell className="font-mono text-xs text-muted-foreground">
								{tenant.slug}
							</TableCell>
							<TableCell>
								<Badge variant={tenant.isActive ? "default" : "secondary"}>
									{tenant.isActive ? "Active" : "Inactive"}
								</Badge>
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-1">
									{tenant.moduleAccess.map((m) => (
										<Badge key={m} variant="outline">
											{m}
										</Badge>
									))}
								</div>
							</TableCell>
							<TableCell className="text-muted-foreground text-xs">
								{new Date(tenant.createdAt).toLocaleDateString()}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon-sm">
											<MoreHorizontal />
											<span className="sr-only">Open menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onSelect={() => onEdit(tenant)}>
											<Pencil />
											Edit
										</DropdownMenuItem>
										{tenant.deletedAt ? (
											<DropdownMenuItem onSelect={() => onRestore(tenant)}>
												<RotateCcw />
												Restore
											</DropdownMenuItem>
										) : (
											<DropdownMenuItem
												variant="destructive"
												onSelect={() => onDelete(tenant)}
											>
												<Trash2 />
												Delete
											</DropdownMenuItem>
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}
