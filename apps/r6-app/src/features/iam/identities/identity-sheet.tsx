import type { IdentitySafe } from "@r6/schemas";
import { useEffect, useState } from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateIdentityForm } from "./forms/create-identity-form";
import { EditIdentityForm } from "./forms/edit-identity-form";
import { RolesTabContent } from "./manage-roles-sheet";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantId: string;
	identity?: IdentitySafe | null;
}

export function IdentitySheet({
	open,
	onOpenChange,
	tenantId,
	identity,
}: Props) {
	const isEdit = !!identity;
	const [activeTab, setActiveTab] = useState("details");

	// Reset to details tab each time the sheet opens
	useEffect(() => {
		if (open) setActiveTab("details");
	}, [open]);

	if (isEdit && identity) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent className="sm:max-w-md overflow-hidden animate-stagger-children">
					<SheetHeader>
						<SheetTitle>Edit Identity</SheetTitle>
					</SheetHeader>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="flex flex-col flex-1 overflow-hidden"
					>
						<TabsList className="mx-4 w-fit">
							<TabsTrigger value="details">Details</TabsTrigger>
							<TabsTrigger value="roles">Roles</TabsTrigger>
						</TabsList>
						<TabsContent
							value="details"
							forceMount
							className="flex-1 overflow-y-auto data-[state=inactive]:hidden"
						>
							<EditIdentityForm
								tenantId={tenantId}
								identity={identity}
								onSuccess={() => onOpenChange(false)}
							/>
						</TabsContent>
						<TabsContent
							value="roles"
							forceMount
							className="flex-1 flex flex-col overflow-hidden data-[state=inactive]:hidden"
						>
							<RolesTabContent
								tenantId={tenantId}
								identity={identity}
								open={open}
								active={activeTab === "roles"}
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
					<SheetTitle>New Identity</SheetTitle>
				</SheetHeader>
				<CreateIdentityForm
					tenantId={tenantId}
					onSuccess={() => onOpenChange(false)}
				/>
			</SheetContent>
		</Sheet>
	);
}
