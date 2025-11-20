import { useEffect, useState } from "preact/hooks";

interface UserContribution {
  userId: string;
  userName: string;
  tasksCompleted: number;
  pointsContributed: number;
  hoursLogged: number;
}

interface WorkDistributionChartProps {
  projectId: string;
  sprintId?: string;
  height?: number;
  width?: number;
  metric?: "tasks" | "points" | "hours";
}

export default function WorkDistributionChart({
  projectId,
  sprintId,
  height = 300,
  width = 600,
  metric: initialMetric = "points",
}: WorkDistributionChartProps) {
  const [data, setData] = useState<UserContribution[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<"tasks" | "points" | "hours">(initialMetric);

  // Función para cargar los datos
  const loadData = async () => {
    try {
      setLoading(true);

      // Obtener los miembros del proyecto
      const membersResponse = await fetch(`/api/projects/${projectId}/members`);

      if (!membersResponse.ok) {
        throw new Error(`Error al cargar miembros: ${membersResponse.status}`);
      }

      const members = await membersResponse.json();

      // Obtener las métricas de cada usuario
      const contributions: UserContribution[] = [];

      for (const member of members) {
        let url = `/api/users/${member.userId}/metrics`;
        if (sprintId) {
          url += `?sprintId=${sprintId}`;
        }

        const metricsResponse = await fetch(url);

        if (metricsResponse.ok) {
          const metrics = await metricsResponse.json();

          // Calcular totales
          let tasksCompleted = 0;
          let pointsContributed = 0;
          let hoursLogged = 0;

          for (const metric of metrics) {
            tasksCompleted += metric.tasksCompleted;
            pointsContributed += metric.pointsContributed;
            hoursLogged += metric.hoursLogged;
          }

          contributions.push({
            userId: member.userId,
            userName: member.userName || `Usuario ${member.userId.substring(0, 6)}`,
            tasksCompleted,
            pointsContributed,
            hoursLogged,
          });
        }
      }

      setData(contributions);
      setError(null);
    } catch (err) {
      console.error("Error al cargar datos de distribución de trabajo:", err);
      setError("No se pudieron cargar los datos de distribución de trabajo");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [projectId, sprintId, metric]);

  // Si está cargando, mostrar spinner
  if (loading && !data) {
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Distribución de Trabajo</h3>
        <div class="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </div>
    );
  }

  // Si hay un error, mostrarlo
  if (error) {
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Distribución de Trabajo</h3>
        <div class="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div class="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!data || data.length === 0) {
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Distribución de Trabajo</h3>
        <div class="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div class="text-gray-500">No hay datos disponibles</div>
        </div>
      </div>
    );
  }

  // Obtener los valores según la métrica seleccionada
  const getMetricValues = () => {
    switch (metric) {
      case "tasks":
        return data.map((d) => d.tasksCompleted);
      case "hours":
        return data.map((d) => d.hoursLogged);
      default:
        return data.map((d) => d.pointsContributed);
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case "tasks":
        return "Tareas Completadas";
      case "hours":
        return "Horas Registradas";
      default:
        return "Puntos Contribuidos";
    }
  };

  const values = getMetricValues();
  const total = values.reduce((sum, val) => sum + val, 0);

  // Si el total es 0, mostrar mensaje
  if (total === 0) {
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Distribución de Trabajo</h3>
        <div class="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div class="text-gray-500">No hay datos para la métrica seleccionada</div>
        </div>
      </div>
    );
  }

  // Calcular dimensiones del gráfico
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) * 0.8;

  // Colores para las secciones
  const colors = [
    "#3182CE", // blue-500
    "#4FD1C5", // teal-400
    "#F6AD55", // orange-400
    "#9F7AEA", // purple-400
    "#F56565", // red-500
    "#48BB78", // green-500
    "#ED8936", // orange-500
    "#667EEA", // indigo-500
    "#FC8181", // red-400
    "#68D391", // green-400
  ];

  // Calcular ángulos para el gráfico de pastel
  let startAngle = 0;
  const slices = data.map((d, i) => {
    const value = values[i];
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * Math.PI * 2;

    const slice = {
      startAngle,
      endAngle: startAngle + angle,
      value,
      percentage,
      color: colors[i % colors.length],
      label: d.userName,
    };

    startAngle += angle;
    return slice;
  });

  return (
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Distribución de Trabajo</h3>
        <div class="flex space-x-2">
          <button
            type="button"
            onClick={() => metric !== "points" && setMetric("points")}
            class={`text-xs px-2 py-1 rounded ${
              metric === "points"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Puntos
          </button>
          <button
            type="button"
            onClick={() => metric !== "tasks" && setMetric("tasks")}
            class={`text-xs px-2 py-1 rounded ${
              metric === "tasks"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Tareas
          </button>
          <button
            type="button"
            onClick={() => metric !== "hours" && setMetric("hours")}
            class={`text-xs px-2 py-1 rounded ${
              metric === "hours"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Horas
          </button>
        </div>
      </div>

      <div class="flex flex-col md:flex-row">
        <svg width={width} height={height}>
          {/* Gráfico de pastel */}
          {slices.map((slice, i) => {
            const path = describeArc(centerX, centerY, radius, slice.startAngle, slice.endAngle);

            // Calcular posición para la etiqueta
            const labelAngle = slice.startAngle + (slice.endAngle - slice.startAngle) / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + Math.cos(labelAngle) * labelRadius;
            const labelY = centerY + Math.sin(labelAngle) * labelRadius;

            // Solo mostrar etiquetas para secciones grandes
            const showLabel = slice.percentage > 5;

            return (
              <g key={`slice-${i}`}>
                <path d={path} fill={slice.color} stroke="white" stroke-width="1" />
                {showLabel && (
                  <text
                    x={labelX}
                    y={labelY}
                    text-anchor="middle"
                    dominant-baseline="middle"
                    font-size="10"
                    fill="white"
                    font-weight="bold"
                  >
                    {Math.round(slice.percentage)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div class="mt-4 md:mt-0 md:ml-4">
          <h4 class="text-sm font-semibold mb-2">{getMetricLabel()}</h4>
          <div class="space-y-2">
            {slices.map((slice, i) => (
              <div key={`legend-${i}`} class="flex items-center">
                <div class="w-4 h-4 mr-2" style={{ backgroundColor: slice.color }} />
                <div class="text-sm flex-1">{slice.label}</div>
                <div class="text-sm font-medium">{slice.value}</div>
                <div class="text-xs text-gray-500 ml-2">({slice.percentage.toFixed(1)}%)</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de actualización */}
      <div class="mt-2 text-right">
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          class="text-sm text-blue-500 hover:text-blue-700"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>
    </div>
  );
}

// Función auxiliar para describir un arco SVG para el gráfico de pastel
function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = {
    x: x + Math.cos(startAngle) * radius,
    y: y + Math.sin(startAngle) * radius,
  };

  const end = {
    x: x + Math.cos(endAngle) * radius,
    y: y + Math.sin(endAngle) * radius,
  };

  const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

  return [
    "M",
    x,
    y,
    "L",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    1,
    end.x,
    end.y,
    "Z",
  ].join(" ");
}
