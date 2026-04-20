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
	tenantId: string;
	policy?: Policy | null;
}

export function PolicySheet({ open, onOpenChange, tenantId, policy }: Props) {
	const isEdit = !!policy;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>{isEdit ? "Edit Policy" : "New Policy"}</SheetTitle>
				</SheetHeader>
				{isEdit && policy ? (
					<EditPolicyForm
						tenantId={tenantId}
						policy={policy}
						onSuccess={() => onOpenChange(false)}
					/>
				) : (
					<CreatePolicyForm tenantId={tenantId} onSuccess={() => onOpenChange(false)} />
				)}
			</SheetContent>
		</Sheet>
	);
}
