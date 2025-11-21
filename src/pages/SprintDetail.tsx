import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "@/components/AppShell";

interface Sprint {
	id: string;
	name: string;
	description: string;
	startDate: string;
	endDate: string;
	status: string;
}

interface Task {
	id: string;
	title: string;
	status: string;
	deadline: string;
}

interface User {
	id: string;
	name: string;
	email: string;
	role: string;
}

export default function SprintDetail() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const [user, setUser] = useState<User | null>(null);
	const [sprint, setSprint] = useState<Sprint | null>(null);
	const [tasks, _setTasks] = useState<Task[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadSprint = useCallback(async () => {
		if (!id) return;
		try {
			setIsLoading(true);
			const response = await fetch(`/api/sprints/${id}`);
			if (!response.ok) throw new Error("Sprint no encontrado");
			const data = await response.json();
			setSprint(data.data);
		} catch (err) {
			setError("Error al cargar el sprint");
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		const storedUser = localStorage.getItem("user");
		if (!storedUser) {
			navigate("/login");
			return;
		}
		setUser(JSON.parse(storedUser));
		loadSprint();
	}, [navigate, loadSprint]);

	const getDaysRemaining = (endDate: string) => {
		const end = new Date(endDate);
		const today = new Date();
		const diff = Math.ceil(
			(end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
		);
		return diff;
	};

	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			PENDING: "bg-yellow-100 text-yellow-700",
			IN_PROGRESS: "bg-blue-100 text-blue-700",
			COMPLETED: "bg-green-100 text-green-700",
		};
		return colors[status] || "bg-gray-100 text-gray-700";
	};

	if (isLoading) {
		return (
			<AppShell user={user || undefined}>
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
						<p className="text-gray-600 mt-4">Cargando sprint...</p>
					</div>
				</div>
			</AppShell>
		);
	}

	if (error || !sprint) {
		return (
			<AppShell user={user || undefined}>
				<div className="p-8">
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
						{error || "Sprint no encontrado"}
					</div>
					<button
						type="button"
						onClick={() => navigate("/sprints")}
						className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
					>
						Volver a Sprints
					</button>
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell user={user || undefined}>
			<div className="p-8 max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<button
						type="button"
						onClick={() => navigate("/sprints")}
						className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
					>
						← Volver a Sprints
					</button>
					<h1 className="text-4xl font-bold text-gray-900">{sprint.name}</h1>
					<p className="text-gray-600 mt-2">{sprint.description}</p>

					{/* Sprint Stats */}
					<div className="flex items-center gap-6 mt-6">
						<div>
							<span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
								{sprint.status}
							</span>
						</div>
						<div className="text-sm text-gray-600">
							<strong>Inicio:</strong>{" "}
							{new Date(sprint.startDate).toLocaleDateString()}
						</div>
						<div className="text-sm text-gray-600">
							<strong>Fin:</strong>{" "}
							{new Date(sprint.endDate).toLocaleDateString()}
						</div>
						<div className="text-sm font-semibold text-blue-600">
							{getDaysRemaining(sprint.endDate)} días restantes
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm font-medium text-gray-700">Progreso</span>
						<span className="text-sm text-gray-600">
							{Math.min(
								100,
								Math.max(
									0,
									((14 - getDaysRemaining(sprint.endDate)) / 14) * 100,
								),
							).toFixed(0)}
							%
						</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-3">
						<div
							className="bg-blue-600 h-3 rounded-full transition-all"
							style={{
								width: `${Math.min(
									100,
									Math.max(
										0,
										((14 - getDaysRemaining(sprint.endDate)) / 14) * 100,
									),
								)}%`,
							}}
						/>
					</div>
				</div>

				{/* Tasks Section */}
				<div>
					<h2 className="text-2xl font-bold text-gray-900 mb-6">
						Tareas del Sprint
					</h2>

					{tasks.length === 0 ? (
						<div className="bg-white rounded-lg shadow-md p-8 text-center">
							<div className="text-5xl mb-4">📝</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								No hay tareas en este sprint
							</h3>
							<p className="text-gray-600">
								Las tareas asignadas aparecerán aquí
							</p>
						</div>
					) : (
						<div className="bg-white rounded-lg shadow-md overflow-hidden">
							<table className="w-full">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											Tarea
										</th>
										<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											Estado
										</th>
										<th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
											Vencimiento
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{tasks.map((task) => (
										<tr key={task.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 text-sm font-medium text-gray-900">
												{task.title}
											</td>
											<td className="px-6 py-4 text-sm">
												<span
													className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}
												>
													{task.status}
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-gray-600">
												{task.deadline
													? new Date(task.deadline).toLocaleDateString()
													: "-"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		</AppShell>
	);
}
