import { useAuth } from "@/auth";

interface CanProps {
	permission: string;
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
	const { hasPermission } = useAuth();
	return hasPermission(permission) ? children : fallback;
}
