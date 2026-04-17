import type { Policy, Role } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useListPoliciesQuery } from "@/api/identity-and-access/policies";
import {
	useGetRoleWithPoliciesQuery,
	useSetPoliciesMutation,
} from "@/api/identity-and-access/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

interface Props {
	tenantId: string;
	role: Role;
	open: boolean;
	active: boolean;
}

export function PoliciesTabContent({ tenantId, role, open, active }: Props) {
	const queryClient = useQueryClient();
	const mutation = useSetPoliciesMutation();

	const [assignedPolicies, setAssignedPolicies] = useState<Map<string, Policy>>(
		new Map(),
	);
	const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	const { data: roleWithPolicies, isLoading: isLoadingCurrent } =
		useGetRoleWithPoliciesQuery(tenantId, role.id, {
			enabled: open && active,
		});

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Eagerly fetch all policies on open; filter client-side
	const { data: policiesData, isLoading: isLoadingPolicies } =
		useListPoliciesQuery(
			{ limit: 100 },
			{ staleTime: 30 * 1000, enabled: open && active },
		);

	// Initialise from current policies
	useEffect(() => {
		if (!roleWithPolicies) return;
		const map = new Map(roleWithPolicies.policies.map((p) => [p.id, p]));
		setAssignedPolicies(map);
		setInitialIds(new Set(map.keys()));
	}, [roleWithPolicies]);

	// Reset on close
	useEffect(() => {
		if (!open) {
			setSearchQuery("");
			setDebouncedQuery("");
			setAssignedPolicies(new Map());
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

	// Exclude already-assigned policies and filter by search query client-side
	const filteredSearchResults = useMemo(() => {
		const q = debouncedQuery.toLowerCase();
		return (policiesData?.data ?? []).filter(
			(p) =>
				!assignedPolicies.has(p.id) && (!q || p.name.toLowerCase().includes(q)),
		);
	}, [policiesData, assignedPolicies, debouncedQuery]);

	const hasChanged = useMemo(() => {
		const current = new Set(assignedPolicies.keys());
		if (current.size !== initialIds.size) return true;
		for (const id of current) {
			if (!initialIds.has(id)) return true;
		}
		return false;
	}, [assignedPolicies, initialIds]);

	const isEmpty = assignedPolicies.size === 0;

	function addPolicy(policy: Policy) {
		setAssignedPolicies((prev) => new Map([...prev, [policy.id, policy]]));
		setSearchQuery("");
	}

	function removePolicy(id: string) {
		setAssignedPolicies((prev) => {
			const next = new Map(prev);
			next.delete(id);
			return next;
		});
	}

	function handleSave() {
		if (isEmpty) return;
		mutation.mutate(
			{
				tenantId,
				id: role.id,
				body: { policyIds: [...assignedPolicies.keys()] },
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["roles", tenantId],
					});
					queryClient.invalidateQueries({
						queryKey: ["roles", tenantId, role.id],
					});
					toast.success("Policies updated.");
					setInitialIds(new Set(assignedPolicies.keys()));
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
						Assigned ({assignedPolicies.size})
					</span>
					{isLoadingCurrent ? (
						<div className="flex flex-wrap gap-1.5">
							{Array.from({ length: 4 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
								<Skeleton key={i} className="h-6 w-24 rounded-full" />
							))}
						</div>
					) : assignedPolicies.size === 0 ? (
						<p className="text-sm text-muted-foreground">
							No policies assigned. Search below to add.
						</p>
					) : (
						<div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
							{[...assignedPolicies.values()].map((policy) => (
								<span
									key={policy.id}
									className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-medium"
								>
									<Badge
										variant={
											policy.effect === "ALLOW" ? "default" : "destructive"
										}
										className="shrink-0 text-[10px] px-1 py-0 h-4"
									>
										{policy.effect}
									</Badge>
									{policy.name}
									<button
										type="button"
										onClick={() => removePolicy(policy.id)}
										className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
										aria-label={`Remove ${policy.name}`}
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
						Add policies
					</span>
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
						{isLoadingPolicies ? (
							Array.from({ length: 3 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
								<Skeleton key={i} className="h-12 w-full rounded-lg" />
							))
						) : filteredSearchResults.length === 0 ? (
							<p className="text-sm text-muted-foreground py-4 text-center">
								No policies found.
							</p>
						) : (
							filteredSearchResults.map((policy) => (
								<button
									key={policy.id}
									type="button"
									onClick={() => addPolicy(policy)}
									className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-left hover:bg-muted/50 transition-colors w-full"
								>
									<Badge
										variant={
											policy.effect === "ALLOW" ? "default" : "destructive"
										}
										className="shrink-0 text-[10px] px-1.5 py-0 mt-0.5"
									>
										{policy.effect}
									</Badge>
									<div className="flex flex-col gap-0.5 min-w-0">
										<span className="text-sm font-medium leading-tight">
											{policy.name}
										</span>
										{policy.description && (
											<span className="text-xs text-muted-foreground truncate w-full">
												{policy.description}
											</span>
										)}
									</div>
								</button>
							))
						)}
					</div>
				</div>
			</div>

			<div className="flex items-center justify-end gap-2 px-4 py-3 border-t mt-auto shrink-0">
				{isEmpty && hasChanged && (
					<p className="text-xs text-destructive mr-auto">
						At least 1 policy is required.
					</p>
				)}
				<Button
					onClick={handleSave}
					disabled={!hasChanged || isEmpty || mutation.isPending}
				>
					{mutation.isPending ? "Saving…" : "Save changes"}
				</Button>
			</div>
		</div>
	);
}
