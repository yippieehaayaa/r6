import type { IdentitySafe } from "@r6/schemas";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { CreateIdentityForm } from "./forms/create-identity-form";
import { EditIdentityForm } from "./forms/edit-identity-form";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantSlug: string;
	identity?: IdentitySafe | null;
}

export function IdentitySheet({
	open,
	onOpenChange,
	tenantSlug,
	identity,
}: Props) {
	const isEdit = !!identity;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>{isEdit ? "Edit Identity" : "New Identity"}</SheetTitle>
				</SheetHeader>
				{isEdit && identity ? (
					<EditIdentityForm
						tenantSlug={tenantSlug}
						identity={identity}
						onSuccess={() => onOpenChange(false)}
					/>
				) : (
					<CreateIdentityForm
						tenantSlug={tenantSlug}
						onSuccess={() => onOpenChange(false)}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
