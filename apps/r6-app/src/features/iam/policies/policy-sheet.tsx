import type { Policy } from "@r6/schemas";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { CreatePolicyForm } from "./forms/create-policy-form";
import { EditPolicyForm } from "./forms/edit-policy-form";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantSlug: string;
	policy?: Policy | null;
}

export function PolicySheet({ open, onOpenChange, tenantSlug, policy }: Props) {
	const isEdit = !!policy;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>{isEdit ? "Edit Policy" : "New Policy"}</SheetTitle>
				</SheetHeader>
				{isEdit && policy ? (
					<EditPolicyForm
						tenantSlug={tenantSlug}
						policy={policy}
						onSuccess={() => onOpenChange(false)}
					/>
				) : (
					<CreatePolicyForm
						tenantSlug={tenantSlug}
						onSuccess={() => onOpenChange(false)}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
