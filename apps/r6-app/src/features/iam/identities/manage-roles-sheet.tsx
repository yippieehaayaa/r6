import type { IdentitySafe } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useGetIdentityWithRolesQuery,
	useSetRolesMutation,
} from "@/api/identities";
import { useListRolesQuery } from "@/api/roles";
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
	identity: IdentitySafe | null;
}

export function ManageRolesSheet({
	open,
	onOpenChange,
	tenantSlug,
	identity,
}: Props) {
	const queryClient = useQueryClient();
	const mutation = useSetRolesMutation();

	const [search, setSearch] = useState("");
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [initialIds, setInitialIds] = useState<Set<string>>(new Set());

	const { data: identityWithRoles, isLoading: isLoadingCurrent } =
		useGetIdentityWithRolesQuery(tenantSlug, identity?.id ?? "", {
			enabled: open && !!identity,
		});

	const { data: allRoles, isLoading: isLoadingRoles } = useListRolesQuery(
		tenantSlug,
		{ limit: 100 },
		{ staleTime: 5 * 60 * 1000 },
	);

	// Initialise selection once current roles load
	useEffect(() => {
		if (!identityWithRoles) return;
		const ids = new Set(identityWithRoles.roles.map((r) => r.id));
		setSelectedIds(ids);
		setInitialIds(ids);
	}, [identityWithRoles]);

	// Reset on close
	useEffect(() => {
		if (!open) {
			setSearch("");
			setSelectedIds(new Set());
			setInitialIds(new Set());
		}
	}, [open]);

	const isLoading = isLoadingCurrent || isLoadingRoles;

	const filteredRoles = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return allRoles?.data ?? [];
		return (allRoles?.data ?? []).filter(
			(r) =>
				r.name.toLowerCase().includes(q) ||
				r.description?.toLowerCase().includes(q),
		);
	}, [allRoles, search]);

	const hasChanged = useMemo(() => {
		if (selectedIds.size !== initialIds.size) return true;
		for (const id of selectedIds) {
			if (!initialIds.has(id)) return true;
		}
		return false;
	}, [selectedIds, initialIds]);

	function toggleRole(id: string) {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function handleSubmit() {
		if (!identity) return;
		mutation.mutate(
			{ tenantSlug, id: identity.id, roleIds: [...selectedIds] },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["identities", tenantSlug],
					});
					queryClient.invalidateQueries({
						queryKey: ["identities", tenantSlug, identity.id],
					});
					toast.success("Roles updated.");
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
					<SheetTitle>Manage Roles</SheetTitle>
					<p className="text-sm text-muted-foreground">
						Saving replaces all assigned roles atomically.
					</p>
				</SheetHeader>

				<div className="flex flex-col gap-3 px-4 flex-1 overflow-hidden">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
						<Input
							placeholder="Search roles…"
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
							{filteredRoles.length} role
							{filteredRoles.length !== 1 ? "s" : ""}
						</span>
					</div>

					<Separator />

					<div className="flex flex-col gap-1 overflow-y-auto flex-1 -mx-1 px-1">
						{isLoading ? (
							Array.from({ length: 5 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
								<Skeleton key={i} className="h-14 w-full rounded-lg" />
							))
						) : filteredRoles.length === 0 ? (
							<p className="text-sm text-muted-foreground py-6 text-center">
								{search ? "No roles match your search." : "No roles available."}
							</p>
						) : (
							filteredRoles.map((role) => {
								const checked = selectedIds.has(role.id);
								return (
									<label
										key={role.id}
										className="flex items-start gap-3 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors"
									>
										<input
											type="checkbox"
											className="mt-0.5 size-4 rounded border-input accent-primary shrink-0"
											checked={checked}
											onChange={() => toggleRole(role.id)}
										/>
										<div className="flex flex-col gap-0.5 min-w-0">
											<span className="text-sm font-medium leading-tight">
												{role.name}
											</span>
											{role.description && (
												<span className="text-xs text-muted-foreground truncate">
													{role.description}
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
						disabled={!hasChanged || mutation.isPending}
					>
						{mutation.isPending ? "Saving…" : "Save changes"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
