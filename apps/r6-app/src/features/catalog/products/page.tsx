import { useState } from "react";
import { products } from "../data/mock-data";
import { ProductsTable } from "./products-table";

export default function ProductsPage() {
	const [search, setSearch] = useState("");

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div>
				<h1 className="text-xl font-semibold">Products</h1>
				<p className="text-sm text-muted-foreground">
					Manage your product catalog. Products group one or more sellable
					variants.
				</p>
			</div>

			<div className="rounded-xl border bg-card p-4">
				<ProductsTable
					data={products}
					filterValue={search}
					onFilterChange={setSearch}
				/>
			</div>
		</div>
	);
}
