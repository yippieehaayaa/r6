import { createFileRoute } from "@tanstack/react-router";
import ProductsPage from "@/features/catalog/products/page";

export const Route = createFileRoute(
	"/r6/_authenticated/inventory-and-catalog/products",
)({
	component: ProductsPage,
});
