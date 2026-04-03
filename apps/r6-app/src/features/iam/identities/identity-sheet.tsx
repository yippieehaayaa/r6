import type { IdentitySafe } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useCreateIdentityMutation,
	useUpdateIdentityMutation,
} from "@/api/identities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { getApiErrorMessage } from "@/lib/api-error";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantSlug: string;
	identity?: IdentitySafe | null;
}

const STATUS_OPTIONS = [
	"ACTIVE",
	"INACTIVE",
	"SUSPENDED",
	"PENDING_VERIFICATION",
] as const;

export function IdentitySheet({
	open,
	onOpenChange,
	tenantSlug,
	identity,
}: Props) {
	const isEdit = !!identity;
	const queryClient = useQueryClient();

	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [plainPassword, setPlainPassword] = useState("");
	const [status, setStatus] = useState<string>("ACTIVE");
	const [mustChangePassword, setMustChangePassword] = useState(false);

	useEffect(() => {
		if (identity) {
			setUsername(identity.username);
			setEmail(identity.email ?? "");
			setStatus(identity.status);
			setMustChangePassword(identity.mustChangePassword);
		} else {
			setUsername("");
			setEmail("");
			setPlainPassword("");
			setStatus("ACTIVE");
			setMustChangePassword(false);
		}
	}, [identity]);

	const createMutation = useCreateIdentityMutation();
	const updateMutation = useUpdateIdentityMutation();
	const isPending = createMutation.isPending || updateMutation.isPending;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (isEdit && identity) {
			updateMutation.mutate(
				{
					tenantSlug,
					id: identity.id,
					body: {
						username: username || undefined,
						email: email || undefined,
						status: status as IdentitySafe["status"],
						mustChangePassword,
					},
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({
							queryKey: ["identities", tenantSlug],
						});
						toast.success("Identity updated.");
						onOpenChange(false);
					},
					onError: (err) => toast.error(getApiErrorMessage(err)),
				},
			);
		} else {
			createMutation.mutate(
				{
					tenantSlug,
					body: {
						username,
						email: email || null,
						plainPassword,
						kind: "USER",
						mustChangePassword,
					},
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({
							queryKey: ["identities", tenantSlug],
						});
						toast.success("Identity created.");
						onOpenChange(false);
					},
					onError: (err) => toast.error(getApiErrorMessage(err)),
				},
			);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>{isEdit ? "Edit Identity" : "New Identity"}</SheetTitle>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="username">Username</Label>
						<Input
							id="username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							placeholder="john.doe"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="email">Email (optional)</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="john@example.com"
						/>
					</div>

					{!isEdit && (
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={plainPassword}
								onChange={(e) => setPlainPassword(e.target.value)}
								required
								placeholder="Min 8 chars, upper, lower, digit, special"
							/>
						</div>
					)}

					{isEdit && (
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="status">Status</Label>
							<select
								id="status"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
							>
								{STATUS_OPTIONS.map((s) => (
									<option key={s} value={s}>
										{s.replace("_", " ")}
									</option>
								))}
							</select>
						</div>
					)}

					<div className="flex items-center gap-2">
						<input
							id="mustChange"
							type="checkbox"
							checked={mustChangePassword}
							onChange={(e) => setMustChangePassword(e.target.checked)}
							className="size-4 rounded border-input"
						/>
						<Label
							htmlFor="mustChange"
							className="text-sm font-normal cursor-pointer"
						>
							Must change password on next login
						</Label>
					</div>
				</form>

				<SheetFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isPending}
						onClick={(e) => {
							const form = (e.target as HTMLElement)
								.closest("[data-slot=sheet-content]")
								?.querySelector("form");
							form?.requestSubmit();
						}}
					>
						{isPending ? "Saving…" : isEdit ? "Save changes" : "Create"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
