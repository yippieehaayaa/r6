import type { IdentityListItem, Policy } from "@r6/schemas";
import { CheckIcon, Loader2Icon, ShieldIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSetPoliciesMutation } from "@/api/identity-and-access/tenants/identities/mutations/set-policies";
import { useGetAllIdentityPermissionsQuery } from "@/api/identity-and-access/tenants/identities/queries/list-permissions";
import { useListPoliciesQuery } from "@/api/identity-and-access/tenants/policies/queries/list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

interface ManagePoliciesSheetProps {
	tenantId: string;
	identity: IdentityListItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ManagePoliciesSheet({
	tenantId,
	identity,
	open,
	onOpenChange,
}: ManagePoliciesSheetProps) {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isSaving, setIsSaving] = useState(false);

	const policiesQuery = useListPoliciesQuery(tenantId, {
		page: 1,
		limit: 100,
	});

	const permissionsQuery = useGetAllIdentityPermissionsQuery(
		tenantId,
		identity?.id,
	);

	const setPoliciesMutation = useSetPoliciesMutation();

	// Pre-select policies whose entire permission set is covered by the identity's
	// current permissions. Runs whenever the identity or the fetched data changes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: identity?.id is an intentional trigger
	useEffect(() => {
		if (!permissionsQuery.data || !policiesQuery.data) {
			setSelectedIds(new Set());
			return;
		}

		const granted = new Set(permissionsQuery.data.map((p) => p.permission));

		const preselected = policiesQuery.data.data
			.filter(
				(policy: Policy) =>
					policy.permissions.length > 0 &&
					policy.permissions.every((p) => granted.has(p)),
			)
			.map((policy: Policy) => policy.id);

		setSelectedIds(new Set(preselected));
	}, [identity?.id, permissionsQuery.data, policiesQuery.data]);

	function togglePolicy(policyId: string) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(policyId)) {
				next.delete(policyId);
			} else {
				next.add(policyId);
			}
			return next;
		});
	}

	async function handleSave() {
		if (!identity) return;
		setIsSaving(true);
		try {
			await setPoliciesMutation.mutateAsync({
				tenantId,
				id: identity.id,
				policyIds: [...selectedIds],
			});
			toast.success("Policies updated successfully");
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setIsSaving(false);
		}
	}

	const policies = policiesQuery.data?.data ?? [];

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Manage Policies</SheetTitle>
					<SheetDescription>
						Select policies to assign to{" "}
						<span className="font-medium">{identity?.email}</span>. This
						replaces all current assignments.
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-col gap-2 px-4 py-4">
					{policiesQuery.isLoading ? (
						Array.from({ length: 4 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton items
							<Skeleton key={i} className="h-16 w-full rounded-xl" />
						))
					) : policies.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-8 text-center">
							<ShieldIcon className="size-8 text-muted-foreground/50" />
							<p className="text-sm text-muted-foreground">
								No policies available for this tenant.
							</p>
						</div>
					) : (
						policies.map((policy: Policy) => {
							const isSelected = selectedIds.has(policy.id);
							return (
								<button
									key={policy.id}
									type="button"
									onClick={() => togglePolicy(policy.id)}
									className={[
										"flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all",
										isSelected
											? "border-[var(--accent)]/30 bg-[var(--accent)]/5 ring-1 ring-[var(--accent)]/20"
											: "border-border hover:border-foreground/20 hover:bg-muted/50",
									].join(" ")}
								>
									<div
										className={[
											"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
											isSelected
												? "border-[var(--accent)] bg-[var(--accent)]"
												: "border-muted-foreground/30",
										].join(" ")}
									>
										{isSelected && <CheckIcon className="size-3 text-white" />}
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium text-[var(--text-primary)]">
											{policy.displayName ?? policy.name}
										</p>
										{policy.description && (
											<p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
												{policy.description}
											</p>
										)}
										<div className="mt-1.5 flex flex-wrap gap-1">
											{policy.permissions.slice(0, 3).map((p) => (
												<Badge
													key={p}
													variant="outline"
													className="h-4 px-1.5 text-[10px]"
												>
													{p}
												</Badge>
											))}
											{policy.permissions.length > 3 && (
												<Badge
													variant="outline"
													className="h-4 px-1.5 text-[10px]"
												>
													+{policy.permissions.length - 3} more
												</Badge>
											)}
										</div>
									</div>
									{policy.isManaged && (
										<Badge variant="secondary" className="shrink-0 text-[10px]">
											Managed
										</Badge>
									)}
								</button>
							);
						})
					)}
				</div>

				<SheetFooter className="sticky bottom-0 bg-popover border-t px-4 py-3 flex-col gap-2">
					<Button
						type="button"
						disabled={isSaving}
						onClick={handleSave}
						className="w-full h-11 rounded-xl text-[15px] font-medium bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0 shadow-sm active:scale-[0.98]"
					>
						{isSaving ? (
							<>
								<Loader2Icon className="size-4 animate-spin" />
								Saving…
							</>
						) : (
							`Apply (${selectedIds.size})`
						)}
					</Button>
					<Button
						type="button"
						variant="outline"
						className="w-full h-11 rounded-xl text-[15px] font-medium"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
