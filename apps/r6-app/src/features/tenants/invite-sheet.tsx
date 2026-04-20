import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateInvitationInput, InvitationSafe } from "@r6/schemas";
import { CreateInvitationSchema } from "@r6/schemas";
import { formatDistanceToNow } from "date-fns";
import { Loader2Icon, MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	useInviteMutation,
	useListInvitationsQuery,
} from "@/api/identity-and-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { getApiErrorMessage } from "@/lib/api-error";

// ── Types ─────────────────────────────────────────────────────

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantId: string;
}

// ── Component ─────────────────────────────────────────────────

export function InviteSheet({ open, onOpenChange, tenantId }: Props) {
	const inviteMutation = useInviteMutation();

	const { data } = useListInvitationsQuery(
		tenantId,
		{ limit: 50 },
		{ enabled: open && !!tenantId },
	);

	const form = useForm<CreateInvitationInput>({
		resolver: zodResolver(CreateInvitationSchema),
		defaultValues: { email: "" },
		mode: "onTouched",
	});

	const {
		register,
		formState: { errors },
		reset,
	} = form;

	async function onSubmit(values: CreateInvitationInput) {
		try {
			await inviteMutation.mutateAsync({ tenantId, body: values });
			toast.success(`Invitation sent to ${values.email}.`);
			reset();
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-md overflow-y-auto">
				<SheetHeader className="pb-4">
					<div className="flex items-center gap-3">
						<div className="flex size-9 items-center justify-center rounded-xl bg-[var(--accent)]/10">
							<MailIcon className="size-4 text-[var(--accent)]" />
						</div>
						<div>
							<SheetTitle className="text-[var(--text-primary)]">
								Invite User
							</SheetTitle>
							<SheetDescription>
								Send an email invitation to join this tenant
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					<FieldGroup className="gap-4">
						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="inv-email" className="text-[13px]">
								Email address
							</FieldLabel>
							<div className="flex gap-2">
								<Input
									id="inv-email"
									type="email"
									placeholder="user@company.com"
									className="h-9 rounded-lg flex-1"
									{...register("email")}
								/>
								<Button
									type="submit"
									disabled={inviteMutation.isPending}
									className="h-9 shrink-0 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0"
								>
									{inviteMutation.isPending ? (
										<Loader2Icon className="size-4 animate-spin" />
									) : (
										"Send"
									)}
								</Button>
							</div>
							{errors.email && <FieldError>{errors.email.message}</FieldError>}
						</Field>
					</FieldGroup>
				</form>

				{/* Invitations list */}
				{(data?.data.length ?? 0) > 0 && (
					<div className="mt-6 flex flex-col gap-3">
						<h4 className="text-[13px] font-medium text-[var(--text-primary)]">
							Pending Invitations
						</h4>
						<div className="flex flex-col gap-2">
							{data?.data.map((inv: InvitationSafe) => (
								<div
									key={inv.id}
									className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2.5"
								>
									<div className="flex flex-col gap-0.5">
										<span className="text-sm text-[var(--text-primary)]">
											{inv.email}
										</span>
										<span className="text-xs text-[var(--text-secondary)]">
											Expires{" "}
											{formatDistanceToNow(new Date(inv.expiresAt), {
												addSuffix: true,
											})}
										</span>
									</div>
									<Badge
										variant="outline"
										className={`text-xs border ${
											inv.acceptedAt
												? "bg-[var(--badge-in-stock)]/15 text-[var(--badge-in-stock)] border-[var(--badge-in-stock)]/30"
												: "bg-[var(--badge-low-stock)]/15 text-[var(--badge-low-stock)] border-[var(--badge-low-stock)]/30"
										}`}
									>
										{inv.acceptedAt ? "Accepted" : "Pending"}
									</Badge>
								</div>
							))}
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
