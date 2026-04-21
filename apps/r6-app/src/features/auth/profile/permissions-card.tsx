import { KeyRoundIcon } from "lucide-react";
import { useListPermissionsQuery } from "@/api/identity-and-access/me/queries/list-permissions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "./section-card";

export function PermissionsCard() {
	const { data, isLoading } = useListPermissionsQuery({ page: 1, limit: 100 });
	const permissions = data?.data ?? [];

	return (
		<SectionCard
			icon={<KeyRoundIcon className="size-4 text-white" />}
			title="My Permissions"
			description="Effective permissions granted to your account"
		>
			{isLoading ? (
				<div className="flex flex-wrap gap-1.5">
					{Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton items
						<Skeleton key={i} className="h-5 w-28 rounded-md" />
					))}
				</div>
			) : permissions.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					No permissions assigned to your account.
				</p>
			) : (
				<div className="flex flex-wrap gap-1.5">
					{permissions.map((p: { id: string; permission: string }) => (
						<Badge
							key={p.id}
							variant="outline"
							className="h-5 px-2 font-mono text-[10px]"
						>
							{p.permission}
						</Badge>
					))}
				</div>
			)}
		</SectionCard>
	);
}
