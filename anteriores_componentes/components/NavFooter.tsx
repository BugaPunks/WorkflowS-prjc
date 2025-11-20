import type { JSX } from "preact";
import { SidebarGroup, SidebarMenu } from "./ui/sidebar.tsx";

interface NavFooterProps {
  class?: string;
}

export function NavFooter({ class: className = "" }: NavFooterProps): JSX.Element {
  // Se han eliminado las opciones de Documentación y Repositorio
  return (
    <SidebarGroup class={`px-2 py-0 ${className}`}>
      <SidebarMenu>{/* No hay elementos en el footer */}</SidebarMenu>
    </SidebarGroup>
  );
}
