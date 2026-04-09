import { createFileRoute } from "@tanstack/react-router";
import DamageLossesPage from "@/features/inventory-and-catalog/damage-losses/page";

export const Route = createFileRoute(
	"/r6/_authenticated/inventory-and-catalog/damage-losses/",
)({
	component: DamageLossesPage,
});
