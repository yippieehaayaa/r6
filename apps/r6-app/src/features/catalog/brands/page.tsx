import { useState } from "react";
import { brands } from "../data/mock-data";
import { BrandsTable } from "./brands-table";

export default function BrandsPage() {
	const [search, setSearch] = useState("");

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div>
				<h1 className="text-xl font-semibold">Brands</h1>
				<p className="text-sm text-muted-foreground">
					Product brands and manufacturers in your catalog.
				</p>
			</div>

			<div className="rounded-xl border bg-card p-4">
				<BrandsTable
					data={brands}
					filterValue={search}
					onFilterChange={setSearch}
				/>
			</div>
		</div>
	);
}
