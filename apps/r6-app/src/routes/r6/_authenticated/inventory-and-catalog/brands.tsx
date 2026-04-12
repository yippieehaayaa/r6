import { createFileRoute } from "@tanstack/react-router";
import BrandsPage from "@/features/catalog/brands/page";

export const Route = createFileRoute(
	"/r6/_authenticated/inventory-and-catalog/brands",
)({
	component: BrandsPage,
});
