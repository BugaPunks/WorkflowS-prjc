import { useState } from "preact/hooks";
import { ProjectRole } from "../../models/project.ts";

interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: ProjectRole;
  username?: string;
  email?: string;
  createdAt: number;
  updatedAt: number;
}

interface ProjectMembersListProps {
  members: ProjectMember[];
  projectId: string;
  isAdmin: boolean;
}

export default function ProjectMembersList({
  members: initialMembers,
  projectId: _projectId,
  isAdmin,
}: ProjectMembersListProps) {
  const [members, setMembers] = useState(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [_isLoading, _setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtrar miembros por búsqueda
  const filteredMembers = members.filter((member) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      member.username?.toLowerCase().includes(query) || member.email?.toLowerCase().includes(query)
    );
  });

  // Función para obtener el nombre del rol
  const getRoleName = (role: ProjectRole) => {
    switch (role) {
      case ProjectRole.PRODUCT_OWNER:
        return "Product Owner";
      case ProjectRole.SCRUM_MASTER:
        return "Scrum Master";
      case ProjectRole.TEAM_MEMBER:
        return "Miembro del Equipo";
      default:
        return role;
    }
  };

  // Función para obtener la clase de color del rol
  const getRoleColorClass = (role: ProjectRole) => {
    switch (role) {
      case ProjectRole.PRODUCT_OWNER:
        return "bg-purple-100 text-purple-800";
      case ProjectRole.SCRUM_MASTER:
        return "bg-blue-100 text-blue-800";
      case ProjectRole.TEAM_MEMBER:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <div class="flex flex-col md:flex-row justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2 md:mb-0">
            Miembros del Proyecto ({members.length})
          </h3>
          <div class="w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar miembros..."
              value={searchQuery}
              onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div class="p-4 bg-red-50 border-b border-red-200 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {filteredMembers.length === 0 ? (
        <div class="p-6 text-center text-gray-500">
          {searchQuery
            ? "No se encontraron miembros que coincidan con la búsqueda."
            : "Este proyecto no tiene miembros asignados."}
        </div>
      ) : (
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Usuario
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Correo
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rol
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha de Asignación
                </th>
                {isAdmin && (
                  <th
                    scope="col"
                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span class="text-gray-500 font-medium">
                          {member.username ? member.username.charAt(0).toUpperCase() : "?"}
                        </span>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {member.username || "Usuario desconocido"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">
                      {member.email || "Correo no disponible"}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColorClass(member.role)}`}
                    >
                      {getRoleName(member.role)}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        class="text-red-600 hover:text-red-900"
                        onClick={async () => {
                          // Lógica para eliminar miembro
                          if (
                            confirm(
                              `¿Estás seguro de que deseas eliminar a ${member.username || "este miembro"} del proyecto?`
                            )
                          ) {
                            try {
                              _setIsLoading(true);
                              setError(null);

                              const response = await fetch(`/api/projects/members/${member.id}`, {
                                method: "DELETE",
                              });

                              if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(
                                  errorData.message || "Error al eliminar el miembro"
                                );
                              }

                              // Actualizar la lista de miembros
                              setMembers(members.filter((m) => m.id !== member.id));
                            } catch (err) {
                              setError(
                                err instanceof Error ? err.message : "Error al eliminar el miembro"
                              );
                              console.error("Error eliminando miembro:", err);
                            } finally {
                              _setIsLoading(false);
                            }
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
