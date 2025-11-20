import { useEffect, useState } from "preact/hooks";

interface SprintVelocity {
  sprintId: string;
  sprintName: string;
  velocity: number;
}

interface TeamVelocityChartProps {
  projectId: string;
  height?: number;
  width?: number;
  limit?: number; // Número máximo de sprints a mostrar
}

export default function TeamVelocityChart({
  projectId,
  height = 300,
  width = 600,
  limit = 10,
}: TeamVelocityChartProps) {
  const [data, setData] = useState<SprintVelocity[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [averageVelocity, setAverageVelocity] = useState<number>(0);

  // Función para cargar los datos
  const loadData = async () => {
    try {
      setLoading(true);

      // Obtener los sprints del proyecto
      const sprintsResponse = await fetch(`/api/projects/${projectId}/sprints`);

      if (!sprintsResponse.ok) {
        throw new Error(`Error al cargar sprints: ${sprintsResponse.status}`);
      }

      const sprints = await sprintsResponse.json();

      // Obtener la velocidad de cada sprint
      const velocities: SprintVelocity[] = [];

      for (const sprint of sprints) {
        const velocityResponse = await fetch(`/api/sprints/${sprint.id}/velocity`);

        if (velocityResponse.ok) {
          const velocityData = await velocityResponse.json();
          velocities.push({
            sprintId: sprint.id,
            sprintName: sprint.name || `Sprint ${sprint.number || ""}`,
            velocity: velocityData.velocity,
          });
        }
      }

      // Ordenar por nombre de sprint (asumiendo que tienen números)
      const sortedVelocities = velocities.sort((a, b) => {
        const numA = Number.parseInt(a.sprintName.replace(/[^\d]/g, "")) || 0;
        const numB = Number.parseInt(b.sprintName.replace(/[^\d]/g, "")) || 0;
        return numA - numB;
      });

      // Limitar el número de sprints si es necesario
      const limitedVelocities = sortedVelocities.slice(-limit);

      setData(limitedVelocities);

      // Calcular velocidad promedio
      if (limitedVelocities.length > 0) {
        const sum = limitedVelocities.reduce((acc, curr) => acc + curr.velocity, 0);
        setAverageVelocity(Math.round(sum / limitedVelocities.length));
      }

      setError(null);
    } catch (err) {
      console.error("Error al cargar datos de velocidad:", err);
      setError("No se pudieron cargar los datos de velocidad del equipo");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [projectId]);

  // Si está cargando, mostrar spinner
  if (loading && !data) {
    return (
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Velocidad del Equipo</h3>
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
        <h3 class="text-lg font-semibold mb-4">Velocidad del Equipo</h3>
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
        <h3 class="text-lg font-semibold mb-4">Velocidad del Equipo</h3>
        <div class="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div class="text-gray-500">No hay datos disponibles</div>
        </div>
      </div>
    );
  }

  // Calcular dimensiones del gráfico
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Encontrar valor máximo para escalar el gráfico
  const maxVelocity = Math.max(...data.map((d) => d.velocity));

  // Calcular escalas
  const barWidth = chartWidth / data.length;
  const barPadding = barWidth * 0.2; // 20% de padding entre barras
  const actualBarWidth = barWidth - barPadding * 2;
  const yScale = chartHeight / (maxVelocity * 1.1); // 10% extra para espacio

  return (
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Velocidad del Equipo</h3>
        <div class="text-sm text-gray-600">
          Promedio: <span class="font-semibold">{averageVelocity} puntos</span>
        </div>
      </div>

      <svg width={width} height={height}>
        {/* Eje X */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#CBD5E0"
          stroke-width="1"
        />

        {/* Eje Y */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#CBD5E0"
          stroke-width="1"
        />

        {/* Líneas de cuadrícula horizontales */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = height - padding - (chartHeight / 4) * i;
          return (
            <line
              key={`grid-h-${i}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#EDF2F7"
              stroke-width="1"
            />
          );
        })}

        {/* Etiquetas del eje Y (velocidad) */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = height - padding - (chartHeight / 4) * i;
          const value = Math.round((maxVelocity / 4) * i);
          return (
            <text
              key={`y-label-${i}`}
              x={padding - 10}
              y={y + 3}
              text-anchor="end"
              font-size="10"
              fill="#4A5568"
            >
              {value}
            </text>
          );
        })}

        {/* Barras de velocidad */}
        {data.map((d, i) => {
          const barHeight = d.velocity * yScale;
          const x = padding + barPadding + i * barWidth;
          const y = height - padding - barHeight;

          return (
            <g key={`bar-${i}`}>
              <rect x={x} y={y} width={actualBarWidth} height={barHeight} fill="#3182CE" rx="2" />
              <text
                x={x + actualBarWidth / 2}
                y={y - 5}
                text-anchor="middle"
                font-size="10"
                fill="#4A5568"
              >
                {d.velocity}
              </text>
            </g>
          );
        })}

        {/* Etiquetas del eje X (sprints) */}
        {data.map((d, i) => {
          const x = padding + barPadding + i * barWidth + actualBarWidth / 2;
          return (
            <text
              key={`x-label-${i}`}
              x={x}
              y={height - padding + 15}
              text-anchor="middle"
              font-size="10"
              fill="#4A5568"
            >
              {d.sprintName.length > 10 ? `${d.sprintName.substring(0, 10)}...` : d.sprintName}
            </text>
          );
        })}

        {/* Línea de velocidad promedio */}
        <line
          x1={padding}
          y1={height - padding - averageVelocity * yScale}
          x2={width - padding}
          y2={height - padding - averageVelocity * yScale}
          stroke="#F56565"
          stroke-width="2"
          stroke-dasharray="5,5"
        />

        <text
          x={width - padding - 5}
          y={height - padding - averageVelocity * yScale - 5}
          text-anchor="end"
          font-size="10"
          fill="#F56565"
        >
          Promedio: {averageVelocity}
        </text>
      </svg>

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
