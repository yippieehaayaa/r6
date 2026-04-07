import { useGetIdentityWithRolesQuery } from "@/api/identities";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantSlug: string;
	identityId: string | null;
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
				{label}
			</span>
			<div className="text-sm">{children}</div>
		</div>
	);
}

export function IdentityDetailSheet({
	open,
	onOpenChange,
	tenantSlug,
	identityId,
}: Props) {
	const { data: identity, isLoading } = useGetIdentityWithRolesQuery(
		tenantSlug,
		identityId ?? "",
		{ enabled: open && !!identityId },
	);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>
						{isLoading ? (
							<Skeleton className="h-5 w-32" />
						) : (
							(identity?.username ?? "Identity")
						)}
					</SheetTitle>
				</SheetHeader>

				{isLoading ? (
					<div className="flex flex-col gap-4 p-4">
						{Array.from({ length: 5 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				) : identity ? (
					<div className="flex flex-col gap-6 p-4">
						<div className="flex flex-col gap-4">
							<Field label="Username">{identity.username}</Field>
							<Field label="Email">
								{identity.email ?? (
									<span className="text-muted-foreground">—</span>
								)}
							</Field>
							<Field label="Kind">
								<Badge variant="outline">{identity.kind}</Badge>
							</Field>
							<Field label="Status">
								<Badge
									variant={
										identity.status === "ACTIVE" ? "default" : "secondary"
									}
								>
									{identity.status}
								</Badge>
							</Field>
							<Field label="Created">
								{new Date(identity.createdAt).toLocaleDateString(undefined, {
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</Field>
						</div>

						<Separator />

						<div className="flex flex-col gap-3">
							<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
								Assigned Roles
							</span>
							{identity.roles.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									No roles assigned.
								</p>
							) : (
								<div className="flex flex-wrap gap-2">
									{identity.roles.map((role) => (
										<Badge key={role.id} variant="secondary">
											{role.name}
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>
				) : (
					<p className="p-4 text-sm text-muted-foreground">
						Identity not found.
					</p>
				)}
			</SheetContent>
		</Sheet>
	);
}
