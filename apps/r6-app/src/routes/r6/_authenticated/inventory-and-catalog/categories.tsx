import { createFileRoute } from "@tanstack/react-router";
import CategoriesPage from "@/features/catalog/categories/page";

export const Route = createFileRoute(
	"/r6/_authenticated/inventory-and-catalog/categories",
)({
	component: CategoriesPage,
});
