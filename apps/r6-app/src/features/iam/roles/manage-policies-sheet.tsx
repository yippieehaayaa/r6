import type { Role } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useListPoliciesQuery } from "@/api/policies";
import { useGetRoleWithPoliciesQuery, useSetPoliciesMutation } from "@/api/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantSlug: string;
	role: Role | null;
}

export function ManagePoliciesSheet({
	open,
	onOpenChange,
	tenantSlug,
	role,
}: Props) {
	const queryClient = useQueryClient();
	const mutation = useSetPoliciesMutation();

	const [search, setSearch] = useState("");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [initialIds, setInitialIds] = useState<Set<string>>(new Set());

	const { data: roleWithPolicies, isLoading: isLoadingCurrent } =
		useGetRoleWithPoliciesQuery(tenantSlug, role?.id ?? "", {
			enabled: open && !!role,
		});

	const { data: allPolicies, isLoading: isLoadingPolicies } =
		useListPoliciesQuery(
			{ limit: 200 },
			{ staleTime: 10 * 60 * 1000 },
		);

	// Initialise selection once current policies load
	useEffect(() => {
		if (!roleWithPolicies) return;
		const ids = new Set(roleWithPolicies.policies.map((p) => p.id));
		setSelectedIds(ids);
		setInitialIds(ids);
	}, [roleWithPolicies]);

	// Reset on close
	useEffect(() => {
		if (!open) {
			setSearch("");
			setSelectedIds(new Set());
			setInitialIds(new Set());
		}
	}, [open]);

	const isLoading = isLoadingCurrent || isLoadingPolicies;

	const filteredPolicies = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return allPolicies?.data ?? [];
		return (allPolicies?.data ?? []).filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.description?.toLowerCase().includes(q),
		);
	}, [allPolicies, search]);

	const hasChanged = useMemo(() => {
		if (selectedIds.size !== initialIds.size) return true;
		for (const id of selectedIds) {
			if (!initialIds.has(id)) return true;
		}
		return false;
	}, [selectedIds, initialIds]);

	const isEmpty = selectedIds.size === 0;

	function togglePolicy(id: string) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function handleSubmit() {
		if (!role || isEmpty) return;
		mutation.mutate(
			{ tenantSlug, id: role.id, body: { policyIds: [...selectedIds] } },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["roles", tenantSlug],
					});
					queryClient.invalidateQueries({
						queryKey: ["roles", tenantSlug, role.id],
					});
					toast.success("Policies updated.");
					onOpenChange(false);
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md flex flex-col overflow-hidden animate-stagger-children">
				<SheetHeader>
					<SheetTitle>Manage Policies</SheetTitle>
					<p className="text-sm text-muted-foreground">
						Saving replaces all assigned policies atomically.
					</p>
				</SheetHeader>

				<div className="flex flex-col gap-3 px-4 flex-1 overflow-hidden">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
						<Input
							placeholder="Search policies…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
						/>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
							{selectedIds.size} selected
						</span>
						<span className="text-xs text-muted-foreground">
							{filteredPolicies.length} polic
							{filteredPolicies.length !== 1 ? "ies" : "y"}
						</span>
					</div>

					{isEmpty && hasChanged && (
						<p className="text-xs text-destructive -mt-1">
							At least 1 policy is required.
						</p>
					)}

					<Separator />

					<div className="flex flex-col gap-1 overflow-y-auto flex-1 -mx-1 px-1">
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
								<Skeleton key={i} className="h-16 w-full rounded-lg" />
							))
						) : filteredPolicies.length === 0 ? (
							<p className="text-sm text-muted-foreground py-6 text-center">
								{search
									? "No policies match your search."
									: "No policies available."}
							</p>
						) : (
							filteredPolicies.map((policy) => {
								const checked = selectedIds.has(policy.id);
								return (
									<label
										key={policy.id}
										className="flex items-start gap-3 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
									>
										<input
											type="checkbox"
											className="mt-0.5 size-4 rounded border-input accent-primary shrink-0"
											checked={checked}
											onChange={() => togglePolicy(policy.id)}
										/>
										<div className="flex flex-col gap-1 min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium leading-tight truncate">
													{policy.name}
												</span>
												<Badge
													variant={
														policy.effect === "ALLOW"
															? "default"
															: "destructive"
													}
													className="shrink-0 text-[10px] px-1.5 py-0"
												>
													{policy.effect}
												</Badge>
											</div>
											{policy.description && (
												<span className="text-xs text-muted-foreground truncate">
													{policy.description}
												</span>
											)}
										</div>
									</label>
								);
							})
						)}
					</div>
				</div>

				<SheetFooter className="px-4">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={mutation.isPending}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!hasChanged || isEmpty || mutation.isPending}
					>
						{mutation.isPending ? "Saving…" : "Save changes"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
