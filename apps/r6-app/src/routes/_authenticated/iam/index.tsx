import { createFileRoute } from "@tanstack/react-router";
import IamOverviewPage from "@/features/iam/overview/page";

export const Route = createFileRoute("/_authenticated/iam/")({
	component: IamOverviewPage,
});
