import { getPermissionLabel } from "@r6/schemas";
import { useGetAllPermissionsQuery } from "@/api/identity-and-access/me/queries/get-all-permissions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function PermissionsCard() {
	const { data: permissions = [], isLoading } = useGetAllPermissionsQuery();

	return (
		<>
			{isLoading ? (
				<div className="flex flex-wrap gap-2">
					{["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((id) => (
						<Skeleton key={id} className="h-6 w-28 rounded-lg" />
					))}
				</div>
			) : permissions.length === 0 ? (
				<div className="flex items-center gap-3 rounded-xl bg-(--bg) px-4 py-3">
					<p className="text-sm text-(--text-secondary)">
						No permissions assigned to your account.
					</p>
				</div>
			) : (
				<div className="rounded-xl bg-(--bg) p-3">
					<div className="flex flex-wrap gap-1.5">
						{permissions.map((p: { id: string; permission: string }) => (
							<Badge
								key={p.id}
								variant="outline"
								className="h-6 px-2 font-mono text-[10px] bg-surface"
							>
								{getPermissionLabel(p.permission)}
							</Badge>
						))}
					</div>
				</div>
			)}
		</>
	);
}
