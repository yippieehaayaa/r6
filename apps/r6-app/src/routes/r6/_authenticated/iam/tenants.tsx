import { createFileRoute } from "@tanstack/react-router";
import TenantsPage from "@/features/tenants/page";

export const Route = createFileRoute("/r6/_authenticated/iam/tenants")({
	component: TenantsPage,
});
