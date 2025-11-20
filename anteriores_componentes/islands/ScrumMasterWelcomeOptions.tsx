import DropdownMenu, { type DropdownMenuSection } from "./DropdownMenu.tsx";

export default function ScrumMasterWelcomeOptions() {
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

  // Menú de sprints
  const sprintsSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Crear nuevo sprint", href: "/sprints/create" },
        { label: "Todos los sprints", href: "/sprints" },
        { label: "Sprints activos", href: "/sprints?filter=in_progress" },
        { label: "Historial de sprints", href: "/sprints?filter=completed" },
        { label: "Planificar sprint", href: "/sprints/plan" },
      ],
    },
  ];

  // Menú de reuniones
  const meetingsSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Daily Scrum", href: "/meetings/daily" },
        { label: "Planificación de Sprint", href: "/meetings/planning" },
        { label: "Revisión de Sprint", href: "/meetings/review" },
        { label: "Retrospectiva", href: "/meetings/retrospective" },
      ],
    },
    {
      items: [{ label: "Programar reunión", href: "/meetings/schedule" }],
    },
  ];

  // Menú de impedimentos
  const impedimentsSections: DropdownMenuSection[] = [
    {
      items: [
        { label: "Registrar impedimento", href: "/impediments/create" },
        { label: "Impedimentos activos", href: "/impediments?filter=active" },
        { label: "Impedimentos resueltos", href: "/impediments?filter=resolved" },
      ],
    },
    {
      items: [{ label: "Asignar responsable", href: "/impediments/assign" }],
    },
  ];

  // Icono personalizado para sprints
  const sprintIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      class="w-4 h-4"
      aria-hidden="true"
      role="img"
    >
      <title>Icono de sprint</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
      />
    </svg>
  );

  return (
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Panel de Scrum Master</h2>
        <p class="text-gray-600 mb-6">
          Como Scrum Master, eres responsable de facilitar el proceso Scrum y ayudar al equipo a
          mejorar continuamente.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta de Mis Proyectos */}
          <div class="bg-blue-50 p-5 rounded-lg border border-blue-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-blue-800">Mis Proyectos</h3>
                <p class="text-gray-600 mt-1">
                  Visualiza y gestiona los proyectos donde eres Scrum Master.
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
                role="img"
              >
                <title>Icono de proyecto</title>
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
                Ver proyectos →
              </a>
              <DropdownMenu buttonText="Opciones" sections={projectsSections} className="ml-2" />
            </div>
          </div>

          {/* Tarjeta de Sprints */}
          <div class="bg-purple-50 p-5 rounded-lg border border-purple-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-purple-800">Gestionar Sprints</h3>
                <p class="text-gray-600 mt-1">
                  Planifica y administra los sprints de tus proyectos.
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
                role="img"
              >
                <title>Icono de sprint</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div class="flex justify-between items-center">
              <a href="/sprints" class="text-purple-600 hover:underline">
                Ver todos los sprints →
              </a>
              <DropdownMenu
                buttonText="Opciones"
                sections={sprintsSections}
                buttonIcon={sprintIcon}
                className="ml-2"
              />
            </div>
          </div>

          {/* Tarjeta de Reuniones */}
          <div class="bg-green-50 p-5 rounded-lg border border-green-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-green-800">Reuniones Scrum</h3>
                <p class="text-gray-600 mt-1">Programa y gestiona las reuniones del equipo.</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
                role="img"
              >
                <title>Icono de calendario</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="flex justify-between items-center">
              <a href="/meetings" class="text-green-600 hover:underline">
                Gestionar reuniones →
              </a>
              <DropdownMenu buttonText="Opciones" sections={meetingsSections} className="ml-2" />
            </div>
          </div>

          {/* Tarjeta de Impedimentos */}
          <div class="bg-amber-50 p-5 rounded-lg border border-amber-200">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="font-bold text-lg text-amber-800">Impedimentos</h3>
                <p class="text-gray-600 mt-1">
                  Registra y da seguimiento a los impedimentos del equipo.
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
                role="img"
              >
                <title>Icono de advertencia</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div class="flex justify-between items-center">
              <a href="/impediments" class="text-amber-600 hover:underline">
                Ver impedimentos →
              </a>
              <DropdownMenu buttonText="Opciones" sections={impedimentsSections} className="ml-2" />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4 text-gray-800">Acciones Rápidas</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/sprints/create"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
              role="img"
            >
              <title>Icono de nuevo sprint</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Nuevo Sprint</span>
          </a>
          <a
            href="/meetings/schedule"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
              role="img"
            >
              <title>Icono de programar reunión</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Programar Reunión</span>
          </a>
          <a
            href="/impediments/create"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
              role="img"
            >
              <title>Icono de impedimento</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Registrar Impedimento</span>
          </a>
          <a
            href="/meetings/daily"
            class="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 mx-auto mb-2 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
              role="img"
            >
              <title>Icono de daily scrum</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">Daily Scrum</span>
          </a>
        </div>
      </div>
    </div>
  );
}
