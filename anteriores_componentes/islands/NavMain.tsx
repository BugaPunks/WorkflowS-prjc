import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { MaterialIcon } from "../components/ui/MaterialIcon.tsx";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar.tsx";
import { UserRole } from "../models/user.ts";

interface NavMainProps {
  userRole?: UserRole;
}

export default function NavMain({ userRole }: NavMainProps = {}): JSX.Element {
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

  // Función para determinar si un elemento está activo
  const isItemActive = (href: string): boolean => {
    if (!currentPath) return false;

    // Para rutas exactas como /welcome, /chat, etc.
    if (href === currentPath) return true;

    // Para rutas que pueden tener subrutas
    if (href !== "/welcome" && currentPath.startsWith(`${href}/`)) return true;

    return false;
  };

  // Verificar si el usuario es un profesor (admin, product owner o scrum master)
  const isTeacher =
    userRole === UserRole.ADMIN ||
    userRole === UserRole.PRODUCT_OWNER ||
    userRole === UserRole.SCRUM_MASTER;

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/welcome",
      iconName: "dashboard",
    },
    {
      title: "Proyectos",
      href: "/projects",
      iconName: "folder",
    },
    {
      title: "Mis Tareas",
      href: "/my-tasks",
      iconName: "task",
    },

    {
      title: "Backlog",
      href: "/backlog",
      iconName: "list_alt",
    },
    {
      title: "Sprints",
      href: "/sprints",
      iconName: "bolt",
    },
    {
      title: "Mis Evaluaciones",
      href: "/my-evaluations",
      iconName: "grade",
    },
    {
      title: "Usuarios",
      href: "/admin/users",
      iconName: "group",
    },
  ];

  // Elementos de navegación para profesores
  const teacherNavItems = isTeacher
    ? [
        {
          title: "Rúbricas",
          href: "/rubrics",
          iconName: "assignment",
        },
        {
          title: "Evaluaciones",
          href: "/evaluations",
          iconName: "grading",
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
              <SidebarMenuButton isActive={isItemActive(item.href)}>
                <a href={item.href} class="flex items-center w-full">
                  <MaterialIcon icon={item.iconName} class="mr-2" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      {isTeacher && teacherNavItems.length > 0 && (
        <SidebarGroup class="px-2 py-0 mt-4">
          <SidebarGroupLabel>Herramientas de Profesor</SidebarGroupLabel>
          <SidebarMenu>
            {teacherNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton isActive={isItemActive(item.href)}>
                  <a href={item.href} class="flex items-center w-full">
                    <MaterialIcon icon={item.iconName} class="mr-2" />
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
