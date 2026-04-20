import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateTenantInput, CreateTenantSchema } from "@r6/schemas";
import type { PaginationState } from "@tanstack/react-table";
import { BuildingIcon, Loader2Icon, MailIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateTenantMutation } from "@/api/identity-and-access/tenants/mutations/create";
import { useListInvitationsQuery } from "@/api/identity-and-access/tenants/queries/list-invitations";
import { useAuth } from "@/auth";
import { Can } from "@/components/can";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { InvitationsTable } from "./invitations-table";
import { InviteSheet } from "./invite-sheet";

// ── No tenant yet — create tenant form ───────────────────────

function CreateTenantCard() {
	const createTenantMutation = useCreateTenantMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreateTenantInput>({
		resolver: zodResolver(CreateTenantSchema),
		mode: "onTouched",
	});

	async function onSubmit(values: CreateTenantInput) {
		try {
			await createTenantMutation.mutateAsync(values);
			toast.success("Tenant created successfully");
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	return (
		<div className="flex flex-col items-center justify-center py-12 px-4">
			<div className="w-full max-w-md">
				<div className="relative">
					<div className="absolute inset-0 translate-y-2 translate-x-2 rounded-2xl bg-foreground/[0.04] dark:bg-foreground/[0.06] ring-1 ring-foreground/8 dark:ring-foreground/10" />
					<Card className="relative border-0 ring-1 ring-foreground/8 dark:ring-foreground/10">
						<CardHeader className="text-center pb-2 pt-8 px-8">
							<div className="mx-auto mb-4 size-12 rounded-2xl bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30 flex items-center justify-center">
								<BuildingIcon className="size-5 text-white" />
							</div>
							<CardTitle className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
								Create Your Tenant
							</CardTitle>
							<CardDescription className="text-sm text-[var(--text-secondary)] mt-1">
								Set up your organization to start managing identities and access
							</CardDescription>
						</CardHeader>
						<CardContent className="px-8 pb-8 pt-5">
							<form onSubmit={handleSubmit(onSubmit)}>
								<FieldGroup className="gap-4">
									<Field data-invalid={!!errors.name}>
										<FieldLabel
											htmlFor="tenant-name"
											className="text-[13px] font-medium text-[var(--text-primary)]"
										>
											Organization Name
										</FieldLabel>
										<Input
											id="tenant-name"
											placeholder="Acme Corporation"
											className="h-10 rounded-xl text-[15px] px-3.5"
											{...register("name")}
										/>
										<FieldError errors={errors.name ? [errors.name] : []} />
									</Field>
									<Field data-invalid={!!errors.slug}>
										<FieldLabel
											htmlFor="tenant-slug"
											className="text-[13px] font-medium text-[var(--text-primary)]"
										>
											Slug
										</FieldLabel>
										<Input
											id="tenant-slug"
											placeholder="acme-corp"
											className="h-10 rounded-xl text-[15px] px-3.5 lowercase"
											{...register("slug")}
										/>
										<FieldError errors={errors.slug ? [errors.slug] : []} />
									</Field>
									<Button
										type="submit"
										disabled={isSubmitting}
										className="w-full h-10 mt-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-[15px] font-medium shadow-md shadow-[var(--accent)]/20 transition-all border-0"
									>
										{isSubmitting ? (
											<>
												<Loader2Icon className="size-4 animate-spin" />
												Creating…
											</>
										) : (
											"Create Tenant"
										)}
									</Button>
								</FieldGroup>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

// ── Main page ─────────────────────────────────────────────────

export default function TenantsPage() {
	const { claims } = useAuth();
	const tenantId = claims?.tenantId ?? "";
	const hasTenant = !!tenantId;

	const [inviteOpen, setInviteOpen] = useState(false);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});
	const [search, setSearch] = useState("");

	const { data, isLoading } = useListInvitationsQuery(tenantId, {
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		includeAccepted: true,
	});

	if (!hasTenant) {
		return <CreateTenantCard />;
	}

	return (
		<div className="animate-apple-enter flex flex-col gap-6 p-6 md:p-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)] shadow-sm">
						<MailIcon className="size-4 text-white" />
					</div>
					<div>
						<h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
							Invitations
						</h1>
						<p className="text-sm text-muted-foreground">
							Manage tenant membership invitations
						</p>
					</div>
				</div>
				<Can permission="iam:invitation:create">
					<Button
						onClick={() => setInviteOpen(true)}
						className="rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0 shadow-sm"
					>
						<PlusIcon className="size-4" />
						Invite Member
					</Button>
				</Can>
			</div>

			{/* Table */}
			<InvitationsTable
				data={data?.data ?? []}
				isLoading={isLoading}
				rowCount={data?.total}
				paginationState={pagination}
				onPaginationChange={setPagination}
				globalFilterValue={search}
				onGlobalFilterChange={setSearch}
			/>

			{/* Sheet */}
			<InviteSheet
				tenantId={tenantId}
				open={inviteOpen}
				onOpenChange={setInviteOpen}
			/>
		</div>
	);
}
