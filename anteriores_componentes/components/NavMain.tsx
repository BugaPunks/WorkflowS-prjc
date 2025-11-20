import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { UserRole } from "../models/user.ts";
import { MaterialIcon } from "./ui/MaterialIcon.tsx";
import { LayoutGridIcon } from "./ui/icons/LayoutGridIcon.tsx";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar.tsx";

interface NavMainProps {
  userRole?: UserRole;
}

export function NavMain({ userRole }: NavMainProps): JSX.Element {
  // Obtener la URL actual para marcar el elemento activo
  // En Fresh, no podemos acceder a location durante el renderizado del servidor
  // Usaremos un estado que se actualizará en el cliente
  const [currentPath, setCurrentPath] = useState("");

  // Solo ejecutar en el cliente
  useEffect(() => {
    if (
      typeof globalThis !== "undefined" &&
      "location" in globalThis &&
      globalThis.location &&
      globalThis.location.pathname
    ) {
      setCurrentPath(globalThis.location.pathname);
    }
  }, []);

  // Verificar si el usuario es un profesor (admin, product owner o scrum master)
  const isTeacher =
    userRole === UserRole.ADMIN ||
    userRole === UserRole.PRODUCT_OWNER ||
    userRole === UserRole.SCRUM_MASTER;

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/welcome",
      icon: LayoutGridIcon,
    },
    {
      title: "Proyectos",
      href: "/projects",
      icon: LayoutGridIcon,
    },
    {
      title: "Mis Tareas",
      href: "/my-tasks",
      icon: LayoutGridIcon,
    },
  ];

  // Elementos de navegación para profesores
  const teacherNavItems = isTeacher
    ? [
        {
          title: "Rúbricas",
          href: "/rubrics",
          icon: () => <MaterialIcon icon="assignment" />,
        },
      ]
    : [];

  return (
    <>
      <SidebarGroup class="px-2 py-0">
        <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton isActive={item.href === currentPath}>
                <a href={item.href} class="flex items-center w-full">
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {isTeacher && (
        <SidebarGroup class="px-2 py-0 mt-4">
          <SidebarGroupLabel>Herramientas de Profesor</SidebarGroupLabel>
          <SidebarMenu>
            {teacherNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton isActive={currentPath.startsWith(item.href)}>
                  <a href={item.href} class="flex items-center w-full">
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  );
}
