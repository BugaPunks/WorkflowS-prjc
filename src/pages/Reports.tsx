import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '@/api/client';
import AppShell from '@/components/AppShell';

interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  projectId?: string; // added
  backlogItems: {
    id: string;
    storyPoints: number | null;
    status: string;
  }[];
}

interface Project {
  id: string;
  name: string;
  sprints: Sprint[];
}

export default function Reports() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [sprintData, setSprintData] = useState<Sprint | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }
        const user = JSON.parse(userStr);

        // Fetch projects
        const projectsData = await projectAPI.getAll({ memberId: user.id });
        setProjects(projectsData || []);

        if (projectsData && projectsData.length > 0) {
          setSelectedProject(projectsData[0].id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  useEffect(() => {
    if (selectedProject) {
      // Fetch sprints for project (needs specific endpoint or filter)
      // We will reuse fetch sprints and filter manually for now as we did before
      fetch('/api/sprints')
        .then((res) => res.json())
        .then((data) => {
          const projSprints = data.data.filter(
            (s: Sprint) => s.projectId === selectedProject,
          );
          if (projSprints.length > 0) {
            setSprintData(projSprints[0]); // Default to first
            setSelectedSprint(projSprints[0].id);
          } else {
            setSprintData(null);
            setSelectedSprint('');
          }
        });
    }
  }, [selectedProject]);

  const handleSprintChange = (sprintId: string) => {
    setSelectedSprint(sprintId);
    // Fetch full sprint details (with backlogItems for burndown)
    fetch(`/api/sprints/${sprintId}`)
      .then((res) => res.json())
      .then((data) => setSprintData(data.data));
  };

  // Burndown Calculation (Simple Mock)
  const getBurndownData = () => {
    if (!sprintData || !sprintData.backlogItems) return null;

    const totalPoints = sprintData.backlogItems.reduce(
      (acc, item) => acc + (item.storyPoints || 0),
      0,
    );
    const days = 14; // Assuming 2 weeks sprint
    const data = [];
    // const currentPoints = totalPoints; // unused
    const decrement = totalPoints / days; // Linear ideal

    for (let i = 0; i <= days; i++) {
      data.push({
        day: i,
        ideal: Math.max(0, totalPoints - decrement * i),
        actual: i < 5 ? Math.max(0, totalPoints - decrement * i * 0.8) : null, // Mock actual
      });
    }
    return { totalPoints, data };
  };

  const burndown = getBurndownData();
  const totalPoints = burndown ? burndown.totalPoints : 0;
  const chartData = burndown ? burndown.data : [];

  return (
    <AppShell>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Reportes y Métricas
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex gap-4 mb-6">
            <div>
              <label
                htmlFor="project-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Proyecto
              </label>
              <select
                id="project-select"
                className="border rounded-md px-3 py-2"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="sprint-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sprint
              </label>
              <select
                id="sprint-select"
                className="border rounded-md px-3 py-2"
                value={selectedSprint}
                onChange={(e) => handleSprintChange(e.target.value)}
                disabled={!sprintData}
              >
                {sprintData && (
                  <option value={sprintData.id}>{sprintData.name}</option>
                )}
                {/* In a real app, map all sprints of project */}
              </select>
            </div>
          </div>

          {sprintData ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Burndown Chart - {sprintData.name}
              </h2>
              <div className="mb-2">
                <span className="text-sm text-gray-600">Puntos Totales: </span>
                <span className="font-bold">{totalPoints}</span>
              </div>

              {/* Simple CSS Chart */}
              <div className="h-64 border-l border-b border-gray-300 relative mt-8 flex items-end justify-between px-2">
                {chartData.map((d) => (
                  <div
                    key={d.day}
                    className="relative flex flex-col items-center justify-end h-full w-full"
                  >
                    {/* Ideal Line (Dots) */}
                    <div
                      className="absolute w-2 h-2 bg-gray-300 rounded-full"
                      style={{
                        bottom: `${(d.ideal / (totalPoints || 1)) * 100}%`,
                      }}
                      title={`Ideal: ${d.ideal.toFixed(1)}`}
                    />
                    {/* Actual Bar */}
                    {d.actual !== null && (
                      <div
                        className="w-4 bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-all"
                        style={{
                          height: `${(d.actual / (totalPoints || 1)) * 100}%`,
                        }}
                        title={`Actual: ${d.actual.toFixed(1)}`}
                      />
                    )}
                    <span className="text-xs text-gray-500 mt-2 absolute -bottom-6">
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6 text-xs text-gray-500">
                Días del Sprint
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span>Ideal</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500"></div>
                  <span>Real</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              Selecciona un proyecto y sprint para ver el reporte.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
