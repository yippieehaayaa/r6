import { getPermissionLabel } from "@r6/schemas";
import { KeyRoundIcon } from "lucide-react";
import { useGetAllPermissionsQuery } from "@/api/identity-and-access/me/queries/get-all-permissions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "./section-card";

export function PermissionsCard() {
	const { data: permissions = [], isLoading } = useGetAllPermissionsQuery();

	return (
		<SectionCard
			icon={<KeyRoundIcon className="size-4 text-white" />}
			title="My Permissions"
			description="Effective permissions granted to your account"
		>
			{isLoading ? (
				<div className="flex flex-wrap gap-1.5">
					{["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((id) => (
						<Skeleton key={id} className="h-5 w-28 rounded-md" />
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
							{getPermissionLabel(p.permission)}
						</Badge>
					))}
				</div>
			)}
		</SectionCard>
	);
}
