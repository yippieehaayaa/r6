import type { Role } from "@r6/schemas";
import { MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react";
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
	data: Role[];
	isLoading: boolean;
	onEdit: (role: Role) => void;
	onDelete: (role: Role) => void;
	onRestore: (role: Role) => void;
	canUpdate: boolean;
	canDelete: boolean;
	canRestore: boolean;
}

export function RolesTable({
	data,
	isLoading,
	onEdit,
	onDelete,
	onRestore,
	canUpdate,
	canDelete,
	canRestore,
}: Props) {
	return (
		<Table className="animate-apple-enter">
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Created</TableHead>
					<TableHead className="w-10" />
				</TableRow>
			</TableHeader>
			<TableBody
				key={isLoading ? "loading" : "data"}
				className={
					!isLoading && data.length > 0 ? "animate-stagger-children" : undefined
				}
			>
				{isLoading ? (
					<TableRow>
						<TableCell
							colSpan={5}
							className="text-center text-muted-foreground py-8"
						>
							Loading…
						</TableCell>
					</TableRow>
				) : data.length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={5}
							className="text-center text-muted-foreground py-8"
						>
							No roles found.
						</TableCell>
					</TableRow>
				) : (
					data.map((role) => (
						<TableRow key={role.id} data-deleted={!!role.deletedAt}>
							<TableCell className="font-medium">{role.name}</TableCell>
							<TableCell className="text-muted-foreground">
								{role.description ?? "—"}
							</TableCell>
							<TableCell>
								<Badge variant={role.isActive ? "default" : "secondary"}>
									{role.isActive ? "Active" : "Inactive"}
								</Badge>
							</TableCell>
							<TableCell className="text-muted-foreground text-xs">
								{new Date(role.createdAt).toLocaleDateString()}
							</TableCell>
							<TableCell>
								{(canUpdate || canDelete || canRestore) && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon-sm">
												<MoreHorizontal />
												<span className="sr-only">Open menu</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											{canUpdate && (
												<DropdownMenuItem onSelect={() => onEdit(role)}>
													<Pencil />
													Edit
												</DropdownMenuItem>
											)}
											{canDelete && !role.deletedAt && (
												<DropdownMenuItem
													variant="destructive"
													onSelect={() => onDelete(role)}
												>
													<Trash2 />
													Delete
												</DropdownMenuItem>
											)}
											{canRestore && role.deletedAt && (
												<DropdownMenuItem onSelect={() => onRestore(role)}>
													<RotateCcw />
													Restore
												</DropdownMenuItem>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}
