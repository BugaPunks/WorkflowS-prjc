import type React from "react";
import NavigationSidebar from "@/components/NavigationSidebar";
import SidebarProvider from "@/islands/SidebarProvider";

interface AppShellProps {
	children: React.ReactNode;
	variant?: "header" | "sidebar";
	user?: { id: string; name: string; email: string; role: string };
}

// Componente SidebarLayout que combina SidebarProvider y NavigationSidebar
function SidebarLayout({
	children,
	user,
}: {
	children: React.ReactNode;
	user?: { id: string; name: string; email: string; role: string };
}) {
	return (
		<SidebarProvider defaultOpen={true}>
			<div className="flex min-h-screen w-full">
				<NavigationSidebar isOpen={true} user={user} />
				<main className="flex-1 lg:ml-0">{children}</main>
			</div>
		</SidebarProvider>
	);
}

function AppShellComponent({
	children,
	variant = "sidebar", // Cambiado a sidebar por defecto
	user,
}: AppShellProps): React.ReactElement {
	if (variant === "header") {
		return <div className="flex min-h-screen w-full flex-col">{children}</div>;
	}

	return <SidebarLayout user={user}>{children}</SidebarLayout>;
}

export default AppShellComponent;
export { AppShellComponent as AppShell };
