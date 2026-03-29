import type { IdentitySafe } from "@r6/schemas";
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
	isAdmin: boolean;
}

export function IdentitiesTable({
	data,
	isLoading,
	onEdit,
	onDelete,
	onRestore,
	isAdmin,
}: Props) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Username</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Kind</TableHead>
					<TableHead>Status</TableHead>
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
							No identities found.
						</TableCell>
					</TableRow>
				) : (
					data.map((identity) => (
						<TableRow key={identity.id} data-deleted={!!identity.deletedAt}>
							<TableCell className="font-medium">{identity.username}</TableCell>
							<TableCell className="text-muted-foreground">
								{identity.email ?? "—"}
							</TableCell>
							<TableCell>
								<Badge variant={kindVariant[identity.kind] ?? "outline"}>
									{identity.kind}
								</Badge>
							</TableCell>
							<TableCell>
								<Badge variant={statusVariant[identity.status] ?? "outline"}>
									{identity.status.replace("_", " ")}
								</Badge>
							</TableCell>
							<TableCell className="text-muted-foreground text-xs">
								{new Date(identity.createdAt).toLocaleDateString()}
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
										<DropdownMenuItem onSelect={() => onEdit(identity)}>
											<Pencil />
											Edit
										</DropdownMenuItem>
										{identity.deletedAt ? (
											isAdmin && (
												<DropdownMenuItem onSelect={() => onRestore(identity)}>
													<RotateCcw />
													Restore
												</DropdownMenuItem>
											)
										) : (
											<DropdownMenuItem
												variant="destructive"
												onSelect={() => onDelete(identity)}
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
