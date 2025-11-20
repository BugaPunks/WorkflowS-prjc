import type { JSX } from "preact";
import { AppLogo } from "../components/AppLogo.tsx";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar.tsx";
import type { UserRole } from "../models/user.ts";
import NavFooterExternal from "./NavFooterExternal.tsx";
import NavMain from "./NavMain.tsx";
import NavUser from "./NavUser.tsx";

interface AppSidebarExternalProps {
  userRole?: UserRole;
}

export default function AppSidebarExternal({
  userRole,
}: AppSidebarExternalProps = {}): JSX.Element {
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
        <NavFooterExternal class="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
