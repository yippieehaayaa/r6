import { createFileRoute } from "@tanstack/react-router";
import IdentitiesPage from "@/features/iam/identities/page";

export const Route = createFileRoute("/r6/_authenticated/iam/identities")({
	component: IdentitiesPage,
});
