import type { Role } from "@r6/schemas";
import { useEffect, useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateRoleForm } from "./forms/create-role-form";
import { EditRoleForm } from "./forms/edit-role-form";
import { PoliciesTabContent } from "./manage-policies-sheet";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantSlug: string;
	role?: Role | null;
}

export function RoleSheet({ open, onOpenChange, tenantSlug, role }: Props) {
	const isEdit = !!role;
	const [activeTab, setActiveTab] = useState("details");

	// Reset to details tab each time the sheet opens
	useEffect(() => {
		if (open) setActiveTab("details");
	}, [open]);

	if (isEdit && role) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-md overflow-hidden animate-stagger-children">
					<SheetHeader>
						<SheetTitle>Edit Role</SheetTitle>
					</SheetHeader>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="flex flex-col flex-1 overflow-hidden"
					>
						<TabsList className="mx-4 w-fit">
							<TabsTrigger value="details">Details</TabsTrigger>
							<TabsTrigger value="policies">Policies</TabsTrigger>
						</TabsList>
						<TabsContent
							value="details"
							forceMount
							className="flex-1 overflow-y-auto data-[state=inactive]:hidden"
						>
							<EditRoleForm
								tenantSlug={tenantSlug}
								role={role}
								onSuccess={() => onOpenChange(false)}
							/>
						</TabsContent>
						<TabsContent
							value="policies"
							forceMount
							className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden"
						>
							<PoliciesTabContent
								tenantSlug={tenantSlug}
								role={role}
								open={open}
								active={activeTab === "policies"}
							/>
						</TabsContent>
					</Tabs>
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>New Role</SheetTitle>
				</SheetHeader>
				<CreateRoleForm
					tenantSlug={tenantSlug}
					tenantId={null}
					onSuccess={() => onOpenChange(false)}
				/>
			</SheetContent>
		</Sheet>
	);
}
