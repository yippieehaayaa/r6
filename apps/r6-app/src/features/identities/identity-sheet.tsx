import { zodResolver } from "@hookform/resolvers/zod";
import type {
	CreateIdentityInput,
	IdentitySafe,
	UpdateIdentityInput,
} from "@r6/schemas";
import {
	CreateIdentitySchema,
	IdentityStatusSchema,
	UpdateIdentitySchema,
} from "@r6/schemas";
import { Loader2Icon, UserIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	useCreateIdentityMutation,
	useUpdateIdentityMutation,
} from "@/api/identity-and-access";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
	identity?: IdentitySafe;
	tenantId: string;
}

type CreateFormInput = CreateIdentityInput & { confirmPassword: string };

// ── Component ─────────────────────────────────────────────────

export function IdentitySheet({
	open,
	onOpenChange,
	mode,
	identity,
	tenantId,
}: Props) {
	const isEdit = mode === "edit";

	const createMutation = useCreateIdentityMutation();
	const updateMutation = useUpdateIdentityMutation();

	// ── Create form ──────────────────────────────────────────────

	const createForm = useForm<CreateFormInput>({
		resolver: zodResolver(
			CreateIdentitySchema.extend({
				confirmPassword: CreateIdentitySchema.shape.plainPassword,
			}).refine((d) => d.plainPassword === d.confirmPassword, {
				message: "Passwords do not match",
				path: ["confirmPassword"],
			}),
		),
		defaultValues: { kind: "USER", mustChangePassword: false },
		mode: "onTouched",
	});

	// ── Edit form ────────────────────────────────────────────────

	const editForm = useForm<UpdateIdentityInput>({
		resolver: zodResolver(UpdateIdentitySchema),
		mode: "onTouched",
	});

	// Populate edit form when identity changes
	useEffect(() => {
		if (isEdit && identity && open) {
			editForm.reset({
				firstName: identity.firstName,
				middleName: identity.middleName ?? undefined,
				lastName: identity.lastName,
				email: identity.email,
				username: identity.username,
				country: identity.country,
				status: identity.status,
			});
		}
	}, [isEdit, identity, open, editForm]);

	// Reset create form when closed
	useEffect(() => {
		if (!open && !isEdit) {
			createForm.reset();
		}
	}, [open, isEdit, createForm]);

	// ── Submit handlers ──────────────────────────────────────────

	async function onCreateSubmit(values: CreateFormInput) {
		const { confirmPassword: _, ...input } = values;
		try {
			await createMutation.mutateAsync({ tenantId, body: input });
			toast.success("Identity created successfully.");
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	async function onEditSubmit(values: UpdateIdentityInput) {
		if (!identity) return;
		try {
			await updateMutation.mutateAsync({
				tenantId,
				id: identity.id,
				body: values,
			});
			toast.success("Identity updated successfully.");
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	// ── Render ───────────────────────────────────────────────────

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-md overflow-y-auto">
				<SheetHeader className="pb-4">
					<div className="flex items-center gap-3">
						<div className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent)]/10">
							<UserIcon className="size-4 text-[var(--accent)]" />
						</div>
						<div>
							<SheetTitle className="text-[var(--text-primary)]">
								{isEdit ? "Edit Identity" : "New Identity"}
							</SheetTitle>
							<SheetDescription>
								{isEdit
									? `Editing ${identity?.username}`
									: "Create a new user within this tenant"}
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				{isEdit ? (
					<EditForm
						form={editForm}
						onSubmit={editForm.handleSubmit(onEditSubmit)}
						isPending={updateMutation.isPending}
						onCancel={() => onOpenChange(false)}
					/>
				) : (
					<CreateForm
						form={createForm}
						onSubmit={createForm.handleSubmit(onCreateSubmit)}
						isPending={createMutation.isPending}
						onCancel={() => onOpenChange(false)}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}

// ── Create form ───────────────────────────────────────────────

function CreateForm({
	form,
	onSubmit,
	isPending,
	onCancel,
}: {
	form: ReturnType<typeof useForm<CreateFormInput>>;
	onSubmit: React.FormEventHandler;
	isPending: boolean;
	onCancel: () => void;
}) {
	const {
		register,
		formState: { errors },
		setValue,
		watch,
	} = form;

	return (
		<form onSubmit={onSubmit} className="flex flex-col h-[calc(100%-5rem)]">
			<FieldGroup className="flex-1 gap-4 overflow-y-auto pb-4">
				<div className="grid grid-cols-2 gap-3">
					<Field data-invalid={!!errors.firstName}>
						<FieldLabel htmlFor="c-firstName" className="text-[13px]">
							First Name
						</FieldLabel>
						<Input
							id="c-firstName"
							placeholder="John"
							className="h-9 rounded-lg"
							{...register("firstName")}
						/>
						{errors.firstName && (
							<FieldError>{errors.firstName.message}</FieldError>
						)}
					</Field>
					<Field data-invalid={!!errors.lastName}>
						<FieldLabel htmlFor="c-lastName" className="text-[13px]">
							Last Name
						</FieldLabel>
						<Input
							id="c-lastName"
							placeholder="Doe"
							className="h-9 rounded-lg"
							{...register("lastName")}
						/>
						{errors.lastName && (
							<FieldError>{errors.lastName.message}</FieldError>
						)}
					</Field>
				</div>
				<Field data-invalid={!!errors.middleName}>
					<FieldLabel htmlFor="c-middleName" className="text-[13px]">
						Middle Name{" "}
						<span className="text-[var(--text-secondary)] font-normal">
							(optional)
						</span>
					</FieldLabel>
					<Input
						id="c-middleName"
						placeholder="—"
						className="h-9 rounded-lg"
						{...register("middleName")}
					/>
					{errors.middleName && (
						<FieldError>{errors.middleName.message}</FieldError>
					)}
				</Field>
				<div className="grid grid-cols-2 gap-3">
					<Field data-invalid={!!errors.country}>
						<FieldLabel htmlFor="c-country" className="text-[13px]">
							Country (ISO)
						</FieldLabel>
						<Input
							id="c-country"
							placeholder="PH"
							maxLength={2}
							className="h-9 rounded-lg uppercase"
							{...register("country")}
						/>
						{errors.country && (
							<FieldError>{errors.country.message}</FieldError>
						)}
					</Field>
					<Field data-invalid={!!errors.username}>
						<FieldLabel htmlFor="c-username" className="text-[13px]">
							Username
						</FieldLabel>
						<Input
							id="c-username"
							placeholder="john.doe"
							className="h-9 rounded-lg"
							{...register("username")}
						/>
						{errors.username && (
							<FieldError>{errors.username.message}</FieldError>
						)}
					</Field>
				</div>
				<Field data-invalid={!!errors.email}>
					<FieldLabel htmlFor="c-email" className="text-[13px]">
						Email
					</FieldLabel>
					<Input
						id="c-email"
						type="email"
						placeholder="john@acme.com"
						className="h-9 rounded-lg"
						{...register("email")}
					/>
					{errors.email && <FieldError>{errors.email.message}</FieldError>}
				</Field>
				<Field data-invalid={!!errors.plainPassword}>
					<FieldLabel htmlFor="c-password" className="text-[13px]">
						Password
					</FieldLabel>
					<Input
						id="c-password"
						type="password"
						placeholder="••••••••"
						autoComplete="new-password"
						className="h-9 rounded-lg"
						{...register("plainPassword")}
					/>
					{errors.plainPassword && (
						<FieldError>{errors.plainPassword.message}</FieldError>
					)}
				</Field>
				<Field data-invalid={!!errors.confirmPassword}>
					<FieldLabel htmlFor="c-confirmPassword" className="text-[13px]">
						Confirm Password
					</FieldLabel>
					<Input
						id="c-confirmPassword"
						type="password"
						placeholder="••••••••"
						autoComplete="new-password"
						className="h-9 rounded-lg"
						{...register("confirmPassword")}
					/>
					{errors.confirmPassword && (
						<FieldError>{errors.confirmPassword.message}</FieldError>
					)}
				</Field>
			</FieldGroup>
			<SheetFooter className="pt-4 border-t border-[var(--border)] gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
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
							<Loader2Icon className="size-4 animate-spin" /> Creating…
						</>
					) : (
						"Create Identity"
					)}
				</Button>
			</SheetFooter>
		</form>
	);
}

// ── Edit form ─────────────────────────────────────────────────

function EditForm({
	form,
	onSubmit,
	isPending,
	onCancel,
}: {
	form: ReturnType<typeof useForm<UpdateIdentityInput>>;
	onSubmit: React.FormEventHandler;
	isPending: boolean;
	onCancel: () => void;
}) {
	const {
		register,
		formState: { errors },
		setValue,
		watch,
	} = form;
	const currentStatus = watch("status");

	return (
		<form onSubmit={onSubmit} className="flex flex-col h-[calc(100%-5rem)]">
			<FieldGroup className="flex-1 gap-4 overflow-y-auto pb-4">
				<div className="grid grid-cols-2 gap-3">
					<Field data-invalid={!!errors.firstName}>
						<FieldLabel htmlFor="e-firstName" className="text-[13px]">
							First Name
						</FieldLabel>
						<Input
							id="e-firstName"
							className="h-9 rounded-lg"
							{...register("firstName")}
						/>
						{errors.firstName && (
							<FieldError>{errors.firstName.message}</FieldError>
						)}
					</Field>
					<Field data-invalid={!!errors.lastName}>
						<FieldLabel htmlFor="e-lastName" className="text-[13px]">
							Last Name
						</FieldLabel>
						<Input
							id="e-lastName"
							className="h-9 rounded-lg"
							{...register("lastName")}
						/>
						{errors.lastName && (
							<FieldError>{errors.lastName.message}</FieldError>
						)}
					</Field>
				</div>
				<Field data-invalid={!!errors.middleName}>
					<FieldLabel htmlFor="e-middleName" className="text-[13px]">
						Middle Name{" "}
						<span className="text-[var(--text-secondary)] font-normal">
							(optional)
						</span>
					</FieldLabel>
					<Input
						id="e-middleName"
						className="h-9 rounded-lg"
						{...register("middleName")}
					/>
					{errors.middleName && (
						<FieldError>{errors.middleName.message}</FieldError>
					)}
				</Field>
				<div className="grid grid-cols-2 gap-3">
					<Field data-invalid={!!errors.country}>
						<FieldLabel htmlFor="e-country" className="text-[13px]">
							Country (ISO)
						</FieldLabel>
						<Input
							id="e-country"
							maxLength={2}
							className="h-9 rounded-lg uppercase"
							{...register("country")}
						/>
						{errors.country && (
							<FieldError>{errors.country.message}</FieldError>
						)}
					</Field>
					<Field data-invalid={!!errors.username}>
						<FieldLabel htmlFor="e-username" className="text-[13px]">
							Username
						</FieldLabel>
						<Input
							id="e-username"
							className="h-9 rounded-lg"
							{...register("username")}
						/>
						{errors.username && (
							<FieldError>{errors.username.message}</FieldError>
						)}
					</Field>
				</div>
				<Field data-invalid={!!errors.email}>
					<FieldLabel htmlFor="e-email" className="text-[13px]">
						Email
					</FieldLabel>
					<Input
						id="e-email"
						type="email"
						className="h-9 rounded-lg"
						{...register("email")}
					/>
					{errors.email && <FieldError>{errors.email.message}</FieldError>}
				</Field>
				<Field data-invalid={!!errors.status}>
					<FieldLabel className="text-[13px]">Status</FieldLabel>
					<Select
						value={currentStatus ?? ""}
						onValueChange={(v) =>
							setValue("status", v as typeof IdentityStatusSchema._type)
						}
					>
						<SelectTrigger className="h-9 rounded-lg">
							<SelectValue placeholder="Select status" />
						</SelectTrigger>
						<SelectContent>
							{IdentityStatusSchema.options.map((s) => (
								<SelectItem key={s} value={s}>
									{s.replace(/_/g, " ")}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.status && <FieldError>{errors.status.message}</FieldError>}
				</Field>
			</FieldGroup>
			<SheetFooter className="pt-4 border-t border-[var(--border)] gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
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
							<Loader2Icon className="size-4 animate-spin" /> Saving…
						</>
					) : (
						"Save Changes"
					)}
				</Button>
			</SheetFooter>
		</form>
	);
}
