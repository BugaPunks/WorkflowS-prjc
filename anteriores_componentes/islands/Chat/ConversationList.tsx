import { useEffect, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";
import type { Conversation, ConversationType } from "../../models/message.ts";

interface ConversationWithDetails {
  conversation: Conversation;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: number;
  };
  unreadCount: number;
  otherMembers: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  }>;
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
  onNewConversation: () => void;
}

export default function ConversationList({
  onSelectConversation,
  selectedConversationId,
  onNewConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar conversaciones
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/conversations");
      
      if (!response.ok) {
        throw new Error("Error al cargar conversaciones");
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Error cargando conversaciones:", err);
      setError("No se pudieron cargar las conversaciones");
    } finally {
      setLoading(false);
    }
  };

  // Cargar conversaciones al montar el componente
  useEffect(() => {
    loadConversations();
  }, []);

  // Formatear fecha del último mensaje
  const formatLastMessageTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Hace unos minutos";
    } else if (diffInHours < 24) {
      return `Hace ${Math.floor(diffInHours)} horas`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Obtener nombre para mostrar de la conversación
  const getDisplayName = (conv: ConversationWithDetails): string => {
    if (conv.conversation.type === "direct") {
      if (conv.otherMembers.length > 0) {
        const other = conv.otherMembers[0];
        return `${other.firstName} ${other.lastName}`;
      }
      return "Conversación directa";
    }
    return conv.conversation.name || "Conversación grupal";
  };

  // Obtener icono según el tipo de conversación
  const getConversationIcon = (type: ConversationType): string => {
    switch (type) {
      case "direct":
        return "person";
      case "group":
        return "group";
      case "project":
        return "work";
      default:
        return "chat";
    }
  };

  // Truncar contenido del último mensaje
  const truncateMessage = (content: string, maxLength: number = 50): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div class="h-full flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p class="text-gray-600">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="h-full flex items-center justify-center">
        <div class="text-center">
          <MaterialIcon icon="error" class="text-red-500 text-4xl mb-2" />
          <p class="text-red-600 mb-4">{error}</p>
          <Button onClick={loadConversations} size="sm">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div class="h-full flex flex-col">
      {/* Header */}
      <div class="p-4 border-b border-gray-200 bg-white">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Conversaciones</h2>
          <Button onClick={onNewConversation} size="sm" variant="ghost">
            <MaterialIcon icon="add" size="sm" class="mr-1" />
            Nueva
          </Button>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div class="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div class="p-8 text-center">
            <MaterialIcon icon="chat" class="text-gray-400 text-6xl mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No hay conversaciones</h3>
            <p class="text-gray-600 mb-4">
              Comienza una nueva conversación para comunicarte con tu equipo.
            </p>
            <Button onClick={onNewConversation}>
              <MaterialIcon icon="add" size="sm" class="mr-2" />
              Nueva conversación
            </Button>
          </div>
        ) : (
          <div class="divide-y divide-gray-200">
            {conversations.map((conv) => (
              <div
                key={conv.conversation.id}
                class={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversationId === conv.conversation.id
                    ? "bg-blue-50 border-r-2 border-blue-500"
                    : ""
                }`}
                onClick={() => onSelectConversation(conv.conversation.id)}
              >
                <div class="flex items-start space-x-3">
                  {/* Icono de conversación */}
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <MaterialIcon 
                        icon={getConversationIcon(conv.conversation.type)} 
                        class="text-gray-600"
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Contenido de la conversación */}
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <h3 class="text-sm font-medium text-gray-900 truncate">
                        {getDisplayName(conv)}
                      </h3>
                      {conv.lastMessage && (
                        <span class="text-xs text-gray-500">
                          {formatLastMessageTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    {/* Último mensaje */}
                    {conv.lastMessage ? (
                      <p class="text-sm text-gray-600 truncate mt-1">
                        {truncateMessage(conv.lastMessage.content)}
                      </p>
                    ) : (
                      <p class="text-sm text-gray-400 italic mt-1">
                        No hay mensajes aún
                      </p>
                    )}

                    {/* Indicadores */}
                    <div class="flex items-center justify-between mt-2">
                      <div class="flex items-center space-x-2">
                        {/* Tipo de conversación */}
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {conv.conversation.type === "direct" && "Directa"}
                          {conv.conversation.type === "group" && "Grupo"}
                          {conv.conversation.type === "project" && "Proyecto"}
                        </span>

                        {/* Número de miembros para grupos */}
                        {conv.conversation.type !== "direct" && (
                          <span class="text-xs text-gray-500">
                            {conv.otherMembers.length + 1} miembros
                          </span>
                        )}
                      </div>

                      {/* Contador de mensajes no leídos */}
                      {conv.unreadCount > 0 && (
                        <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
