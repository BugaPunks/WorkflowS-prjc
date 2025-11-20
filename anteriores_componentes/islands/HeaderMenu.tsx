import { useSession } from "../hooks/useSession.ts";

export default function HeaderMenu() {
  const { loading, isAuthenticated, permissions } = useSession();

  // Determinar la URL de inicio según si el usuario está autenticado
  const homeUrl = isAuthenticated ? "/welcome" : "/";

  // Mostrar un indicador de carga mientras se verifica la sesión
  if (loading) {
    return (
      <nav>
        <ul class="flex space-x-6">
          <li>
            <a href="/" class="hover:underline">
              Inicio
            </a>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav>
      <ul class="flex space-x-6">
        <li>
          <a href={homeUrl} class="hover:underline">
            Inicio
          </a>
        </li>
        {isAuthenticated && (
          <>
            <li>
              <a href="/projects" class="hover:underline">
                Proyectos
              </a>
            </li>
            <li>
              <a href="/my-tasks" class="hover:underline">
                Mis Tareas
              </a>
            </li>
          </>
        )}
        {permissions.canViewBacklog && (
          <li>
            <a href="/backlog" class="hover:underline">
              Backlog
            </a>
          </li>
        )}
        {permissions.canManageUsers && (
          <li>
            <a href="/admin/users" class="hover:underline">
              Usuarios
            </a>
          </li>
        )}
        <li>
          <a href="/about" class="hover:underline">
            Acerca de
          </a>
        </li>
      </ul>
    </nav>
  );
}
