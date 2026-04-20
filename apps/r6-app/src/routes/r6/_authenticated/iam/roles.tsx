import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/r6/_authenticated/iam/roles")({ 
	beforeLoad: () => {
		throw redirect({ to: "/r6/_authenticated/iam/policies" });
	},
});

