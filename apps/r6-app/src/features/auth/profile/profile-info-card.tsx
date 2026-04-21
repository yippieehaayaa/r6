import { zodResolver } from "@hookform/resolvers/zod";
import { type UpdateProfileFormInput, UpdateProfileSchema } from "@r6/schemas";
import { Loader2Icon, ShieldCheckIcon, UserIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateProfileMutation } from "@/api/identity-and-access/me/mutations/update-profile";
import { useGetProfileQuery } from "@/api/identity-and-access/me/queries/get-profile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { SectionCard } from "./section-card";

function getInitials(username?: string): string {
	if (!username) return "?";
	return username
		.split(/[\s._-]/)
		.slice(0, 2)
		.map((s) => s[0]?.toUpperCase() ?? "")
		.join("");
}

export function ProfileInfoCard() {
	const { data: profile, isLoading } = useGetProfileQuery();
	const mutation = useUpdateProfileMutation();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting, isDirty },
	} = useForm<UpdateProfileFormInput>({
		resolver: zodResolver(UpdateProfileSchema),
		mode: "onTouched",
	});

	useEffect(() => {
		if (profile) {
			reset({
				firstName: profile.firstName,
				middleName: profile.middleName ?? "",
				lastName: profile.lastName,
				country: profile.country,
				username: profile.username,
			});
		}
	}, [profile, reset]);

	async function onSubmit(values: UpdateProfileFormInput) {
		try {
			await mutation.mutateAsync(values);
			toast.success("Profile updated successfully");
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	return (
		<SectionCard
			icon={<UserIcon className="size-4 text-white" />}
			title="Account Info"
			description="Your identity details"
		>
			{isLoading ? (
				<div className="flex flex-col gap-5">
					<div className="flex items-center gap-4 pb-5 border-b border-(--border)">
						<Skeleton className="size-16 rounded-2xl shrink-0" />
						<div className="flex flex-col gap-2">
							<Skeleton className="h-5 w-36" />
							<Skeleton className="h-3.5 w-48" />
							<Skeleton className="h-5 w-16 rounded-full" />
						</div>
					</div>
					<div className="flex flex-col gap-3">
						{["f1", "f2", "f3", "f4", "f5"].map((k) => (
							<Skeleton key={k} className="h-10 w-full rounded-xl" />
						))}
					</div>
				</div>
			) : (
				<div className="flex flex-col gap-5">
					{/* Avatar + identity row */}
					<div className="flex items-center gap-4 pb-5 border-b border-(--border)">
						<Avatar className="size-16 shrink-0 rounded-2xl shadow-sm">
							<AvatarFallback className="rounded-2xl text-xl font-bold bg-linear-to-br from-accent to-blue-700 text-white">
								{getInitials(profile?.username)}
							</AvatarFallback>
						</Avatar>
						<div className="flex min-w-0 flex-col gap-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-semibold text-(--text-primary) truncate">
									{profile?.firstName} {profile?.lastName}
								</span>
								<Badge
									variant="outline"
									className="capitalize text-[10px] h-4 px-1.5 shrink-0"
								>
									{profile?.kind.toLowerCase()}
								</Badge>
								{profile?.totpEnabled && (
									<Badge
										variant="default"
										className="gap-1 text-[10px] h-4 px-1.5 shrink-0"
									>
										<ShieldCheckIcon className="size-2.5" />
										2FA
									</Badge>
								)}
							</div>
							<span className="text-sm text-(--text-secondary) truncate">
								{profile?.email}
							</span>
						</div>
					</div>

					{/* Editable fields */}
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col gap-5"
					>
						<FieldGroup>
							<div className="grid gap-3 sm:grid-cols-3">
								<Field data-invalid={!!errors.firstName}>
									<FieldLabel htmlFor="pi-first">First Name</FieldLabel>
									<Input
										id="pi-first"
										placeholder="First name"
										className="h-10 rounded-xl bg-(--bg)"
										{...register("firstName")}
									/>
									<FieldError
										errors={errors.firstName ? [errors.firstName] : []}
									/>
								</Field>

								<Field data-invalid={!!errors.middleName}>
									<FieldLabel htmlFor="pi-middle">Middle Name</FieldLabel>
									<Input
										id="pi-middle"
										placeholder="Middle name"
										className="h-10 rounded-xl bg-(--bg)"
										{...register("middleName")}
									/>
									<FieldError
										errors={errors.middleName ? [errors.middleName] : []}
									/>
								</Field>

								<Field data-invalid={!!errors.lastName}>
									<FieldLabel htmlFor="pi-last">Last Name</FieldLabel>
									<Input
										id="pi-last"
										placeholder="Last name"
										className="h-10 rounded-xl bg-(--bg)"
										{...register("lastName")}
									/>
									<FieldError
										errors={errors.lastName ? [errors.lastName] : []}
									/>
								</Field>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<Field data-invalid={!!errors.username}>
									<FieldLabel htmlFor="pi-username">Username</FieldLabel>
									<Input
										id="pi-username"
										placeholder="username"
										className="h-10 rounded-xl bg-(--bg)"
										{...register("username")}
									/>
									<FieldError
										errors={errors.username ? [errors.username] : []}
									/>
								</Field>

								<Field data-invalid={!!errors.country}>
									<FieldLabel htmlFor="pi-country">Country (ISO)</FieldLabel>
									<Input
										id="pi-country"
										placeholder="PH"
										maxLength={2}
										className="h-10 rounded-xl bg-(--bg) uppercase"
										{...register("country")}
									/>
									<FieldError errors={errors.country ? [errors.country] : []} />
								</Field>
							</div>
						</FieldGroup>

						<div className="flex justify-end">
							<Button
								type="submit"
								disabled={isSubmitting || !isDirty}
								variant="accent"
								className="rounded-xl"
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
						</div>
					</form>
				</div>
			)}
		</SectionCard>
	);
}
