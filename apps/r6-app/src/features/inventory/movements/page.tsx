import { useMemo, useState } from "react";
import { movements } from "../data/mock-data";
import { MovementsTable } from "./movements-table";

export default function MovementsPage() {
	const [search, setSearch] = useState("");

	const sorted = useMemo(
		() =>
			[...movements].sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			),
		[],
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div>
				<h1 className="text-xl font-semibold">Stock Movements</h1>
				<p className="text-sm text-muted-foreground">
					Complete ledger of all stock movements across warehouses.
				</p>
			</div>

			<div className="rounded-xl border bg-card p-4">
				<MovementsTable
					data={sorted}
					filterValue={search}
					onFilterChange={setSearch}
				/>
			</div>
		</div>
	);
}
