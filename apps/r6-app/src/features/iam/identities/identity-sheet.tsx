import { zodResolver } from "@hookform/resolvers/zod";
import {
	type CreateIdentityFormInput,
	type CreateIdentityInput,
	CreateIdentitySchema,
	type IdentitySafe,
	type UpdateIdentityFormInput,
	type UpdateIdentityInput,
	UpdateIdentitySchema,
} from "@r6/schemas";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateIdentityMutation } from "@/api/identity-and-access/tenants/identities/mutations/create";
import { useUpdateIdentityMutation } from "@/api/identity-and-access/tenants/identities/mutations/update";
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

// ── Create form ───────────────────────────────────────────────

interface CreateIdentitySheetProps {
	tenantId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateIdentitySheet({
	tenantId,
	open,
	onOpenChange,
}: CreateIdentitySheetProps) {
	const mutation = useCreateIdentityMutation();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateIdentityFormInput, unknown, CreateIdentityInput>({
		resolver: zodResolver(CreateIdentitySchema),
		defaultValues: { kind: "USER", mustChangePassword: false },
		mode: "onTouched",
	});

	useEffect(() => {
		if (!open) reset();
	}, [open, reset]);

	async function onSubmit(values: CreateIdentityInput) {
		try {
			await mutation.mutateAsync({ tenantId, input: values });
			toast.success("Identity created successfully");
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Create Identity</SheetTitle>
					<SheetDescription>
						Add a new user to this tenant. They will receive a temporary
						account.
					</SheetDescription>
				</SheetHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col gap-5 px-4 py-2"
				>
					<FieldGroup>
						<div className="grid grid-cols-2 gap-3">
							<Field data-invalid={!!errors.firstName}>
								<FieldLabel htmlFor="create-firstName">First Name</FieldLabel>
								<Input
									id="create-firstName"
									placeholder="John"
									autoComplete="given-name"
									className="h-10 rounded-xl"
									{...register("firstName")}
								/>
								<FieldError
									errors={errors.firstName ? [errors.firstName] : []}
								/>
							</Field>
							<Field data-invalid={!!errors.lastName}>
								<FieldLabel htmlFor="create-lastName">Last Name</FieldLabel>
								<Input
									id="create-lastName"
									placeholder="Doe"
									autoComplete="family-name"
									className="h-10 rounded-xl"
									{...register("lastName")}
								/>
								<FieldError errors={errors.lastName ? [errors.lastName] : []} />
							</Field>
						</div>

						<Field data-invalid={!!errors.middleName}>
							<FieldLabel htmlFor="create-middleName">
								Middle Name{" "}
								<span className="font-normal text-muted-foreground">
									(optional)
								</span>
							</FieldLabel>
							<Input
								id="create-middleName"
								placeholder="—"
								autoComplete="additional-name"
								className="h-10 rounded-xl"
								{...register("middleName")}
							/>
							<FieldError
								errors={errors.middleName ? [errors.middleName] : []}
							/>
						</Field>

						<div className="grid grid-cols-2 gap-3">
							<Field data-invalid={!!errors.username}>
								<FieldLabel htmlFor="create-username">Username</FieldLabel>
								<Input
									id="create-username"
									placeholder="john.doe"
									autoComplete="username"
									className="h-10 rounded-xl"
									{...register("username")}
								/>
								<FieldError errors={errors.username ? [errors.username] : []} />
							</Field>
							<Field data-invalid={!!errors.country}>
								<FieldLabel htmlFor="create-country">Country (ISO)</FieldLabel>
								<Input
									id="create-country"
									placeholder="PH"
									maxLength={2}
									autoComplete="country"
									className="h-10 rounded-xl uppercase"
									{...register("country")}
								/>
								<FieldError errors={errors.country ? [errors.country] : []} />
							</Field>
						</div>

						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="create-email">Email</FieldLabel>
							<Input
								id="create-email"
								type="email"
								placeholder="john@acme-corp.com"
								autoComplete="email"
								className="h-10 rounded-xl"
								{...register("email")}
							/>
							<FieldError errors={errors.email ? [errors.email] : []} />
						</Field>

						<Field data-invalid={!!errors.plainPassword}>
							<FieldLabel htmlFor="create-password">Password</FieldLabel>
							<Input
								id="create-password"
								type="password"
								placeholder="••••••••"
								autoComplete="new-password"
								className="h-10 rounded-xl"
								{...register("plainPassword")}
							/>
							<FieldError
								errors={errors.plainPassword ? [errors.plainPassword] : []}
							/>
						</Field>
					</FieldGroup>

					<SheetFooter className="px-0">
						<Button
							type="button"
							variant="outline"
							className="flex-1 rounded-xl"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="flex-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0"
						>
							{isSubmitting ? (
								<>
									<Loader2Icon className="size-4 animate-spin" />
									Creating…
								</>
							) : (
								"Create"
							)}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}

// ── Edit form ─────────────────────────────────────────────────

interface EditIdentitySheetProps {
	tenantId: string;
	identity: IdentitySafe | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditIdentitySheet({
	tenantId,
	identity,
	open,
	onOpenChange,
}: EditIdentitySheetProps) {
	const mutation = useUpdateIdentityMutation();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<UpdateIdentityFormInput, unknown, UpdateIdentityInput>({
		resolver: zodResolver(UpdateIdentitySchema),
		mode: "onTouched",
	});

	useEffect(() => {
		if (identity && open) {
			reset({
				firstName: identity.firstName,
				middleName: identity.middleName ?? undefined,
				lastName: identity.lastName,
				email: identity.email,
				username: identity.username,
				country: identity.country,
				status: identity.status,
			});
		}
	}, [identity, open, reset]);

	async function onSubmit(values: UpdateIdentityInput) {
		if (!identity) return;
		try {
			await mutation.mutateAsync({ tenantId, id: identity.id, input: values });
			toast.success("Identity updated successfully");
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Edit Identity</SheetTitle>
					<SheetDescription>
						Update profile details for{" "}
						<span className="font-medium">{identity?.username}</span>.
					</SheetDescription>
				</SheetHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col gap-5 px-4 py-2"
				>
					<FieldGroup>
						<div className="grid grid-cols-2 gap-3">
							<Field data-invalid={!!errors.firstName}>
								<FieldLabel htmlFor="edit-firstName">First Name</FieldLabel>
								<Input
									id="edit-firstName"
									placeholder="John"
									className="h-10 rounded-xl"
									{...register("firstName")}
								/>
								<FieldError
									errors={errors.firstName ? [errors.firstName] : []}
								/>
							</Field>
							<Field data-invalid={!!errors.lastName}>
								<FieldLabel htmlFor="edit-lastName">Last Name</FieldLabel>
								<Input
									id="edit-lastName"
									placeholder="Doe"
									className="h-10 rounded-xl"
									{...register("lastName")}
								/>
								<FieldError errors={errors.lastName ? [errors.lastName] : []} />
							</Field>
						</div>

						<Field data-invalid={!!errors.middleName}>
							<FieldLabel htmlFor="edit-middleName">
								Middle Name{" "}
								<span className="font-normal text-muted-foreground">
									(optional)
								</span>
							</FieldLabel>
							<Input
								id="edit-middleName"
								placeholder="—"
								className="h-10 rounded-xl"
								{...register("middleName")}
							/>
							<FieldError
								errors={errors.middleName ? [errors.middleName] : []}
							/>
						</Field>

						<div className="grid grid-cols-2 gap-3">
							<Field data-invalid={!!errors.username}>
								<FieldLabel htmlFor="edit-username">Username</FieldLabel>
								<Input
									id="edit-username"
									placeholder="john.doe"
									className="h-10 rounded-xl"
									{...register("username")}
								/>
								<FieldError errors={errors.username ? [errors.username] : []} />
							</Field>
							<Field data-invalid={!!errors.country}>
								<FieldLabel htmlFor="edit-country">Country (ISO)</FieldLabel>
								<Input
									id="edit-country"
									placeholder="PH"
									maxLength={2}
									className="h-10 rounded-xl uppercase"
									{...register("country")}
								/>
								<FieldError errors={errors.country ? [errors.country] : []} />
							</Field>
						</div>

						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="edit-email">Email</FieldLabel>
							<Input
								id="edit-email"
								type="email"
								placeholder="john@acme-corp.com"
								className="h-10 rounded-xl"
								{...register("email")}
							/>
							<FieldError errors={errors.email ? [errors.email] : []} />
						</Field>

						<Field data-invalid={!!errors.status}>
							<FieldLabel htmlFor="edit-status">Status</FieldLabel>
							<Select
								defaultValue={identity?.status}
								onValueChange={(v) =>
									setValue("status", v as UpdateIdentityInput["status"], {
										shouldValidate: true,
									})
								}
							>
								<SelectTrigger id="edit-status" className="h-10 rounded-xl">
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ACTIVE">Active</SelectItem>
									<SelectItem value="INACTIVE">Inactive</SelectItem>
									<SelectItem value="SUSPENDED">Suspended</SelectItem>
									<SelectItem value="PENDING_VERIFICATION">
										Pending Verification
									</SelectItem>
								</SelectContent>
							</Select>
							<FieldError errors={errors.status ? [errors.status] : []} />
						</Field>
					</FieldGroup>

					<SheetFooter className="px-0">
						<Button
							type="button"
							variant="outline"
							className="flex-1 rounded-xl"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="flex-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0"
						>
							{isSubmitting ? (
								<>
									<Loader2Icon className="size-4 animate-spin" />
									Saving…
								</>
							) : (
								"Save Changes"
							)}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
