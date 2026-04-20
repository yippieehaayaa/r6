import { createFileRoute } from "@tanstack/react-router";
import AcceptInvitationPage from "@/features/invitations/accept-page";

export const Route = createFileRoute("/r6/invitations/$token")({
	component: function InvitationRoute() {
		const { token } = Route.useParams();
		return <AcceptInvitationPage token={token} />;
	},
});
