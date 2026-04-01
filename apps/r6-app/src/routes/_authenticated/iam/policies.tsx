import { createFileRoute } from "@tanstack/react-router";
import PoliciesPage from "@/features/iam/policies/page";

export const Route = createFileRoute("/_authenticated/iam/policies")({
	component: PoliciesPage,
});
