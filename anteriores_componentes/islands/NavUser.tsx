import type { JSX } from "preact";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar.tsx";
import { useSession } from "../hooks/useSession.ts";

export default function NavUser(): JSX.Element {
  const { session, loading, logout, isAuthenticated } = useSession();

  // Función para manejar el cierre de sesión
  const handleLogout = (e: Event) => {
    e.preventDefault();
    logout();
  };

  if (loading) {
    return (
      <SidebarGroup class="px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <div class="h-8 bg-gray-200 rounded-md animate-pulse" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  if (!isAuthenticated) {
    return (
      <SidebarGroup class="px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <a href="/login" class="flex items-center w-full">
                <span>Iniciar Sesión</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup class="px-2 py-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <div class="flex items-center w-full">
              <div class="bg-blue-600 text-white flex aspect-square size-6 items-center justify-center rounded-full mr-2">
                <span class="text-xs">{session?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <span>{session?.username}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <button type="button" onClick={handleLogout} class="flex items-center w-full text-red-500">
              <span>Cerrar Sesión</span>
            </button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
