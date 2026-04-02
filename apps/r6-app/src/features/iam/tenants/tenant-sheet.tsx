import type { Tenant } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useCreateTenantMutation,
	useUpdateTenantMutation,
} from "@/api/tenants";
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
	tenant?: Tenant | null;
}

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function linesToArray(text: string): string[] {
	return text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);
}

export function TenantSheet({ open, onOpenChange, tenant }: Props) {
	const isEdit = !!tenant;
	const queryClient = useQueryClient();

	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [slugEdited, setSlugEdited] = useState(false);
	const [moduleAccess, setModuleAccess] = useState("");
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		if (tenant) {
			setName(tenant.name);
			setSlug(tenant.slug);
			setModuleAccess(tenant.moduleAccess.join("\n"));
			setIsActive(tenant.isActive);
			setSlugEdited(true);
		} else {
			setName("");
			setSlug("");
			setModuleAccess("");
			setIsActive(true);
			setSlugEdited(false);
		}
	}, [tenant]);

	function handleNameChange(value: string) {
		setName(value);
		if (!slugEdited) {
			setSlug(toSlug(value));
		}
	}

	const createMutation = useCreateTenantMutation();
	const updateMutation = useUpdateTenantMutation();
	const isPending = createMutation.isPending || updateMutation.isPending;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const modules = linesToArray(moduleAccess);

		if (isEdit && tenant) {
			updateMutation.mutate(
				{
					tenantSlug: tenant.slug,
					body: {
						name: name || undefined,
						slug: slug || undefined,
						moduleAccess: modules.length ? modules : undefined,
						isActive,
					},
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["tenants"] });
						toast.success("Tenant updated.");
						onOpenChange(false);
					},
					onError: (err) => toast.error(err.message),
				},
			);
		} else {
			createMutation.mutate(
				{
					name,
					slug,
					moduleAccess: modules,
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({ queryKey: ["tenants"] });
						toast.success("Tenant created.");
						onOpenChange(false);
					},
					onError: (err) => toast.error(err.message),
				},
			);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>{isEdit ? "Edit Tenant" : "New Tenant"}</SheetTitle>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => handleNameChange(e.target.value)}
							required
							placeholder="Acme Corporation"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="slug">Slug</Label>
						<Input
							id="slug"
							value={slug}
							onChange={(e) => {
								setSlug(e.target.value);
								setSlugEdited(true);
							}}
							required
							placeholder="acme-corp"
							className="font-mono"
						/>
						<p className="text-xs text-muted-foreground">
							URL-safe identifier — lowercase, letters/digits/hyphens only.
						</p>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="modules">
							Module Access{" "}
							<span className="text-muted-foreground font-normal">
								(one per line)
							</span>
						</Label>
						<textarea
							id="modules"
							value={moduleAccess}
							onChange={(e) => setModuleAccess(e.target.value)}
							rows={4}
							required={!isEdit}
							placeholder={"inventory\nprocurement\npos"}
							className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm font-mono outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
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
