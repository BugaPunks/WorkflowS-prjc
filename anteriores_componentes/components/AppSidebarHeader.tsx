import type { JSX } from "preact";
import { SidebarTrigger } from "./ui/sidebar.tsx";

export function AppSidebarHeader(): JSX.Element {
  return (
    <header class="border-gray-200 flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
      <div class="flex items-center gap-2">
        <SidebarTrigger class="-ml-1" />
        <div class="flex items-center">
          <h1 class="text-lg font-semibold">WorkflowS</h1>
        </div>
      </div>
    </header>
  );
}
