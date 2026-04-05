import type { Tenant } from "@r6/schemas";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { CreateTenantForm } from "./forms/create-tenant-form";
import { EditTenantForm } from "./forms/edit-tenant-form";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenant?: Tenant | null;
}

export function TenantSheet({ open, onOpenChange, tenant }: Props) {
	const isEdit = !!tenant;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>{isEdit ? "Edit Tenant" : "New Tenant"}</SheetTitle>
				</SheetHeader>
				{isEdit && tenant ? (
					<EditTenantForm
						tenant={tenant}
						onSuccess={() => onOpenChange(false)}
					/>
				) : (
					<CreateTenantForm onSuccess={() => onOpenChange(false)} />
				)}
			</SheetContent>
		</Sheet>
	);
}
