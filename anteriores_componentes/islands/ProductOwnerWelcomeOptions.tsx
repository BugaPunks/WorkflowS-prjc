import DropdownMenu, { type DropdownMenuSection } from "./DropdownMenu.tsx";

export default function ProductOwnerWelcomeOptions() {
  // Menú de proyectos
  const projectsSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Ver mis proyectos", href: "/projects" },
        { label: "Proyectos activos", href: "/projects?filter=active" },
        { label: "Proyectos completados", href: "/projects?filter=completed" },
      ],
    },
  ];

  // Menú de historias de usuario
  const userStoriesSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Ver todas las historias", href: "/user-stories" },
        { label: "Historias en backlog", href: "/user-stories?status=backlog" },
        { label: "Historias planificadas", href: "/user-stories?status=planned" },
        { label: "Historias en progreso", href: "/user-stories?status=in_progress" },
      ],
    },
    {
      items: [
        { label: "Historias en pruebas", href: "/user-stories?status=testing" },
        { label: "Historias completadas", href: "/user-stories?status=done" },
      ],
    },
  ];

  // Menú de backlog
  const backlogSections: DropdownMenuSection[] = [
    {
      items: [{ label: "Ver backlog", href: "/backlog" }],
    },
  ];

  // Menú de reportes
  const reportsSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Resumen de proyectos", href: "/reports/projects" },
        { label: "Progreso de sprints", href: "/reports/sprints" },
        { label: "Velocidad del equipo", href: "/reports/velocity" },
        { label: "Burndown charts", href: "/reports/burndown" },
      ],
    },
  ];

  // Icono personalizado para historias de usuario
  const userStoryIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      class="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  );

  return (
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Panel de Product Owner</h2>
        <p class="text-gray-600 mb-6">
          Como Product Owner, eres responsable de maximizar el valor del producto y gestionar el
          backlog.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta de Mis Proyectos */}
          <div class="bg-indigo-50 p-5 rounded-lg border border-indigo-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-indigo-800">Mis Proyectos</h3>
                <p class="text-gray-600 mt-1">
                  Visualiza y gestiona los proyectos donde eres Product Owner.
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div class="flex justify-between items-center">
              <a href="/projects" class="text-indigo-600 hover:underline">
                Ver proyectos →
              </a>
              <DropdownMenu buttonText="Opciones" sections={projectsSections} className="ml-2" />
            </div>
          </div>

          {/* Tarjeta de Historias de Usuario */}
          <div class="bg-green-50 p-5 rounded-lg border border-green-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-green-800">Historias de Usuario</h3>
                <p class="text-gray-600 mt-1">
                  Crea y prioriza historias de usuario para tus proyectos.
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div class="flex justify-between items-center">
              <a href="/user-stories" class="text-green-600 hover:underline">
                Ver historias →
              </a>
              <DropdownMenu
                buttonText="Opciones"
                sections={userStoriesSections}
                buttonIcon={userStoryIcon}
                className="ml-2"
              />
            </div>
          </div>

          {/* Tarjeta de Backlog */}
          <div class="bg-amber-50 p-5 rounded-lg border border-amber-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-amber-800">Backlog del Producto</h3>
                <p class="text-gray-600 mt-1">Administra el backlog y prioriza funcionalidades.</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div class="flex justify-between items-center">
              <a href="/backlog" class="text-amber-600 hover:underline">
                Ver backlog →
              </a>
              <DropdownMenu buttonText="Opciones" sections={backlogSections} className="ml-2" />
            </div>
          </div>

          {/* Tarjeta de Reportes */}
          <div class="bg-blue-50 p-5 rounded-lg border border-blue-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-blue-800">Reportes de Avance</h3>
                <p class="text-gray-600 mt-1">Visualiza el progreso y estado de tus proyectos.</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div class="flex justify-between items-center">
              <a href="/reports" class="text-blue-600 hover:underline">
                Ver reportes →
              </a>
              <DropdownMenu buttonText="Opciones" sections={reportsSections} className="ml-2" />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Acciones Rápidas</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/user-stories"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Historias de Usuario</span>
          </a>
          <a
            href="/backlog/prioritize"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Priorizar Backlog</span>
          </a>
          <a
            href="/backlog/plan-sprint"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Planificar Sprint</span>
          </a>
          <a
            href="/reports"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Ver Reportes</span>
          </a>
        </div>
      </div>
    </div>
  );
}
