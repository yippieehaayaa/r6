import { createFileRoute } from "@tanstack/react-router";
import VariantsPage from "@/features/inventory-and-catalog/variants/page";

export const Route = createFileRoute(
	"/r6/_authenticated/inventory-and-catalog/variants/",
)({
	component: VariantsPage,
});
