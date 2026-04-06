import { zodResolver } from "@hookform/resolvers/zod";
import {
	PROTECTED_ROLES,
	type ProvisionIdentityInput,
	ProvisionIdentitySchema,
} from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useProvisionIdentityMutation } from "@/api/tenants";
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
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { getApiErrorMessage } from "@/lib/api-error";

const ROLE_OPTIONS = PROTECTED_ROLES.map((r) => ({
	value: r,
	label: r
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" "),
}));

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantSlug: string;
}

export function ProvisionIdentitySheet({
	open,
	onOpenChange,
	tenantSlug,
}: Props) {
	const queryClient = useQueryClient();
	const mutation = useProvisionIdentityMutation();

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ProvisionIdentityInput>({
		resolver: zodResolver(ProvisionIdentitySchema),
		mode: "onTouched",
		defaultValues: {
			username: "",
			email: undefined,
			plainPassword: "",
			role: "tenant-owner",
		},
	});

	function handleOpenChange(nextOpen: boolean) {
		if (!nextOpen) reset();
		onOpenChange(nextOpen);
	}

	function onSubmit(values: ProvisionIdentityInput) {
		mutation.mutate(
			{ tenantSlug, body: values },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["identities", tenantSlug],
					});
					toast.success(`Identity "${values.username}" provisioned.`);
					handleOpenChange(false);
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>Provision Identity</SheetTitle>
					<p className="text-sm text-muted-foreground">
						Create a new identity and assign it a protected role for this
						tenant.
					</p>
				</SheetHeader>

				<form
					id="provision-identity-form"
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col gap-4 px-4"
				>
					<FieldGroup>
						<Field data-invalid={!!errors.username}>
							<FieldLabel htmlFor="username">Username</FieldLabel>
							<Input
								id="username"
								placeholder="tenant.owner"
								autoComplete="off"
								aria-invalid={!!errors.username}
								{...register("username")}
							/>
							<FieldError errors={errors.username ? [errors.username] : []} />
						</Field>

						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="email">Email (optional)</FieldLabel>
							<Input
								id="email"
								type="email"
								placeholder="owner@example.com"
								autoComplete="off"
								aria-invalid={!!errors.email}
								{...register("email", {
									setValueAs: (v) => (v === "" ? undefined : v),
								})}
							/>
							<FieldError errors={errors.email ? [errors.email] : []} />
						</Field>

						<Field data-invalid={!!errors.plainPassword}>
							<FieldLabel htmlFor="plainPassword">Password</FieldLabel>
							<Input
								id="plainPassword"
								type="password"
								placeholder="Password@1234!"
								autoComplete="new-password"
								aria-invalid={!!errors.plainPassword}
								{...register("plainPassword")}
							/>
							<FieldError
								errors={errors.plainPassword ? [errors.plainPassword] : []}
							/>
						</Field>

						<Field data-invalid={!!errors.role}>
							<FieldLabel htmlFor="role">Role</FieldLabel>
							<Controller
								name="role"
								control={control}
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger id="role" aria-invalid={!!errors.role}>
											<SelectValue placeholder="Select a role" />
										</SelectTrigger>
										<SelectContent>
											{ROLE_OPTIONS.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							<FieldError errors={errors.role ? [errors.role] : []} />
						</Field>
					</FieldGroup>

					<SheetFooter>
						<Button
							type="submit"
							form="provision-identity-form"
							disabled={isSubmitting || mutation.isPending}
						>
							{isSubmitting || mutation.isPending
								? "Provisioning…"
								: "Provision"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
