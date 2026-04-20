import { createFileRoute } from "@tanstack/react-router";
import IamPage from "@/features/iam/page";

export const Route = createFileRoute("/r6/_authenticated/iam/")({
	component: IamPage,
});
