import { useEffect, useRef, useState } from "preact/hooks";
import { Button } from "../../components/Button.tsx";
import { MaterialIcon } from "../../components/ui/MaterialIcon.tsx";
import type { Message } from "../../models/message.ts";

interface ChatInterfaceProps {
  conversationId: string;
  currentUserId: string;
  conversationName: string;
  onBack?: () => void;
}

export default function ChatInterface({
  conversationId,
  currentUserId,
  conversationName,
  onBack,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes de la conversación
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      
      if (!response.ok) {
        throw new Error("Error al cargar mensajes");
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error cargando mensajes:", err);
      setError("No se pudieron cargar los mensajes");
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensaje
  const sendMessage = async (e: Event) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) {
      return;
    }

    try {
      setSending(true);
      setError(null);

      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar mensaje");
      }

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setNewMessage("");
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      setError("No se pudo enviar el mensaje");
    } finally {
      setSending(false);
    }
  };

  // Scroll al final cuando hay nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Cargar mensajes al montar o cambiar conversación
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  // Scroll al final cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Formatear timestamp del mensaje
  const formatMessageTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Formatear fecha del mensaje
  const formatMessageDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Agrupar mensajes por fecha
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = new Date(message.createdAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([date, msgs]) => ({
      date: new Date(date).getTime(),
      messages: msgs,
    }));
  };

  if (loading) {
    return (
      <div class="h-full flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p class="text-gray-600">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div class="h-full flex flex-col">
      {/* Header */}
      <div class="p-4 border-b border-gray-200 bg-white">
        <div class="flex items-center space-x-3">
          {onBack && (
            <Button onClick={onBack} variant="ghost" size="sm">
              <MaterialIcon icon="arrow_back" size="sm" />
            </Button>
          )}
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-900">{conversationName}</h2>
          </div>
          <Button variant="ghost" size="sm">
            <MaterialIcon icon="more_vert" size="sm" />
          </Button>
        </div>
      </div>

      {/* Mensajes */}
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <div class="flex items-center">
              <MaterialIcon icon="error" class="text-red-500 mr-2" size="sm" />
              <span class="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {messageGroups.length === 0 ? (
          <div class="text-center py-8">
            <MaterialIcon icon="chat" class="text-gray-400 text-6xl mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No hay mensajes</h3>
            <p class="text-gray-600">Envía el primer mensaje para comenzar la conversación.</p>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.date}>
              {/* Separador de fecha */}
              <div class="flex items-center justify-center mb-4">
                <span class="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                  {formatMessageDate(group.date)}
                </span>
              </div>

              {/* Mensajes del día */}
              <div class="space-y-3">
                {group.messages.map((message) => (
                  <div
                    key={message.id}
                    class={`flex ${
                      message.senderId === currentUserId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      class={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === currentUserId
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <p class="text-sm">{message.content}</p>
                      <div class="flex items-center justify-end mt-1">
                        <span
                          class={`text-xs ${
                            message.senderId === currentUserId
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </span>
                        {message.senderId === currentUserId && (
                          <MaterialIcon
                            icon={message.readBy.length > 1 ? "done_all" : "done"}
                            class={`ml-1 ${
                              message.readBy.length > 1 ? "text-blue-200" : "text-blue-300"
                            }`}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulario de envío */}
      <div class="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={sendMessage} class="flex items-end space-x-2">
          <div class="flex-1">
            <textarea
              value={newMessage}
              onInput={(e) => setNewMessage((e.target as HTMLTextAreaElement).value)}
              placeholder="Escribe un mensaje..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim() || sending}
            size="sm"
          >
            {sending ? (
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <MaterialIcon icon="send" size="sm" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
