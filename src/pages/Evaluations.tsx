import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sprintAPI } from "@/api/client";
import { useSession } from "@/hooks/useSession";

interface CriteriaScore {
	id: string;
	score: number;
	comment: string;
	criteria: { name: string; maxScore: number };
}

interface Evaluation {
	id: string;
	score: number;
	feedback: string;
	createdAt: string;
	project: { name: string };
	task?: { title: string };
	sprint?: { name: string };
	evaluator: { name: string };
	criteria?: CriteriaScore[];
}

interface PendingSprint {
	id: string;
	name: string;
	status: string;
	projectId: string;
	project: { name: string };
	evaluations: Evaluation[];
}

export default function Evaluations() {
	const { session: user } = useSession();
	const navigate = useNavigate();

	// State for Admin View (Sprints)
	const [pendingSprints, setPendingSprints] = useState<PendingSprint[]>([]);

	// State for Student View
	const [myGrades, setMyGrades] = useState<Evaluation[]>([]);

	const [isLoading, setIsLoading] = useState(true);

	const loadData = useCallback(async () => {
		if (!user) return;
		setIsLoading(true);
		try {
			if (user.role === "ADMIN") {
				// Admin: Load pending Sprints (Completed but not evaluated)
				const data = (await sprintAPI.getAll()) as PendingSprint[];

				// Filter: Status is COMPLETED and has no evaluations
				// Note: Ideally backend should filter, but for now we do client-side
				const pending = data.filter(
					(s) =>
						(s.status === "COMPLETED" || s.status === "CLOSED") &&
						(!s.evaluations || s.evaluations.length === 0),
				);
				setPendingSprints(pending);
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
					? "Gestión de Calificaciones (Sprints)"
					: "Mis Calificaciones"}
			</h1>

			{user?.role === "ADMIN" ? (
				<div className="space-y-8">
					<div className="flex justify-between items-center border-b pb-4">
						<h2 className="text-xl font-semibold text-gray-800">
							Sprints Pendientes de Evaluación
						</h2>
						<p className="text-sm text-gray-500">
							Mostrando solo sprints completados sin calificar.
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{pendingSprints.length === 0 ? (
							<div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
								<p className="text-gray-500">
									No hay sprints completados pendientes de revisión.
								</p>
							</div>
						) : (
							pendingSprints.map((sprint) => (
								<div
									key={sprint.id}
									className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
								>
									<div className="mb-4">
										<h3
											className="font-bold text-lg text-gray-800 truncate"
											title={sprint.name}
										>
											{sprint.name}
										</h3>
										<p className="text-sm text-gray-500 truncate">
											{sprint.project?.name || "Proyecto desconocido"}
										</p>
									</div>
									<div className="flex justify-between items-center mt-4">
										<span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded">
											{sprint.status}
										</span>
										<button
											type="button"
											onClick={() =>
												navigate(
													`/projects/${sprint.projectId}/sprints/${sprint.id}/grade`,
												)
											}
											className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
										>
											Ir a Calificar →
										</button>
									</div>
								</div>
							))
						)}
					</div>
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

										{/* Criteria Breakdown */}
										{grade.criteria && grade.criteria.length > 0 && (
											<div className="mt-4 pt-4 border-t border-dashed border-gray-200">
												<h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
													Detalle de Rúbrica
												</h4>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
													{grade.criteria.map((c) => (
														<div
															key={c.id}
															className="bg-gray-50 rounded p-2 text-sm"
														>
															<div className="flex justify-between font-medium">
																<span>{c.criteria.name}</span>
																<span>
																	{c.score}/{c.criteria.maxScore}
																</span>
															</div>
															{c.comment && (
																<p className="text-xs text-gray-500 mt-1 italic">
																	"{c.comment}"
																</p>
															)}
														</div>
													))}
												</div>
											</div>
										)}
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
