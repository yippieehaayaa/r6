import type { Role } from "@r6/schemas";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { CreateRoleForm } from "./forms/create-role-form";
import { EditRoleForm } from "./forms/edit-role-form";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantSlug: string;
	role?: Role | null;
}

export function RoleSheet({ open, onOpenChange, tenantSlug, role }: Props) {
	const isEdit = !!role;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto">
				<SheetHeader>
					<SheetTitle>{isEdit ? "Edit Role" : "New Role"}</SheetTitle>
				</SheetHeader>
				{isEdit && role ? (
					<EditRoleForm
						tenantSlug={tenantSlug}
						role={role}
						onSuccess={() => onOpenChange(false)}
					/>
				) : (
					<CreateRoleForm
						tenantSlug={tenantSlug}
						tenantId={null}
						onSuccess={() => onOpenChange(false)}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
}
