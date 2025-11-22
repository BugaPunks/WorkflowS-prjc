import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSession } from "@/hooks/useSession";

interface Task {
	id: string;
	title: string;
	description: string;
	status: string;
	assignee?: {
		id: string;
		name: string;
	};
	projectId: string;
}

interface Criteria {
	id: string;
	name: string;
	maxScore: number;
	weight: number;
}

interface Rubric {
	id: string;
	name: string;
	description?: string;
	criteria: Criteria[];
}

interface Score {
	criteriaId: string;
	score: number;
	comment: string;
}

export default function TaskGrading() {
	const { projectId, taskId } = useParams<{
		projectId: string;
		taskId: string;
	}>();
	const navigate = useNavigate();
	const { session: user } = useSession();

	const [task, setTask] = useState<Task | null>(null);
	const [rubrics, setRubrics] = useState<Rubric[]>([]);
	const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);
	const [scores, setScores] = useState<Score[]>([]);
	const [overallFeedback, setOverallFeedback] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	const initializeScores = useCallback((rubric: Rubric) => {
		const initialScores = rubric.criteria.map((c) => ({
			criteriaId: c.id,
			score: 0,
			comment: "",
		}));
		setScores(initialScores);
	}, []);

	useEffect(() => {
		if (!taskId || !projectId) return;

		const fetchData = async () => {
			try {
				setIsLoading(true);
				// Fetch Task
				const taskRes = await fetch(`/api/tasks/${taskId}`);
				const taskData = await taskRes.json();
				if (taskData.error) throw new Error(taskData.error);
				setTask(taskData);

				// Fetch Project Rubrics (Global + Project Specific)
				const rubricsRes = await fetch(`/api/rubrics?projectId=${projectId}`);
				const rubricsData = await rubricsRes.json();
				const rubricsList = rubricsData.data || [];
				setRubrics(rubricsList);

				// Select first rubric by default if available
				if (rubricsList.length > 0) {
					const initialRubric = rubricsList[0];
					setSelectedRubric(initialRubric);
					initializeScores(initialRubric);
				}
			} catch (error) {
				console.error("Error loading grading data:", error);
				alert("Error al cargar datos de calificación");
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [taskId, projectId, initializeScores]);

	const handleRubricChange = (rubricId: string) => {
		const rubric = rubrics.find((r) => r.id === rubricId);
		if (rubric) {
			setSelectedRubric(rubric);
			initializeScores(rubric);
		}
	};

	const handleScoreChange = (criteriaId: string, value: number) => {
		setScores((prev) =>
			prev.map((s) =>
				s.criteriaId === criteriaId ? { ...s, score: value } : s,
			),
		);
	};

	const handleCommentChange = (criteriaId: string, value: string) => {
		setScores((prev) =>
			prev.map((s) =>
				s.criteriaId === criteriaId ? { ...s, comment: value } : s,
			),
		);
	};

	const calculateTotalScore = () => {
		if (!selectedRubric) return 0;

		let totalWeight = 0;
		let weightedSum = 0;

		selectedRubric.criteria.forEach((c) => {
			const scoreEntry = scores.find(s => s.criteriaId === c.id);
			const score = scoreEntry?.score || 0;
			// Normalize score to 0-1 ratio then multiply by weight
			weightedSum += (score / c.maxScore) * c.weight;
			totalWeight += c.weight;
		});

		if (totalWeight === 0) return 0;
		// Scale to 100
		return Math.round((weightedSum / totalWeight) * 100);
	};

	// Not used anymore as we normalize to 100
	const calculateMaxScore = () => {
		return 100;
	};

	const handleSubmit = async () => {
		if (!selectedRubric || !user || !task) return;

		try {
			setIsSaving(true);
			const finalScore = calculateTotalScore();
			const payload = {
				projectId,
				taskId,
				evaluatorId: user.id,
				feedback: overallFeedback,
				criteriaScores: scores,
				score: finalScore // Send calculated total
			};

			const response = await fetch("/api/evaluations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) throw new Error("Error saving evaluation");

			alert("Calificación guardada exitosamente");
			navigate(`/projects/${projectId}/tasks/${taskId}`); // Go back to task detail
		} catch (error) {
			console.error("Error saving evaluation:", error);
			alert("Error al guardar la calificación");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full min-h-[400px]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
			</div>
		);
	}

	if (!task) {
		return (
			<div className="p-8 text-center text-red-600">Tarea no encontrada</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-64px)] overflow-hidden">
			{/* Left Panel: Submission Viewer */}
			<div className="w-1/2 border-r border-gray-200 bg-gray-50 p-6 overflow-y-auto">
				<div className="bg-white p-8 shadow-sm rounded-lg min-h-full">
					<div className="mb-6">
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							Calificar Entrega
						</h1>
						<p className="text-sm text-gray-500">
							Proyecto: {projectId} • Entrega de:{" "}
							<span className="font-medium text-gray-900">
								{task.assignee?.name || "Sin asignar"}
							</span>
						</p>
					</div>

					<div className="mb-8">
						<h2 className="text-lg font-semibold text-gray-800 mb-2">
							{task.title}
						</h2>
						<div className="prose prose-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
							{task.description || "Sin descripción disponible."}
						</div>
					</div>

					<div className="border-t border-gray-200 pt-6">
						<h3 className="font-medium text-gray-900 mb-4">
							Archivos Adjuntos
						</h3>
						{/* Mock Document Viewer */}
						<div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
							<svg
								className="w-12 h-12 text-gray-400 mx-auto mb-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-label="Document Icon"
							>
								<title>Document Icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<p className="text-gray-500 font-medium">
								Documento de la entrega.pdf
							</p>
							<button
								type="button"
								className="mt-4 text-blue-600 text-sm font-medium hover:underline"
							>
								Descargar Archivo
							</button>
						</div>
						<div className="mt-6 text-sm text-gray-500 italic">
							[Aquí se mostraría el visor de documentos integrado para ver el
							PDF/DOCX entregado por el estudiante]
						</div>
					</div>
				</div>
			</div>

			{/* Right Panel: Grading Rubric */}
			<div className="w-1/2 bg-white p-6 overflow-y-auto">
				<div className="max-w-xl mx-auto">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-bold text-gray-900">
							Rúbrica de Evaluación
						</h2>
						{rubrics.length > 0 && (
							<select
								id="rubric-select"
								className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
								value={selectedRubric?.id || ""}
								onChange={(e) => handleRubricChange(e.target.value)}
							>
								{rubrics.map((r) => (
									<option key={r.id} value={r.id}>
										{r.name}
									</option>
								))}
							</select>
						)}
					</div>

					{!selectedRubric ? (
						<div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
							No hay rúbricas disponibles para este proyecto.
							<br />
							Cree una rúbrica en la sección de Rúbricas.
						</div>
					) : (
						<div className="space-y-6 pb-24">
							{selectedRubric.criteria.map((criterion) => {
								const currentScore = scores.find(
									(s) => s.criteriaId === criterion.id,
								);
								return (
									<div
										key={criterion.id}
										className="border border-gray-200 rounded-lg p-5 shadow-sm"
									>
										<div className="flex justify-between items-start mb-3">
											<div>
												<h3 className="font-semibold text-gray-900">
													{criterion.name}
												</h3>
												<p className="text-xs text-gray-500 mt-1">
													Peso: {criterion.weight} • Max: {criterion.maxScore}{" "}
													pts
												</p>
											</div>
											<div className="flex items-center gap-2">
												<input
													type="number"
													min="0"
													max={criterion.maxScore}
													value={currentScore?.score || 0}
													onChange={(e) =>
														handleScoreChange(
															criterion.id,
															parseInt(e.target.value, 10) || 0,
														)
													}
													className="w-16 px-2 py-1 text-right border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono font-medium"
												/>
												<span className="text-gray-400 text-sm">
													/ {criterion.maxScore}
												</span>
											</div>
										</div>

										<div className="mt-3">
											<label
												htmlFor={`feedback-${criterion.id}`}
												className="block text-xs font-medium text-gray-500 mb-1 uppercase"
											>
												Feedback:
											</label>
											<textarea
												id={`feedback-${criterion.id}`}
												value={currentScore?.comment || ""}
												onChange={(e) =>
													handleCommentChange(criterion.id, e.target.value)
												}
												placeholder={`Comentarios sobre ${criterion.name}...`}
												className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
												rows={2}
											/>
										</div>
									</div>
								);
							})}

							<div className="border-t border-gray-200 pt-6 mt-8">
								<h3 className="font-bold text-gray-900 mb-3">
									Comentarios Generales
								</h3>
								<textarea
									value={overallFeedback}
									onChange={(e) => setOverallFeedback(e.target.value)}
									placeholder="Proporcione un feedback general sobre el trabajo..."
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
									rows={4}
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Fixed Footer for Action */}
			<div className="fixed bottom-0 right-0 w-1/2 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
				<div className="max-w-xl mx-auto flex justify-between items-center">
					<div className="flex flex-col">
						<span className="text-sm text-gray-500">Calificación Final</span>
						<span className="text-3xl font-bold text-blue-600">
							{calculateTotalScore()}{" "}
							<span className="text-lg text-gray-400 font-normal">
								/ 100
							</span>
						</span>
					</div>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => navigate(-1)}
							className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition"
						>
							Cancelar
						</button>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={isSaving || !selectedRubric}
							className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSaving ? "Guardando..." : "Guardar Calificación"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
