import { Plus } from "lucide-react";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";

// const { hasPermission } = useAuth(); // hasPermission("inventory:warehouse:read")

export default function WarehousesPage() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Warehouses</h1>
					<p className="text-sm text-muted-foreground">
						Manage your warehouse locations and capacity.
					</p>
				</div>
				<Button onClick={() => {}}>
					<Plus className="size-4" />
					Add Warehouse
				</Button>
			</div>

			<div className="rounded-xl border bg-card p-4">
				<DataTable columns={columns} data={[]} isLoading={false} />
			</div>
		</div>
	);
}
