import type { Policy } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useCreatePolicyMutation,
	useUpdatePolicyMutation,
} from "@/api/policies";
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
	policy?: Policy | null;
}

function linesToArray(text: string): string[] {
	return text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);
}

export function PolicySheet({ open, onOpenChange, tenantSlug, policy }: Props) {
	const isEdit = !!policy;
	const queryClient = useQueryClient();

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [effect, setEffect] = useState<"ALLOW" | "DENY">("ALLOW");
	const [permissions, setPermissions] = useState("");
	const [audience, setAudience] = useState("");

	useEffect(() => {
		if (policy) {
			setName(policy.name);
			setDescription(policy.description ?? "");
			setEffect(policy.effect);
			setPermissions(policy.permissions.join("\n"));
			setAudience(policy.audience.join("\n"));
		} else {
			setName("");
			setDescription("");
			setEffect("ALLOW");
			setPermissions("");
			setAudience("");
		}
	}, [policy]);

	const createMutation = useCreatePolicyMutation();
	const updateMutation = useUpdatePolicyMutation();
	const isPending = createMutation.isPending || updateMutation.isPending;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const permissionsArray = linesToArray(permissions);
		const audienceArray = linesToArray(audience);

		if (isEdit && policy) {
			updateMutation.mutate(
				{
					tenantSlug,
					id: policy.id,
					body: {
						name: name || undefined,
						description: description || null,
						effect,
						permissions: permissionsArray.length ? permissionsArray : undefined,
						audience: audienceArray.length ? audienceArray : undefined,
					},
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({
							queryKey: ["policies", tenantSlug],
						});
						toast.success("Policy updated.");
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
						name,
						description: description || null,
						effect,
						permissions: permissionsArray,
						audience: audienceArray,
						conditions: null,
						tenantId: null,
					},
				},
				{
					onSuccess: () => {
						queryClient.invalidateQueries({
							queryKey: ["policies", tenantSlug],
						});
						toast.success("Policy created.");
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
					<SheetTitle>{isEdit ? "Edit Policy" : "New Policy"}</SheetTitle>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							placeholder="inventory-full-access"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="description">Description (optional)</Label>
						<textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
							placeholder="What does this policy allow or deny?"
							className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="effect">Effect</Label>
						<select
							id="effect"
							value={effect}
							onChange={(e) => setEffect(e.target.value as "ALLOW" | "DENY")}
							className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						>
							<option value="ALLOW">ALLOW</option>
							<option value="DENY">DENY</option>
						</select>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="permissions">
							Permissions{" "}
							<span className="text-muted-foreground font-normal">
								(one per line)
							</span>
						</Label>
						<textarea
							id="permissions"
							value={permissions}
							onChange={(e) => setPermissions(e.target.value)}
							rows={4}
							required={!isEdit}
							placeholder={"inventory:stock:read\ninventory:stock:write"}
							className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm font-mono outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
						/>
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor="audience">
							Audience{" "}
							<span className="text-muted-foreground font-normal">
								(one per line)
							</span>
						</Label>
						<textarea
							id="audience"
							value={audience}
							onChange={(e) => setAudience(e.target.value)}
							rows={3}
							required={!isEdit}
							placeholder={"inventory\nprocurement"}
							className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm font-mono outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
						/>
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
