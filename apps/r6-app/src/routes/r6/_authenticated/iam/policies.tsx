import { createFileRoute } from "@tanstack/react-router";
import PoliciesPage from "@/features/iam/policies/page";

export const Route = createFileRoute("/r6/_authenticated/iam/policies")({
	component: PoliciesPage,
});
