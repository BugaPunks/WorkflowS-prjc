import type { JSX } from "preact";
import { SidebarGroup, SidebarMenu } from "../components/ui/sidebar.tsx";

interface NavFooterProps {
  class?: string;
}

export default function NavFooterExternal({ class: className = "" }: NavFooterProps): JSX.Element {
  // Se han eliminado las opciones de Documentación, Repositorio y Ayuda
  return (
    <SidebarGroup class={`px-2 py-0 ${className}`}>
      <SidebarMenu>{/* No hay elementos en el footer */}</SidebarMenu>
    </SidebarGroup>
  );
}
