import type { Policy } from "@r6/schemas";
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
	data: Policy[];
	isLoading: boolean;
	onEdit: (policy: Policy) => void;
	onDelete: (policy: Policy) => void;
	onRestore: (policy: Policy) => void;
}

export function PoliciesTable({
	data,
	isLoading,
	onEdit,
	onDelete,
	onRestore,
}: Props) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Effect</TableHead>
					<TableHead>Permissions</TableHead>
					<TableHead>Audience</TableHead>
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
							No policies found.
						</TableCell>
					</TableRow>
				) : (
					data.map((policy) => (
						<TableRow key={policy.id} data-deleted={!!policy.deletedAt}>
							<TableCell className="font-medium">{policy.name}</TableCell>
							<TableCell>
								<Badge
									variant={policy.effect === "ALLOW" ? "default" : "destructive"}
								>
									{policy.effect}
								</Badge>
							</TableCell>
							<TableCell className="text-muted-foreground text-xs">
								{policy.permissions.length} permission
								{policy.permissions.length !== 1 ? "s" : ""}
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-1">
									{policy.audience.map((a) => (
										<Badge key={a} variant="outline">
											{a}
										</Badge>
									))}
								</div>
							</TableCell>
							<TableCell className="text-muted-foreground text-xs">
								{new Date(policy.createdAt).toLocaleDateString()}
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
										<DropdownMenuItem onSelect={() => onEdit(policy)}>
											<Pencil />
											Edit
										</DropdownMenuItem>
										{policy.deletedAt ? (
											<DropdownMenuItem onSelect={() => onRestore(policy)}>
												<RotateCcw />
												Restore
											</DropdownMenuItem>
										) : (
											<DropdownMenuItem
												variant="destructive"
												onSelect={() => onDelete(policy)}
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
