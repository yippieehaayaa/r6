import { zodResolver } from "@hookform/resolvers/zod";
import type { CreatePolicyInput, Policy, UpdatePolicyInput } from "@r6/schemas";
import {
	CreatePolicySchema,
	PermissionSchema,
	UpdatePolicySchema,
} from "@r6/schemas";
import { Loader2Icon, PlusIcon, ShieldIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	useCreatePolicyMutation,
	useUpdatePolicyMutation,
} from "@/api/identity-and-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";

// ── Types ─────────────────────────────────────────────────────

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	policy?: Policy;
	tenantId: string;
}

const PERMISSION_REGEX = /^[a-z*][a-z0-9-]*:[a-z*][a-z0-9-]*:[a-z*][a-z0-9-]*$/;

// ── Component ─────────────────────────────────────────────────

export function PolicySheet({
	open,
	onOpenChange,
	mode,
	policy,
	tenantId,
}: Props) {
	const isEdit = mode === "edit";

	const createMutation = useCreatePolicyMutation();
	const updateMutation = useUpdatePolicyMutation();

	const [permInput, setPermInput] = useState("");
	const [permInputError, setPermInputError] = useState("");
	const permInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<CreatePolicyInput | UpdatePolicyInput>({
		resolver: zodResolver(isEdit ? UpdatePolicySchema : CreatePolicySchema),
		defaultValues: { permissions: [] },
		mode: "onTouched",
	});

	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = form;
	const permissions = (watch("permissions") ?? []) as string[];

	useEffect(() => {
		if (isEdit && policy && open) {
			form.reset({
				name: policy.name,
				displayName: policy.displayName ?? undefined,
				description: policy.description ?? undefined,
				permissions: policy.permissions,
			});
		}
	}, [isEdit, policy, open, form]);

	useEffect(() => {
		if (!open && !isEdit) {
			form.reset({ permissions: [] });
			setPermInput("");
			setPermInputError("");
		}
	}, [open, isEdit, form]);

	function addPermission(raw: string) {
		const trimmed = raw.trim().toLowerCase();
		if (!trimmed) return;
		const parse = PermissionSchema.safeParse(trimmed);
		if (!parse.success) {
			setPermInputError(parse.error.issues[0]?.message ?? "Invalid permission");
			return;
		}
		if (permissions.includes(trimmed)) {
			setPermInputError("Permission already added");
			return;
		}
		setValue("permissions", [...permissions, trimmed] as string[], {
			shouldValidate: true,
		});
		setPermInput("");
		setPermInputError("");
	}

	function removePermission(perm: string) {
		setValue("permissions", permissions.filter((p) => p !== perm) as string[], {
			shouldValidate: true,
		});
	}

	function handlePermKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addPermission(permInput);
		}
	}

	async function onSubmit(values: CreatePolicyInput | UpdatePolicyInput) {
		try {
			if (isEdit && policy) {
				await updateMutation.mutateAsync({
					tenantId,
					id: policy.id,
					body: values as UpdatePolicyInput,
				});
				toast.success("Policy updated successfully.");
			} else {
				await createMutation.mutateAsync({
					tenantId,
					body: values as CreatePolicyInput,
				});
				toast.success("Policy created successfully.");
			}
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	const isPending = createMutation.isPending || updateMutation.isPending;
	const formErrors = errors as Record<string, { message?: string }>;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-lg overflow-y-auto">
				<SheetHeader className="pb-4">
					<div className="flex items-center gap-3">
						<div className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent)]/10">
							<ShieldIcon className="size-4 text-[var(--accent)]" />
						</div>
						<div>
							<SheetTitle className="text-[var(--text-primary)]">
								{isEdit ? "Edit Policy" : "New Policy"}
							</SheetTitle>
							<SheetDescription>
								{isEdit
									? `Editing "${policy?.name}"`
									: "Define a new permission set"}
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col h-[calc(100%-5rem)]"
				>
					<FieldGroup className="flex-1 gap-4 overflow-y-auto pb-4">
						<Field data-invalid={!!formErrors.name}>
							<FieldLabel htmlFor="p-name" className="text-[13px]">
								Name
							</FieldLabel>
							<Input
								id="p-name"
								placeholder="inventory-stock-read"
								className="h-9 rounded-lg font-mono"
								{...register("name")}
							/>
							{formErrors.name && (
								<FieldError>{formErrors.name.message}</FieldError>
							)}
						</Field>

						<Field data-invalid={!!formErrors.displayName}>
							<FieldLabel htmlFor="p-displayName" className="text-[13px]">
								Display Name{" "}
								<span className="text-[var(--text-secondary)] font-normal">
									(optional)
								</span>
							</FieldLabel>
							<Input
								id="p-displayName"
								placeholder="Inventory Stock Read"
								className="h-9 rounded-lg"
								{...register("displayName")}
							/>
							{formErrors.displayName && (
								<FieldError>{formErrors.displayName.message}</FieldError>
							)}
						</Field>

						<Field data-invalid={!!formErrors.description}>
							<FieldLabel htmlFor="p-description" className="text-[13px]">
								Description{" "}
								<span className="text-[var(--text-secondary)] font-normal">
									(optional)
								</span>
							</FieldLabel>
							<Textarea
								id="p-description"
								placeholder="Allows reading stock levels…"
								className="rounded-lg resize-none"
								rows={3}
								{...register("description")}
							/>
							{formErrors.description && (
								<FieldError>{formErrors.description.message}</FieldError>
							)}
						</Field>

						{/* Permissions tag input */}
						<div className="flex flex-col gap-2">
							<div>
								<span className="text-[13px] font-medium text-[var(--text-primary)]">
									Permissions
								</span>
								<FieldDescription className="mt-0.5">
									Format:{" "}
									<code className="font-mono text-xs">
										service:resource:action
									</code>{" "}
									— press Enter or comma to add.
								</FieldDescription>
							</div>

							<div className="flex gap-2">
								<Input
									ref={permInputRef}
									value={permInput}
									onChange={(e) => {
										setPermInput(e.target.value);
										setPermInputError("");
									}}
									onKeyDown={handlePermKeyDown}
									placeholder="inventory:stock:read"
									className="h-9 rounded-lg font-mono flex-1 text-sm"
								/>
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="h-9 w-9 shrink-0"
									onClick={() => addPermission(permInput)}
								>
									<PlusIcon className="size-4" />
								</Button>
							</div>

							{permInputError && (
								<p className="text-sm text-destructive">{permInputError}</p>
							)}

							{formErrors.permissions && (
								<FieldError>{formErrors.permissions.message}</FieldError>
							)}

							{permissions.length > 0 && (
								<div className="flex flex-wrap gap-1.5 rounded-lg border border-[var(--border)] p-3 min-h-[60px]">
									{permissions.map((perm) => (
										<div
											key={perm}
											className="flex items-center gap-1 rounded-md bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-mono text-[var(--accent)]"
										>
											{perm}
											<button
												type="button"
												onClick={() => removePermission(perm)}
												className="ml-0.5 text-[var(--accent)]/60 hover:text-[var(--accent)] transition-colors"
											>
												<XIcon className="size-3" />
											</button>
										</div>
									))}
								</div>
							)}
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
								"Create Policy"
							)}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
