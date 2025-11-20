import { useState } from "preact/hooks";
import ChatInterface from "./ChatInterface.tsx";
import ConversationList from "./ConversationList.tsx";
import NewConversationModal from "./NewConversationModal.tsx";

interface ChatAppProps {
  currentUserId: string;
}

export default function ChatApp({ currentUserId }: ChatAppProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversationName, setConversationName] = useState<string>("");
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Seleccionar conversación
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsMobileView(true); // En móvil, mostrar solo el chat
    
    // Aquí podrías hacer una llamada para obtener el nombre de la conversación
    // Por ahora usamos un placeholder
    setConversationName("Conversación");
  };

  // Volver a la lista (móvil)
  const handleBackToList = () => {
    setIsMobileView(false);
    setSelectedConversationId(null);
  };

  // Abrir modal de nueva conversación
  const handleNewConversation = () => {
    setShowNewConversationModal(true);
  };

  // Cerrar modal de nueva conversación
  const handleCloseNewConversationModal = () => {
    setShowNewConversationModal(false);
  };

  // Conversación creada exitosamente
  const handleConversationCreated = (conversationId: string) => {
    setShowNewConversationModal(false);
    setSelectedConversationId(conversationId);
    setIsMobileView(true);
    // Recargar la lista de conversaciones
    globalThis.location.reload(); // Temporal - en una implementación real usarías state management
  };

  return (
    <div class="h-full flex bg-white">
      {/* Lista de conversaciones */}
      <div class={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 ${
        isMobileView ? "hidden md:block" : "block"
      }`}>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversationId || undefined}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Chat interface */}
      <div class={`flex-1 ${
        !selectedConversationId && !isMobileView ? "hidden md:flex" : "flex"
      }`}>
        {selectedConversationId ? (
          <ChatInterface
            conversationId={selectedConversationId}
            currentUserId={currentUserId}
            conversationName={conversationName}
            onBack={handleBackToList}
          />
        ) : (
          <div class="flex-1 flex items-center justify-center bg-gray-50">
            <div class="text-center">
              <div class="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg
                  class="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                Selecciona una conversación
              </h3>
              <p class="text-gray-600 max-w-sm">
                Elige una conversación de la lista para comenzar a chatear con tu equipo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de nueva conversación */}
      {showNewConversationModal && (
        <NewConversationModal
          onClose={handleCloseNewConversationModal}
          onConversationCreated={handleConversationCreated}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
