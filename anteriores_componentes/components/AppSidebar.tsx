import type { JSX } from "preact";
import type { UserRole } from "../models/user.ts";
import { AppLogo } from "./AppLogo.tsx";
import { NavFooter } from "./NavFooter.tsx";
import { NavMain } from "./NavMain.tsx";
import { NavUser } from "./NavUser.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar.tsx";

interface AppSidebarProps {
  userRole?: UserRole;
}

export function AppSidebar({ userRole }: AppSidebarProps): JSX.Element {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <a href="/welcome" class="flex items-center w-full">
                <AppLogo />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain userRole={userRole} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter class="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
