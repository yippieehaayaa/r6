import type { IdentitySafe, Policy } from "@r6/schemas";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAssignIdentityPolicyMutation } from "@/api/identity-and-access/identities";
import { useListPoliciesQuery } from "@/api/identity-and-access/policies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

interface Props {
	tenantId: string;
	identity: IdentitySafe;
	open: boolean;
	active: boolean;
}

export function PoliciesTabContent({ tenantId, identity, open, active }: Props) {
	const mutation = useAssignIdentityPolicyMutation();
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const { data: policiesData, isLoading } = useListPoliciesQuery(
		tenantId,
		{ limit: 100 },
		{ staleTime: 30 * 1000, enabled: open && active },
	);

	// Reset search on close or tab switch
	useEffect(() => {
		if (!open || !active) {
			setSearchQuery("");
			setDebouncedQuery("");
		}
	}, [open, active]);

	const filteredPolicies = useMemo(() => {
		const q = debouncedQuery.toLowerCase();
		return (policiesData?.data ?? []).filter(
			(p) =>
				!q ||
				p.name.toLowerCase().includes(q) ||
				(p.description ?? "").toLowerCase().includes(q),
		);
	}, [policiesData, debouncedQuery]);

	function handleAssign(policy: Policy) {
		mutation.mutate(
			{ tenantId, id: identity.id, policyId: policy.id },
			{
				onSuccess: () => toast.success(`"${policy.name}" assigned.`),
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<div className="flex flex-col flex-1 overflow-hidden">
			<div className="flex flex-col gap-3 px-4 flex-1 overflow-hidden pt-2">
				<p className="text-xs text-muted-foreground">
					Assigning a policy stamps its permissions directly onto this identity.
				</p>

				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Search policies…"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>

				<div className="flex flex-col gap-1 overflow-y-auto flex-1 -mx-1 px-1">
					{isLoading ? (
						Array.from({ length: 3 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
							<Skeleton key={i} className="h-14 w-full rounded-lg" />
						))
					) : filteredPolicies.length === 0 ? (
						<p className="text-sm text-muted-foreground py-4 text-center">
							No policies found.
						</p>
					) : (
						filteredPolicies.map((policy) => (
							<div
								key={policy.id}
								className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
							>
								<div className="flex flex-col gap-0.5 min-w-0">
									<div className="flex items-center gap-1.5">
										<span className="text-sm font-medium leading-tight truncate">
											{policy.name}
										</span>
										{policy.isManaged && (
											<Badge
												variant="secondary"
												className="shrink-0 text-[10px] px-1 py-0 h-4"
											>
												Platform
											</Badge>
										)}
									</div>
									{policy.description && (
										<span className="text-xs text-muted-foreground truncate">
											{policy.description}
										</span>
									)}
									<span className="text-xs text-muted-foreground">
										{policy.permissions.length} permission
										{policy.permissions.length !== 1 ? "s" : ""}
									</span>
								</div>
								<Button
									size="sm"
									variant="outline"
									onClick={() => handleAssign(policy)}
									disabled={mutation.isPending}
									className="shrink-0"
								>
									Assign
								</Button>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}


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
