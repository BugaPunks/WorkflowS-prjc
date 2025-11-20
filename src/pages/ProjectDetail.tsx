import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '@/components/AppShell';

// ... imports ...

function ChatSection({ projectId }: { projectId: string }) {
  // ... existing chat code ...
  const [messages, setMessages] = useState<
    { id: string; user: string; text: string }[]
  >([]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([
      ...messages,
      { id: Date.now().toString(), user: 'Yo', text: input },
    ]);
    setInput('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-96 flex flex-col">
      <h3 className="font-bold text-lg mb-4 border-b pb-2 text-gray-800">
        Chat del Equipo
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4 p-2 bg-gray-50 rounded">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm text-center">
            No hay mensajes aún.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className="bg-blue-100 p-2 rounded-lg self-end max-w-[80%]"
          >
            <p className="text-xs font-bold text-blue-800">{m.user}</p>
            <p className="text-sm text-gray-800">{m.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2 text-gray-800"
          placeholder="Escribe un mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

function DocumentsSection({ projectId }: { projectId: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 h-96">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-lg text-gray-800">Documentos</h3>
        <button className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-700">
          Subir Archivo
        </button>
      </div>
      <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
        <p>No hay documentos compartidos.</p>
        <p className="text-xs mt-1">
          Arrastra archivos aquí o usa el botón de subir.
        </p>
      </div>
    </div>
  );
}

function MembersSection({
  projectId,
  isProjectAdmin,
}: {
  projectId: string;
  isProjectAdmin: boolean;
}) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('TEAM_DEVELOPER');

  const loadMembers = useCallback(async () => {
    try {
      // Reload project to get members
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      setMembers(data.data.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      // Filter out already added members
      const memberIds = new Set(members.map((m) => m.userId));
      const availableUsers = (data.data || []).filter(
        (u: any) => !memberIds.has(u.id),
      );
      setUsers(availableUsers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser, role: selectedRole }),
      });
      if (!response.ok) throw new Error('Error al añadir miembro');
      setShowAddModal(false);
      loadMembers();
    } catch (err) {
      alert('Error al añadir miembro');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('¿Eliminar miembro?')) return;
    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${userId}`,
        {
          method: 'DELETE',
        },
      );
      if (!response.ok) throw new Error('Error');
      loadMembers();
    } catch (err) {
      alert('Error al eliminar miembro');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h3 className="font-bold text-lg text-gray-800">Miembros del Equipo</h3>
        {isProjectAdmin && (
          <button
            onClick={() => {
              loadUsers();
              setShowAddModal(true);
            }}
            className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded"
          >
            + Añadir Miembro
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">Cargando...</div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                  {member.user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {member.user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{member.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-medium">
                  {member.role}
                </span>
                {isProjectAdmin && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <p className="text-gray-500 text-sm text-center">
              No hay miembros asignados.
            </p>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Añadir Miembro</h3>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Usuario
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                >
                  <option value="">Seleccionar usuario...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Rol Scrum
                </label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="TEAM_DEVELOPER">Team Developer</option>
                  <option value="SCRUM_MASTER">Scrum Master</option>
                  <option value="PRODUCT_OWNER">Product Owner</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProjectMember {
  userId: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  ownerId: string;
  members: ProjectMember[];
}

interface UserStory {
  id: string;
  title: string;
  description: string;
  priority: string;
  storyPoints?: number;
  projectId: string;
}

interface BacklogItem {
  id: string;
  userStoryId: string;
  userStory: UserStory;
}

interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  backlogItems: BacklogItem[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [backlogStories, setBacklogStories] = useState<UserStory[]>([]);
  const [isProjectAdmin, setIsProjectAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'board' | 'chat' | 'docs' | 'members'
  >('board'); // Tab state
  const [sprintForm, setSprintForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const loadProject = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);

      // Fetch project
      const projectResponse = await fetch(`/api/projects/${id}`);
      if (!projectResponse.ok) throw new Error('Proyecto no encontrado');
      const projectData = await projectResponse.json();
      setProject(projectData.data);

      // Fetch sprints
      const sprintsResponse = await fetch('/api/sprints');
      const sprintsData = await sprintsResponse.json();
      const projectSprints: Sprint[] = (sprintsData.data as Sprint[]).filter(
        (s) => s.projectId === id,
      );
      setSprints(projectSprints || []);

      // Fetch ALL User Stories for this project
      const storiesResponse = await fetch('/api/user-stories');
      const storiesData: UserStory[] = await storiesResponse.json();
      const projectStories = storiesData.filter((s) => s.projectId === id);

      // Filter stories that are NOT in any sprint (not in backlogItems of any sprint)
      const assignedStoryIds = new Set();
      projectSprints.forEach((s) => {
        if (s.backlogItems) {
          s.backlogItems.forEach((bi) => {
            assignedStoryIds.add(bi.userStoryId);
          });
        }
      });

      const unassigned = projectStories.filter(
        (s) => !assignedStoryIds.has(s.id),
      );
      setBacklogStories(unassigned);
    } catch (err) {
      setError('Error al cargar el proyecto');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    loadProject();
  }, [navigate, loadProject]);

  useEffect(() => {
    if (user && project) {
      const isOwner = project.ownerId === user.id;
      const member = project.members.find((m) => m.userId === user.id);
      const isLead = member?.role === 'OWNER' || member?.role === 'LEAD';
      setIsProjectAdmin(isOwner || isLead || user.role === 'ADMIN');
    }
  }, [user, project]);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sprintForm,
          projectId: id,
        }),
      });
      if (!response.ok) throw new Error('Error al crear sprint');
      setSprintForm({ name: '', description: '', startDate: '', endDate: '' });
      setShowSprintModal(false);
      loadProject();
    } catch (err) {
      setError('Error al crear el sprint');
      console.error(err);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // If dropped in same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Moving from Backlog to Sprint
    if (
      source.droppableId === 'backlog' &&
      destination.droppableId.startsWith('sprint-')
    ) {
      const sprintId = destination.droppableId.replace('sprint-', '');

      try {
        // Optimistic update
        const storyToMove = backlogStories.find((s) => s.id === draggableId);
        if (!storyToMove) return;

        // Remove from backlog
        setBacklogStories((prev) => prev.filter((s) => s.id !== draggableId));

        // Add to sprint (visually) - we need a mock BacklogItem structure
        setSprints((prev) =>
          prev.map((s) => {
            if (s.id === sprintId) {
              return {
                ...s,
                backlogItems: [
                  ...(s.backlogItems || []),
                  {
                    id: 'temp',
                    userStoryId: storyToMove.id,
                    userStory: storyToMove,
                  } as BacklogItem,
                ],
              };
            }
            return s;
          }),
        );

        // API Call
        const response = await fetch(`/api/sprints/${sprintId}/add-story`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userStoryId: draggableId }),
        });

        if (!response.ok) {
          const data = await response.json();
          // Revert if fail (simplest is reload)
          alert(data.error || 'Error al asignar historia');
          loadProject();
        } else {
          // Refresh to get real IDs
          loadProject();
        }
      } catch (error) {
        console.error(error);
        loadProject();
      }
    }
  };

  if (isLoading) {
    return (
      <AppShell user={user || undefined}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-gray-600 mt-4">Cargando proyecto...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !project) {
    return (
      <AppShell user={user || undefined}>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Proyecto no encontrado'}
          </div>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Volver a Proyectos
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user || undefined}>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Volver a Proyectos
          </button>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {project.name}
              </h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('board')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'board' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Tablero & Sprints
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'members' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Miembros
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'chat' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'docs' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Documentos
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'chat' && <ChatSection projectId={project.id} />}
        {activeTab === 'docs' && <DocumentsSection projectId={project.id} />}
        {activeTab === 'members' && (
          <MembersSection
            projectId={project.id}
            isProjectAdmin={isProjectAdmin}
          />
        )}

        {activeTab === 'board' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* BACKLOG SECTION */}
              <div className="bg-gray-50 p-4 rounded-lg shadow-inner h-fit">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-700">
                    Backlog (Historias)
                  </h2>
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {backlogStories.length}
                  </span>
                </div>

                <Droppable droppableId="backlog">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3 min-h-[200px]"
                    >
                      {backlogStories.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No hay historias sin asignar.
                        </p>
                      )}
                      {backlogStories.map((story, index) => (
                        <Draggable
                          key={story.id}
                          draggableId={story.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-3 rounded shadow-sm hover:shadow-md border border-gray-200 cursor-grab"
                            >
                              <h3 className="font-medium text-sm text-gray-800">
                                {story.title}
                              </h3>
                              <div className="flex justify-between items-center mt-2">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    story.priority === 'HIGH'
                                      ? 'bg-orange-100 text-orange-700'
                                      : story.priority === 'CRITICAL'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {story.priority}
                                </span>
                                {story.storyPoints && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {story.storyPoints} pts
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* SPRINTS SECTION */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Sprints</h2>
                  {isProjectAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowSprintModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      + Nuevo Sprint
                    </button>
                  )}
                </div>

                {sprints.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No hay sprints activos.</p>
                  </div>
                ) : (
                  sprints.map((sprint) => (
                    <div
                      key={sprint.id}
                      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {sprint.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(sprint.startDate).toLocaleDateString()} -{' '}
                            {new Date(sprint.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            sprint.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {sprint.status}
                        </span>
                      </div>

                      <Droppable droppableId={`sprint-${sprint.id}`}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="p-4 min-h-[100px] bg-white"
                          >
                            {!sprint.backlogItems ||
                            sprint.backlogItems.length === 0 ? (
                              <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded">
                                Arrastra historias aquí para planificar el
                                sprint
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {sprint.backlogItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-100"
                                  >
                                    <div>
                                      <p className="font-medium text-sm text-blue-900">
                                        {item.userStory.title}
                                      </p>
                                      <p className="text-xs text-blue-600 mt-0.5 line-clamp-1">
                                        {item.userStory.description}
                                      </p>
                                    </div>
                                    {item.userStory.storyPoints && (
                                      <span className="text-xs font-bold bg-white text-blue-600 px-2 py-1 rounded border border-blue-100">
                                        {item.userStory.storyPoints}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DragDropContext>
        )}

        {/* Sprint Modal */}
        {showSprintModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Nuevo Sprint
              </h3>
              <form onSubmit={handleCreateSprint}>
                {/* Form fields same as before */}
                <div className="mb-4">
                  <label
                    htmlFor="sprint-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nombre
                  </label>
                  <input
                    id="sprint-name"
                    type="text"
                    value={sprintForm.name}
                    onChange={(e) =>
                      setSprintForm({ ...sprintForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="sprint-desc"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="sprint-desc"
                    value={sprintForm.description}
                    onChange={(e) =>
                      setSprintForm({
                        ...sprintForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label
                      htmlFor="sprint-start"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Inicio
                    </label>
                    <input
                      id="sprint-start"
                      type="date"
                      value={sprintForm.startDate}
                      onChange={(e) =>
                        setSprintForm({
                          ...sprintForm,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sprint-end"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Fin
                    </label>
                    <input
                      id="sprint-end"
                      type="date"
                      value={sprintForm.endDate}
                      onChange={(e) =>
                        setSprintForm({
                          ...sprintForm,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSprintModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
