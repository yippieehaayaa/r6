import { useState } from "react";
import { categories } from "../data/mock-data";
import { CategoriesTable } from "./categories-table";

export default function CategoriesPage() {
	const [search, setSearch] = useState("");

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div>
				<h1 className="text-xl font-semibold">Categories</h1>
				<p className="text-sm text-muted-foreground">
					Hierarchical product taxonomy. Categories organize products for
					navigation and reporting.
				</p>
			</div>

			<div className="rounded-xl border bg-card p-4">
				<CategoriesTable
					data={categories}
					filterValue={search}
					onFilterChange={setSearch}
				/>
			</div>
		</div>
	);
}
