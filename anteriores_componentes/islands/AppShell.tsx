import type { JSX } from "preact";
import type { ComponentChildren } from "preact";
import SidebarProvider from "./SidebarProvider.tsx";

interface AppShellProps {
  children: ComponentChildren;
  variant?: "header" | "sidebar";
}

export default function AppShell({ children, variant = "header" }: AppShellProps): JSX.Element {
  // En un entorno real, podrías obtener este valor de una cookie o estado global
  const isOpen = true;

  if (variant === "header") {
    return <div class="flex min-h-screen w-full flex-col">{children}</div>;
  }

  return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
