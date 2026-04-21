import { zodResolver } from "@hookform/resolvers/zod";
import {
	type CreateInvitationInput,
	CreateInvitationSchema,
} from "@r6/schemas";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useInviteMutation } from "@/api/identity-and-access/tenants/mutations/invite";
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
import { getApiErrorMessage } from "@/lib/api-error";

interface InviteSheetProps {
	tenantId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function InviteSheet({
	tenantId,
	open,
	onOpenChange,
}: InviteSheetProps) {
	const mutation = useInviteMutation();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateInvitationInput>({
		resolver: zodResolver(CreateInvitationSchema),
		mode: "onTouched",
	});

	useEffect(() => {
		if (!open) reset();
	}, [open, reset]);

	async function onSubmit(values: CreateInvitationInput) {
		try {
			await mutation.mutateAsync({ tenantId, input: values });
			toast.success(`Invitation sent to ${values.email}`);
			onOpenChange(false);
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md">
				<SheetHeader>
					<SheetTitle>Invite Member</SheetTitle>
					<SheetDescription>
						Send an invitation email to add someone to this tenant.
					</SheetDescription>
				</SheetHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col gap-5 px-4 py-2"
				>
					<FieldGroup>
						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="invite-email">Email Address</FieldLabel>
							<Input
								id="invite-email"
								type="email"
								placeholder="colleague@company.com"
								autoComplete="email"
								className="h-10 rounded-xl"
								{...register("email")}
							/>
							<FieldDescription>
								An invitation link will be sent to this address.
							</FieldDescription>
							<FieldError errors={errors.email ? [errors.email] : []} />
						</Field>
					</FieldGroup>

					<SheetFooter className="px-0">
						<Button
							type="button"
							variant="outline"
							className="flex-1 h-11 rounded-xl text-[15px] font-medium"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="flex-1 h-11 rounded-xl text-[15px] font-medium bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0 shadow-sm active:scale-[0.98]"
						>
							{isSubmitting ? (
								<>
									<Loader2Icon className="size-4 animate-spin" />
									Sending…
								</>
							) : (
								"Send Invite"
							)}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
