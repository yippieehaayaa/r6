import { LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/auth";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LogoutMenuItem() {
	const { logout } = useAuth();
	const navigate = useNavigate();

	async function handleLogout() {
		await logout();
		navigate({ to: "/login", replace: true });
	}

	return (
		<DropdownMenuItem onSelect={handleLogout}>
			<LogOut />
			Log out
		</DropdownMenuItem>
	);
}
