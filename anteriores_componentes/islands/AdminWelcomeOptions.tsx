import DropdownMenu, { type DropdownMenuSection } from "./DropdownMenu.tsx";
import InteractiveWelcomeCard from "./welcome/InteractiveWelcomeCard.tsx";

export default function AdminWelcomeOptions() {
  // Menú de gestión de usuarios
  const userManagementSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Ver todos los usuarios", href: "/admin/users" },
        { label: "Crear nuevo usuario", href: "/admin/users?action=create" },
        { label: "Gestionar roles", href: "/admin/roles" },
      ],
    },
    {
      items: [
        { label: "Exportar lista de usuarios", onClick: () => console.log("Exportar usuarios") },
      ],
    },
  ];

  // Menú de gestión de proyectos
  const projectManagementSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Ver todos los proyectos", href: "/projects" },
        { label: "Crear nuevo proyecto", href: "/projects?action=create" },
        { label: "Proyectos archivados", href: "/projects?filter=archived" },
      ],
    },
    {
      items: [{ label: "Asignar usuarios a proyectos", href: "/projects/assign" }],
    },
  ];

  // Menú de reportes y estadísticas
  const reportsSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Resumen general", href: "/reports/dashboard" },
        { label: "Rendimiento por proyecto", href: "/reports/performance" },
        { label: "Actividad de usuarios", href: "/reports/user-activity" },
        { label: "Progreso de sprints", href: "/reports/sprints" },
      ],
    },
    {
      items: [{ label: "Exportar reportes", onClick: () => console.log("Exportar reportes") }],
    },
  ];

  // Menú de configuración
  const configSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Configuración general", href: "/admin/settings" },
        { label: "Personalización", href: "/admin/settings/customization" },
        { label: "Notificaciones", href: "/admin/settings/notifications" },
        { label: "Seguridad", href: "/admin/settings/security" },
      ],
    },
    {
      items: [
        {
          label: "Restablecer configuración",
          isDanger: true,
          onClick: () => console.log("Restablecer configuración"),
        },
      ],
    },
  ];

  // Iconos personalizados
  const reportsIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      class="w-4 h-4"
      aria-labelledby="reportsIconTitle"
      role="img"
    >
      <title id="reportsIconTitle">Reportes y estadísticas</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  );

  return (
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Panel de Administración</h2>
        <p class="text-gray-600 mb-6">
          Como administrador, tienes acceso completo a todas las funcionalidades del sistema.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta de Gestión de Usuarios */}
          <InteractiveWelcomeCard
            title="Administrar Usuarios"
            description="Gestiona los usuarios del sistema y sus roles."
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-labelledby="userManagementIconTitle"
                role="img"
              >
                <title id="userManagementIconTitle">Administrar Usuarios</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
            linkText="Ir a usuarios"
            linkHref="/admin/users"
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            textColor="text-purple-800"
            dropdownSections={userManagementSections}
            dropdownButtonText="Opciones"
          />

          {/* Tarjeta de Gestión de Proyectos */}
          <div class="bg-blue-50 p-5 rounded-lg border border-blue-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-blue-800">Gestionar Proyectos</h3>
                <p class="text-gray-600 mt-1">Crea y administra proyectos Scrum.</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-labelledby="projectManagementIconTitle"
                role="img"
              >
                <title id="projectManagementIconTitle">Gestionar Proyectos</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div class="flex justify-between items-center">
              <a href="/projects" class="text-blue-600 hover:underline">
                Ir a proyectos →
              </a>
              <DropdownMenu
                buttonText="Opciones"
                sections={projectManagementSections}
                className="ml-2"
              />
            </div>
          </div>

          {/* Tarjeta de Reportes y Estadísticas */}
          <div class="bg-green-50 p-5 rounded-lg border border-green-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-green-800">Reportes y Estadísticas</h3>
                <p class="text-gray-600 mt-1">Visualiza métricas y reportes de progreso.</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-labelledby="reportsStatsIconTitle"
                role="img"
              >
                <title id="reportsStatsIconTitle">Reportes y Estadísticas</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div class="flex justify-between items-center">
              <a href="/reports" class="text-green-600 hover:underline">
                Ver reportes →
              </a>
              <DropdownMenu
                buttonText="Opciones"
                sections={reportsSections}
                buttonIcon={reportsIcon}
                className="ml-2"
              />
            </div>
          </div>

          {/* Tarjeta de Configuración */}
          <div class="bg-amber-50 p-5 rounded-lg border border-amber-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-amber-800">Configuración</h3>
                <p class="text-gray-600 mt-1">Personaliza la configuración del sistema.</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-labelledby="configIconTitle"
                role="img"
              >
                <title id="configIconTitle">Configuración</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div class="flex justify-between items-center">
              <a href="/admin/settings" class="text-amber-600 hover:underline">
                Ir a configuración →
              </a>
              <DropdownMenu buttonText="Opciones" sections={configSections} className="ml-2" />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Acciones Rápidas</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/users?action=create"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-labelledby="createUserIconTitle"
              role="img"
            >
              <title id="createUserIconTitle">Crear Usuario</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Crear Usuario</span>
          </a>
          <a
            href="/projects?action=create"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-labelledby="createProjectIconTitle"
              role="img"
            >
              <title id="createProjectIconTitle">Crear Proyecto</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Crear Proyecto</span>
          </a>
          <a
            href="/reports/dashboard"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-labelledby="dashboardIconTitle"
              role="img"
            >
              <title id="dashboardIconTitle">Dashboard</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Dashboard</span>
          </a>
          <a
            href="/admin/settings"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-labelledby="settingsIconTitle"
              role="img"
            >
              <title id="settingsIconTitle">Configuración</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Configuración</span>
          </a>
        </div>
      </div>
    </div>
  );
}
