import { useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";

interface NewConversationModalProps {
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
  currentUserId: string;
}

interface RequestBody {
  type: string;
  otherUserId?: string;
  name?: string;
  memberIds?: string[];
  description?: string;
}

export default function NewConversationModal({
  onClose,
  onConversationCreated,
  currentUserId: _currentUserId,
}: NewConversationModalProps) {
  const [conversationType, setConversationType] = useState<"direct" | "group">("direct");
  const [otherUserId, setOtherUserId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear conversación
  const handleCreateConversation = async (e: Event) => {
    e.preventDefault();
    
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      let requestBody: RequestBody;

      if (conversationType === "direct") {
        if (!otherUserId.trim()) {
          setError("Debes especificar el ID del otro usuario");
          return;
        }
        requestBody = {
          type: "direct",
          otherUserId: otherUserId.trim(),
        };
      } else {
        if (!groupName.trim()) {
          setError("Debes especificar un nombre para el grupo");
          return;
        }
        requestBody = {
          type: "group",
          name: groupName.trim(),
          description: groupDescription.trim(),
          memberIds: memberIds.filter(id => id.trim() !== ""),
        };
      }

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la conversación");
      }

      const data = await response.json();
      onConversationCreated(data.conversation.id);
    } catch (err) {
      console.error("Error creando conversación:", err);
      setError(err instanceof Error ? err.message : "Error al crear la conversación");
    } finally {
      setLoading(false);
    }
  };

  // Agregar miembro al grupo
  const addMember = () => {
    setMemberIds([...memberIds, ""]);
  };

  // Remover miembro del grupo
  const removeMember = (index: number) => {
    setMemberIds(memberIds.filter((_, i) => i !== index));
  };

  // Actualizar ID de miembro
  const updateMemberId = (index: number, value: string) => {
    const newMemberIds = [...memberIds];
    newMemberIds[index] = value;
    setMemberIds(newMemberIds);
  };

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Nueva Conversación</h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              <MaterialIcon icon="close" size="sm" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleCreateConversation} class="p-6 space-y-4">
          {error && (
            <div class="bg-red-50 border border-red-200 rounded-lg p-3">
              <div class="flex items-center">
                <MaterialIcon icon="error" class="text-red-500 mr-2" size="sm" />
                <span class="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Tipo de conversación */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de conversación
            </label>
            <div class="flex space-x-4">
              <label class="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="direct"
                  checked={conversationType === "direct"}
                  onChange={() => setConversationType("direct")}
                  class="mr-2"
                />
                <span class="text-sm">Directa (1 a 1)</span>
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="group"
                  checked={conversationType === "group"}
                  onChange={() => setConversationType("group")}
                  class="mr-2"
                />
                <span class="text-sm">Grupal</span>
              </label>
            </div>
          </div>

          {/* Conversación directa */}
          {conversationType === "direct" && (
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ID del usuario
              </label>
              <input
                type="text"
                value={otherUserId}
                onInput={(e) => setOtherUserId((e.target as HTMLInputElement).value)}
                placeholder="Ingresa el ID del usuario"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p class="text-xs text-gray-500 mt-1">
                Por ahora necesitas el ID exacto del usuario. En el futuro habrá un buscador.
              </p>
            </div>
          )}

          {/* Conversación grupal */}
          {conversationType === "group" && (
            <>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del grupo
                </label>
                <input
                  type="text"
                  value={groupName}
                  onInput={(e) => setGroupName((e.target as HTMLInputElement).value)}
                  placeholder="Nombre del grupo"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={groupDescription}
                  onInput={(e) => setGroupDescription((e.target as HTMLTextAreaElement).value)}
                  placeholder="Descripción del grupo"
                  rows={2}
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-700">
                    Miembros
                  </label>
                  <Button type="button" onClick={addMember} size="sm"           variant="ghost">
                    <MaterialIcon icon="add" size="sm" class="mr-1" />
                    Agregar
                  </Button>
                </div>
                
                {memberIds.length === 0 ? (
                  <p class="text-sm text-gray-500 italic">
                    No hay miembros agregados. Haz clic en "Agregar" para añadir miembros.
                  </p>
                ) : (
                  <div class="space-y-2">
                    {memberIds.map((memberId, index) => (
                      <div key={index} class="flex items-center space-x-2">
                        <input
                          type="text"
                          value={memberId}
                          onInput={(e) => updateMemberId(index, (e.target as HTMLInputElement).value)}
                          placeholder="ID del usuario"
                          class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button
                          type="button"
                          onClick={() => removeMember(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <MaterialIcon icon="remove" size="sm" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Botones */}
          <div class="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose}           variant="ghost">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </div>
              ) : (
                "Crear conversación"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
