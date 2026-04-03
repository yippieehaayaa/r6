import type { Role } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCreateRoleMutation, useUpdateRoleMutation } from "@/api/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantSlug: string;
	role?: Role | null;
}

export function RoleSheet({ open, onOpenChange, tenantSlug, role }: Props) {
	const isEdit = !!role;
	const queryClient = useQueryClient();

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		if (role) {
			setName(role.name);
			setDescription(role.description ?? "");
			setIsActive(role.isActive);
		} else {
			setName("");
			setDescription("");
			setIsActive(true);
		}
	}, [role]);

	const createMutation = useCreateRoleMutation();
	const updateMutation = useUpdateRoleMutation();
	const isPending = createMutation.isPending || updateMutation.isPending;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (isEdit && role) {
			updateMutation.mutate(
				{
					tenantSlug,
					id: role.id,
					body: {
						name: name || undefined,
						description: description || null,
						isActive,
					},
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["roles", tenantSlug] });
						toast.success("Role updated.");
						onOpenChange(false);
					},
					onError: (err) =>
						toast.error(
							(err as AxiosError<{ message: string }>).response?.data
								?.message ?? err.message,
						),
				},
			);
		} else {
			createMutation.mutate(
				{
					tenantSlug,
					body: {
						name,
						description: description || null,
						tenantId: null,
					},
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["roles", tenantSlug] });
						toast.success("Role created.");
						onOpenChange(false);
					},
					onError: (err) =>
						toast.error(
							(err as AxiosError<{ message: string }>).response?.data
								?.message ?? err.message,
						),
				},
			);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>{isEdit ? "Edit Role" : "New Role"}</SheetTitle>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							placeholder="Warehouse Manager"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="description">Description (optional)</Label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							placeholder="Describe what this role allows…"
							className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
						/>
					</div>

					{isEdit && (
						<div className="flex items-center gap-2">
							<input
								id="isActive"
								type="checkbox"
								checked={isActive}
								onChange={(e) => setIsActive(e.target.checked)}
								className="size-4 rounded border-input"
							/>
							<Label
								htmlFor="isActive"
								className="text-sm font-normal cursor-pointer"
							>
								Active
							</Label>
						</div>
					)}
				</form>

				<SheetFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isPending}
						onClick={(e) => {
							const form = (e.target as HTMLElement)
								.closest("[data-slot=sheet-content]")
								?.querySelector("form");
							form?.requestSubmit();
						}}
					>
						{isPending ? "Saving…" : isEdit ? "Save changes" : "Create"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
