import { createFileRoute } from "@tanstack/react-router";
import VariantsPage from "@/features/catalog/variants/page";

export const Route = createFileRoute(
	"/r6/_authenticated/inventory-and-catalog/variants",
)({
	component: VariantsPage,
});
