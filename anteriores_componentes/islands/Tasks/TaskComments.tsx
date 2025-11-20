import { useEffect, useState } from "preact/hooks";
import type { Comment } from "../../models/comment.ts";

interface TaskCommentsProps {
  taskId: string;
  userId: string;
}

export default function TaskComments({ taskId, userId }: TaskCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Cargar comentarios
  const loadComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${taskId}`);

      if (!response.ok) {
        throw new Error("Error al cargar comentarios");
      }

      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      setError("No se pudieron cargar los comentarios. Por favor, intenta de nuevo.");
      console.error("Error cargando comentarios:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar comentarios al montar el componente
  useEffect(() => {
    loadComments();
  }, [taskId]);

  // Enviar un nuevo comentario
  const handleSubmitComment = async (e: Event) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${taskId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar comentario");
      }

      setNewComment("");
      loadComments();
    } catch (err) {
      setError("No se pudo enviar el comentario. Por favor, intenta de nuevo.");
      console.error("Error enviando comentario:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar un comentario
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          action: "delete",
        }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar comentario");
      }

      loadComments();
    } catch (err) {
      setError("No se pudo eliminar el comentario. Por favor, intenta de nuevo.");
      console.error("Error eliminando comentario:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar edición de un comentario
  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  // Guardar edición de comentario
  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          content: editContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar comentario");
      }

      setEditingCommentId(null);
      setEditContent("");
      loadComments();
    } catch (err) {
      setError("No se pudo actualizar el comentario. Por favor, intenta de nuevo.");
      console.error("Error actualizando comentario:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div class="mt-6 bg-white rounded-lg shadow-md p-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Comentarios</h3>

      {error && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Formulario para nuevo comentario */}
      <form onSubmit={handleSubmitComment} class="mb-6">
        <div class="mb-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment((e.target as HTMLTextAreaElement).value)}
            placeholder="Escribe un comentario..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            disabled={isLoading}
          />
        </div>
        <div class="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !newComment.trim()}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Enviando..." : "Enviar comentario"}
          </button>
        </div>
      </form>

      {/* Lista de comentarios */}
      <div class="space-y-4">
        {isLoading && comments.length === 0 ? (
          <div class="flex justify-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : comments.length === 0 ? (
          <p class="text-gray-500 text-center py-4">No hay comentarios todavía.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div class="flex items-start">
                  <div class="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div class="font-medium text-gray-800">{comment.userName}</div>
                    <div class="text-xs text-gray-500">{formatDate(new Date(comment.createdAt))}</div>
                  </div>
                </div>

                {/* Opciones de edición/eliminación (solo para el autor) */}
                {comment.userId === userId && (
                  <div class="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(comment)}
                      class="text-gray-500 hover:text-gray-700"
                      title="Editar comentario"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      class="text-red-500 hover:text-red-700"
                      title="Eliminar comentario"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Contenido del comentario (normal o en modo edición) */}
              <div class="mt-2">
                {editingCommentId === comment.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent((e.target as HTMLTextAreaElement).value)}
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    <div class="flex justify-end space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(comment.id)}
                        class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p class="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
