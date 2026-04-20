import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateTenantInput, Tenant, UpdateTenantInput } from "@r6/schemas";
import {
	CreateTenantSchema,
	TenantModuleEnum,
	UpdateTenantSchema,
} from "@r6/schemas";
import { BuildingIcon, Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	useCreateTenantMutation,
	useUpdateTenantMutation,
} from "@/api/identity-and-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { getApiErrorMessage } from "@/lib/api-error";

// ── Types ─────────────────────────────────────────────────────

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	tenant?: Tenant;
}

// ── Helpers ───────────────────────────────────────────────────

function nameToSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 63);
}

// ── Component ─────────────────────────────────────────────────

export function TenantSheet({ open, onOpenChange, mode, tenant }: Props) {
	const isEdit = mode === "edit";

	const createMutation = useCreateTenantMutation();
	const updateMutation = useUpdateTenantMutation();

	const form = useForm<CreateTenantInput | UpdateTenantInput>({
		resolver: zodResolver(isEdit ? UpdateTenantSchema : CreateTenantSchema),
		defaultValues: { moduleAccess: [] },
		mode: "onTouched",
	});

	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = form;
	const nameValue = watch("name") ?? "";
	const moduleAccessValue = (watch("moduleAccess") ?? []) as string[];

	// Auto-derive slug from name on create
	useEffect(() => {
		if (!isEdit && nameValue) {
			setValue("slug", nameToSlug(nameValue), { shouldValidate: false });
		}
	}, [isEdit, nameValue, setValue]);

	// Populate edit form
	useEffect(() => {
		if (isEdit && tenant && open) {
			form.reset({
				name: tenant.name,
				slug: tenant.slug,
				isActive: tenant.isActive,
				moduleAccess: tenant.moduleAccess,
			});
		}
	}, [isEdit, tenant, open, form]);

	useEffect(() => {
		if (!open && !isEdit) {
			form.reset({ moduleAccess: [] });
		}
	}, [open, isEdit, form]);

	async function onSubmit(values: CreateTenantInput | UpdateTenantInput) {
		try {
			if (isEdit && tenant) {
				await updateMutation.mutateAsync({
					tenantId: tenant.id,
					body: values as UpdateTenantInput,
				});
				toast.success("Tenant updated successfully.");
			} else {
				await createMutation.mutateAsync(values as CreateTenantInput);
				toast.success("Tenant created successfully.");
			}
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	const isPending = createMutation.isPending || updateMutation.isPending;

	function toggleModule(mod: string) {
		const current = moduleAccessValue;
		const updated = current.includes(mod)
			? current.filter((m) => m !== mod)
			: [...current, mod];
		setValue("moduleAccess", updated as typeof moduleAccessValue, {
			shouldValidate: true,
		});
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-md overflow-y-auto">
				<SheetHeader className="pb-4">
					<div className="flex items-center gap-3">
						<div className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent)]/10">
							<BuildingIcon className="size-4 text-[var(--accent)]" />
						</div>
						<div>
							<SheetTitle className="text-[var(--text-primary)]">
								{isEdit ? "Edit Tenant" : "New Tenant"}
							</SheetTitle>
							<SheetDescription>
								{isEdit
									? `Editing "${tenant?.name}"`
									: "Create a new tenant on the platform"}
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col h-[calc(100%-5rem)]"
				>
					<FieldGroup className="flex-1 gap-4 overflow-y-auto pb-4">
						<Field data-invalid={!!(errors as Record<string, unknown>).name}>
							<FieldLabel htmlFor="t-name" className="text-[13px]">
								Tenant Name
							</FieldLabel>
							<Input
								id="t-name"
								placeholder="Acme Corporation"
								className="h-9 rounded-lg"
								{...register("name")}
							/>
							{(errors as Record<string, { message?: string }>).name && (
								<FieldError>
									{
										(errors as Record<string, { message?: string }>).name
											?.message
									}
								</FieldError>
							)}
						</Field>

						<Field data-invalid={!!(errors as Record<string, unknown>).slug}>
							<FieldLabel htmlFor="t-slug" className="text-[13px]">
								Slug
							</FieldLabel>
							<Input
								id="t-slug"
								placeholder="acme-corporation"
								className="h-9 rounded-lg font-mono"
								{...register("slug")}
							/>
							{(errors as Record<string, { message?: string }>).slug && (
								<FieldError>
									{
										(errors as Record<string, { message?: string }>).slug
											?.message
									}
								</FieldError>
							)}
						</Field>

						{isEdit && (
							<Field>
								<div className="flex items-center gap-3">
									<Checkbox
										id="t-isActive"
										checked={!!watch("isActive" as keyof typeof watch)}
										onCheckedChange={(checked) =>
											setValue("isActive" as never, !!checked as never)
										}
									/>
									<FieldLabel
										htmlFor="t-isActive"
										className="text-[13px] font-normal cursor-pointer"
									>
										Active
									</FieldLabel>
								</div>
							</Field>
						)}

						<div className="flex flex-col gap-2">
							<span className="text-[13px] font-medium text-[var(--text-primary)]">
								Module Access
							</span>
							<p className="text-xs text-[var(--text-secondary)]">
								Select the microservice modules this tenant can access.
							</p>
							<div className="flex flex-wrap gap-2 pt-1">
								{TenantModuleEnum.map((mod) => {
									const active = moduleAccessValue.includes(mod);
									return (
										<button
											key={mod}
											type="button"
											onClick={() => toggleModule(mod)}
											className="cursor-pointer"
										>
											<Badge
												variant={active ? "default" : "outline"}
												className={`text-xs capitalize transition-all ${
													active
														? "bg-[var(--accent)] text-white border-0"
														: "text-[var(--text-secondary)]"
												}`}
											>
												{mod}
											</Badge>
										</button>
									);
								})}
							</div>
						</div>
					</FieldGroup>

					<SheetFooter className="pt-4 border-t border-[var(--border)] gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isPending}
							className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0"
						>
							{isPending ? (
								<>
									<Loader2Icon className="size-4 animate-spin" />{" "}
									{isEdit ? "Saving…" : "Creating…"}
								</>
							) : isEdit ? (
								"Save Changes"
							) : (
								"Create Tenant"
							)}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
