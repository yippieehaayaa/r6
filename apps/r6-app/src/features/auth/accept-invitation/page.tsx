import { zodResolver } from "@hookform/resolvers/zod";
import {
	type AcceptInvitationInput,
	AcceptInvitationSchema,
} from "@r6/schemas";
import { Link, useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd, TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAcceptInvitationMutation } from "@/api/identity-and-access/invitations/mutations/accept";
import { ModeToggle } from "@/components/mode-toggle";
import { parseApiError } from "@/lib/api-error";
import { Route } from "@/routes/r6/accept-invitation";
import { AcceptInvitationCard } from "./accept-invitation-card";

export default function AcceptInvitationPage() {
	const navigate = useNavigate();
	const { token } = Route.useSearch();
	const acceptMutation = useAcceptInvitationMutation();

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<AcceptInvitationInput>({
		resolver: zodResolver(AcceptInvitationSchema),
		mode: "onTouched",
	});

	useEffect(() => {
		setValue("token", token);
	}, [token, setValue]);

	async function onSubmit(values: AcceptInvitationInput) {
		try {
			await acceptMutation.mutateAsync(values);
			toast.success("Invitation accepted! You can now sign in.");
			navigate({ to: "/r6/login", replace: true });
		} catch (err) {
			const { code, message } = parseApiError(err);
			if (code === "invitation_not_found_or_expired") {
				toast.error("This invitation link is invalid or has expired.");
			} else if (code === "invitation_already_accepted") {
				toast.error("This invitation has already been accepted.");
			} else if (code === "invalid_credentials") {
				toast.error("Invalid username or password.");
			} else if (code === "already_in_tenant") {
				toast.error("Your account is already associated with an organization.");
			} else if (code === "account_not_active") {
				toast.error(
					"Please verify your email address before accepting an invitation.",
				);
			} else {
				toast.error(message);
			}
		}
	}

	if (!token) {
		return (
			<div className="animate-apple-enter relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
				<div className="absolute top-4 right-4">
					<ModeToggle />
				</div>
				<div className="flex w-full max-w-sm flex-col gap-6 items-center text-center">
					<div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
						<TriangleAlertIcon className="size-5" />
					</div>
					<div className="flex flex-col gap-1">
						<h1 className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
							Invalid invitation link
						</h1>
						<p className="text-sm text-[var(--text-secondary)]">
							This link is missing a token. Please use the link from your
							invitation email.
						</p>
					</div>
					<Link
						to="/r6/login"
						className="text-sm text-[var(--accent)] hover:underline"
					>
						Back to sign in
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="animate-apple-enter relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="absolute top-4 right-4">
				<ModeToggle />
			</div>
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Link
					to="/r6/login"
					className="flex items-center gap-2 self-center font-medium text-[var(--text-primary)]"
				>
					<div className="flex size-6 items-center justify-center rounded-md bg-[var(--accent)] text-white">
						<GalleryVerticalEnd className="size-4" />
					</div>
					R6 Inc.
				</Link>
				<AcceptInvitationCard
					onSubmit={handleSubmit(onSubmit)}
					register={register}
					errors={errors}
					isSubmitting={isSubmitting}
				/>
				<p className="text-center text-xs text-[var(--text-secondary)]">
					Already have access?{" "}
					<Link
						to="/r6/login"
						search={{ token }}
						className="text-[var(--accent)] hover:underline font-medium"
					>
						Sign in
					</Link>
					{" or "}
					<Link
						to="/r6/register"
						search={{ token }}
						className="text-[var(--accent)] hover:underline font-medium"
					>
						create an account
					</Link>
				</p>
			</div>
		</div>
	);
}
