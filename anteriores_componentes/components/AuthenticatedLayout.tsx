import type { ComponentChildren } from "preact";
import { AppContent } from "../components/AppContent.tsx";
import { SidebarInset } from "../components/ui/sidebar.tsx";
import AppShellExternal from "../islands/AppShellExternal.tsx";
import AppSidebarExternal from "../islands/AppSidebarExternal.tsx";
import type { UserRole } from "../models/user.ts";

interface AuthenticatedLayoutProps {
  children: ComponentChildren;
  title?: string;
  session?: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

export function AuthenticatedLayout({
  children,
  title: _ = "WorkflowS",
  session,
}: AuthenticatedLayoutProps) {
  return (
    <AppShellExternal variant="sidebar">
      <AppSidebarExternal userRole={session?.role} />
      <SidebarInset>
        <AppContent variant="sidebar">{children}</AppContent>
        <footer class="bg-gray-100 py-4 text-center text-gray-600">
          <div class="container mx-auto">
            <p>&copy; {new Date().getFullYear()} WorkflowS.</p>
          </div>
        </footer>
      </SidebarInset>
    </AppShellExternal>
  );
}
