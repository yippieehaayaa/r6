import { useState } from "react";
import { variants } from "../data/mock-data";
import { VariantsTable } from "./variants-table";

export default function VariantsPage() {
	const [search, setSearch] = useState("");

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div>
				<h1 className="text-xl font-semibold">Variants</h1>
				<p className="text-sm text-muted-foreground">
					All product variants — the atomic sellable and stockable units in your
					catalog.
				</p>
			</div>

			<div className="rounded-xl border bg-card p-4">
				<VariantsTable
					data={variants}
					filterValue={search}
					onFilterChange={setSearch}
				/>
			</div>
		</div>
	);
}
