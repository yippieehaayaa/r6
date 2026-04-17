import type { IdentitySafe, Role } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useGetIdentityWithRolesQuery,
	useSetRolesMutation,
} from "@/api/identity-and-access/identities";
import { useListRolesQuery } from "@/api/identity-and-access/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

interface Props {
	tenantId: string;
	identity: IdentitySafe;
	open: boolean;
	active: boolean;
}

export function RolesTabContent({ tenantId, identity, open, active }: Props) {
	const queryClient = useQueryClient();
	const mutation = useSetRolesMutation();

	const [assignedRoles, setAssignedRoles] = useState<Map<string, Role>>(
		new Map(),
	);
	const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	const { data: identityWithRoles, isLoading: isLoadingCurrent } =
		useGetIdentityWithRolesQuery(tenantId, identity.id, {
			enabled: open && active,
		});

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Eagerly fetch all roles on open; filter client-side
	const { data: rolesData, isLoading: isLoadingRoles } = useListRolesQuery(
		tenantId,
		{ limit: 100 },
		{ staleTime: 30 * 1000, enabled: open && active },
	);

	// Initialise from current roles
	useEffect(() => {
		if (!identityWithRoles) return;
		const map = new Map(identityWithRoles.roles.map((r) => [r.id, r]));
		setAssignedRoles(map);
		setInitialIds(new Set(map.keys()));
	}, [identityWithRoles]);

	// Reset on close
	useEffect(() => {
		if (!open) {
			setSearchQuery("");
			setDebouncedQuery("");
			setAssignedRoles(new Map());
			setInitialIds(new Set());
		}
	}, [open]);

	// Reset search when tab is hidden
	useEffect(() => {
		if (!active) {
			setSearchQuery("");
			setDebouncedQuery("");
		}
	}, [active]);

	// Exclude already-assigned roles and filter by search query client-side
	const filteredSearchResults = useMemo(() => {
		const q = debouncedQuery.toLowerCase();
		return (rolesData?.data ?? []).filter(
			(r) =>
				!assignedRoles.has(r.id) && (!q || r.name.toLowerCase().includes(q)),
		);
	}, [rolesData, assignedRoles, debouncedQuery]);

	const hasChanged = useMemo(() => {
		const current = new Set(assignedRoles.keys());
		if (current.size !== initialIds.size) return true;
		for (const id of current) {
			if (!initialIds.has(id)) return true;
		}
		return false;
	}, [assignedRoles, initialIds]);

	function addRole(role: Role) {
		setAssignedRoles((prev) => new Map([...prev, [role.id, role]]));
		setSearchQuery("");
	}

	function removeRole(id: string) {
		setAssignedRoles((prev) => {
			const next = new Map(prev);
			next.delete(id);
			return next;
		});
	}

	function handleSave() {
		mutation.mutate(
			{ tenantId, id: identity.id, roleIds: [...assignedRoles.keys()] },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["identities", tenantId],
					});
					queryClient.invalidateQueries({
						queryKey: ["identities", tenantId, identity.id],
					});
					toast.success("Roles updated.");
					setInitialIds(new Set(assignedRoles.keys()));
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<div className="flex flex-col flex-1 overflow-hidden">
			<div className="flex flex-col gap-4 px-4 flex-1 overflow-hidden pt-2">
				{/* Assigned chips */}
				<div className="flex flex-col gap-2">
					<span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
						Assigned ({assignedRoles.size})
					</span>
					{isLoadingCurrent ? (
						<div className="flex flex-wrap gap-1.5">
							{Array.from({ length: 4 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
								<Skeleton key={i} className="h-6 w-20 rounded-full" />
							))}
						</div>
					) : assignedRoles.size === 0 ? (
						<p className="text-sm text-muted-foreground">
							No roles assigned. Search below to add.
						</p>
					) : (
						<div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
							{[...assignedRoles.values()].map((role) => (
								<span
									key={role.id}
									className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-medium"
								>
									{role.name}
									<button
										type="button"
										onClick={() => removeRole(role.id)}
										className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
										aria-label={`Remove ${role.name}`}
									>
										<X className="size-3" />
									</button>
								</span>
							))}
						</div>
					)}
				</div>

				<Separator />

				{/* Search to add */}
				<div className="flex flex-col gap-2 flex-1 overflow-hidden">
					<span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
						Add roles
					</span>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
						<Input
							placeholder="Search roles…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
					<div className="flex flex-col gap-1 overflow-y-auto flex-1 -mx-1 px-1">
						{isLoadingRoles ? (
							Array.from({ length: 3 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
								<Skeleton key={i} className="h-12 w-full rounded-lg" />
							))
						) : filteredSearchResults.length === 0 ? (
							<p className="text-sm text-muted-foreground py-4 text-center">
								No roles found.
							</p>
						) : (
							filteredSearchResults.map((role) => (
								<button
									key={role.id}
									type="button"
									onClick={() => addRole(role)}
									className="flex flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left hover:bg-muted/50 transition-colors w-full"
								>
									<span className="text-sm font-medium leading-tight">
										{role.name}
									</span>
									{role.description && (
										<span className="text-xs text-muted-foreground truncate w-full">
											{role.description}
										</span>
									)}
								</button>
							))
						)}
					</div>
				</div>
			</div>

			<div className="flex justify-end px-4 py-3 border-t mt-auto shrink-0">
				<Button
					onClick={handleSave}
					disabled={!hasChanged || mutation.isPending}
				>
					{mutation.isPending ? "Saving…" : "Save changes"}
				</Button>
			</div>
		</div>
	);
}
