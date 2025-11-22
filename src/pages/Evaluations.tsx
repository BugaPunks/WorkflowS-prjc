import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

interface Evaluation {
	id: string;
	score: number;
	feedback: string;
	createdAt: string;
	project: { name: string };
	task?: { title: string };
	sprint?: { name: string };
	evaluator: { name: string };
}

interface PendingTask {
	id: string;
	title: string;
	status: string;
	projectId: string;
	project: { name: string };
	assignee?: { name: string };
	evaluations: Evaluation[];
}

export default function Evaluations() {
	const { session: user } = useSession();
	const navigate = useNavigate();

	// State for Admin View
	const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);

	// State for Student View
	const [myGrades, setMyGrades] = useState<Evaluation[]>([]);

	const [isLoading, setIsLoading] = useState(true);

	const loadData = useCallback(async () => {
		if (!user) return;
		setIsLoading(true);
		try {
			if (user.role === "ADMIN") {
				// Admin: Load pending tasks
				const res = await fetch("/api/tasks");
				const data = await res.json();
				const allTasks: PendingTask[] = data.data || [];
				// Filter completed but not evaluated (or evaluated but showing up for review)
				setPendingTasks(allTasks.filter((t) => t.status === "COMPLETED"));
			} else {
				// Student: Load my grades
				const res = await fetch(`/api/evaluations/student/${user.id}`);
				const data = await res.json();
				setMyGrades(data.data || []);
			}
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
					<p className="text-gray-600 mt-4">Cargando evaluaciones...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 max-w-7xl mx-auto">
			<h1 className="text-3xl font-bold text-gray-900 mb-6">
				{user?.role === "ADMIN"
					? "Tareas Pendientes de Calificar"
					: "Mis Calificaciones"}
			</h1>

			{user?.role === "ADMIN" ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{pendingTasks.length === 0 ? (
						<div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
							<p className="text-gray-500">
								No hay tareas completadas pendientes de revisión.
							</p>
						</div>
					) : (
						pendingTasks.map((task) => (
							<div
								key={task.id}
								className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
							>
								<div className="mb-4">
									<h3
										className="font-bold text-lg text-gray-800 truncate"
										title={task.title}
									>
										{task.title}
									</h3>
									<p className="text-sm text-gray-500 truncate">
										{task.project.name}
									</p>
									{task.assignee && (
										<p className="text-xs text-gray-400 mt-1">
											De: {task.assignee.name}
										</p>
									)}
								</div>
								<div className="flex justify-between items-center mt-4">
									<span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">
										{task.status}
									</span>
									<button
										type="button"
										onClick={() =>
											navigate(
												`/projects/${task.projectId}/tasks/${task.id}/grade`,
											)
										}
										className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
									>
										Ir a Calificar →
									</button>
								</div>
								{task.evaluations && task.evaluations.length > 0 && (
									<div className="mt-4 pt-3 border-t border-gray-100 text-xs text-green-600 flex items-center gap-1">
										<svg
											className="w-4 h-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<title>Check</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										Ya tiene {task.evaluations.length} evaluación(es).
									</div>
								)}
							</div>
						))
					)}
				</div>
			) : (
				<div className="space-y-4">
					{myGrades.length === 0 ? (
						<div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
							<p className="text-gray-500">
								Aún no tienes calificaciones registradas.
							</p>
						</div>
					) : (
						myGrades.map((grade) => (
							<div
								key={grade.id}
								className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500"
							>
								<div className="flex justify-between items-start">
									<div>
										<h3 className="font-bold text-lg text-gray-900">
											{grade.task?.title ||
												grade.sprint?.name ||
												"Proyecto Final"}
										</h3>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
												{grade.task
													? "Tarea"
													: grade.sprint
														? "Sprint"
														: "Proyecto"}
											</span>
											<span className="text-sm text-gray-600">
												{grade.project.name}
											</span>
										</div>
										<p className="mt-3 text-gray-700 italic bg-gray-50 p-3 rounded border border-gray-100">
											"{grade.feedback || "Sin comentarios"}"
										</p>
										<p className="text-xs text-gray-400 mt-2">
											Evaluado por {grade.evaluator.name} •{" "}
											{new Date(grade.createdAt).toLocaleDateString()}
										</p>
									</div>
									<div className="text-right flex flex-col items-center justify-center bg-blue-50 p-3 rounded-lg min-w-[80px]">
										<span className="block text-3xl font-bold text-blue-600">
											{grade.score}
										</span>
										<span className="text-xs text-blue-400 font-medium">
											/ 100
										</span>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
