import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";

interface Project {
	id: string;
	name: string;
}

interface Criteria {
	id: string | number;
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

export default function Rubrics() {
	const { session: user } = useSession();
	const [projects, setProjects] = useState<Project[]>([]);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [rubrics, setRubrics] = useState<Rubric[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		criteria: [{ id: Date.now(), name: "", maxScore: 10, weight: 1 }],
	});

	const loadProjects = useCallback(async () => {
		try {
			const response = await fetch("/api/projects");
			const data = await response.json();
			setProjects(data.data || []);
		} catch (error) {
			console.error("Error loading projects:", error);
		}
	}, []);

	const loadRubrics = useCallback(async (projectId: string) => {
		try {
			setIsLoading(true);
			const response = await fetch(`/api/rubrics/${projectId}`);
			const data = await response.json();
			setRubrics(data.data || []);
		} catch (error) {
			console.error("Error loading rubrics:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadProjects();
	}, [loadProjects]);

	useEffect(() => {
		if (selectedProject) {
			loadRubrics(selectedProject.id);
		} else {
			setRubrics([]);
		}
	}, [selectedProject, loadRubrics]);

	const handleCreateRubric = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedProject || !user) return;

		try {
			const response = await fetch("/api/rubrics", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					projectId: selectedProject.id,
					name: formData.name,
					description: formData.description,
					criteria: formData.criteria.filter((c) => c.name.trim() !== ""),
				}),
			});

			if (!response.ok) throw new Error("Error creating rubric");

			setFormData({
				name: "",
				description: "",
				criteria: [{ id: Date.now(), name: "", maxScore: 10, weight: 1 }],
			});
			setShowModal(false);
			loadRubrics(selectedProject.id);
		} catch (error) {
			console.error("Error creating rubric:", error);
			alert("Error al crear la rúbrica");
		}
	};

	const addCriteria = () => {
		setFormData({
			...formData,
			criteria: [
				...formData.criteria,
				{ id: Date.now() + Math.random(), name: "", maxScore: 10, weight: 1 },
			],
		});
	};

	const updateCriteria = (
		id: string | number,
		field: string,
		value: string | number,
	) => {
		const newCriteria = formData.criteria.map((c) =>
			c.id === id ? { ...c, [field]: value } : c,
		);
		setFormData({ ...formData, criteria: newCriteria });
	};

	const removeCriteria = (id: string | number) => {
		if (formData.criteria.length > 1) {
			setFormData({
				...formData,
				criteria: formData.criteria.filter((c) => c.id !== id),
			});
		}
	};

	return (
		<div className="p-8 max-w-7xl mx-auto">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Rúbricas</h1>
					<p className="text-gray-600 mt-2">
						Gestiona las rúbricas de evaluación para tus proyectos
					</p>
				</div>
				{selectedProject && (
					<button
						type="button"
						onClick={() => setShowModal(true)}
						className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
					>
						+ Nueva Rúbrica
					</button>
				)}
			</div>

			{/* Project Selection */}
			<div className="mb-8">
				<label
					htmlFor="project-select"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					Seleccionar Proyecto
				</label>
				<select
					id="project-select"
					value={selectedProject?.id || ""}
					onChange={(e) => {
						const project = projects.find((p) => p.id === e.target.value);
						setSelectedProject(project || null);
					}}
					className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="">Selecciona un proyecto</option>
					{projects.map((project) => (
						<option key={project.id} value={project.id}>
							{project.name}
						</option>
					))}
				</select>
			</div>

			{/* Rubrics List */}
			{selectedProject && (
				<div>
					<h2 className="text-xl font-semibold text-gray-800 mb-4">
						Rúbricas de {selectedProject.name}
					</h2>
					{isLoading ? (
						<div className="text-center py-12">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
							<p className="text-gray-600 mt-4">Cargando rúbricas...</p>
						</div>
					) : rubrics.length === 0 ? (
						<p className="text-gray-500 italic">
							No hay rúbricas definidas para este proyecto.
						</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{rubrics.map((rubric) => (
								<div
									key={rubric.id}
									className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
								>
									<h3 className="font-bold text-gray-900 mb-2">
										{rubric.name}
									</h3>
									{rubric.description && (
										<p className="text-gray-600 text-sm mb-4">
											{rubric.description}
										</p>
									)}
									<div className="space-y-2">
										<h4 className="font-semibold text-gray-700 text-sm">
											Criterios:
										</h4>
										{rubric.criteria.map((criterion) => (
											<div key={criterion.id} className="text-xs text-gray-600">
												<span className="font-medium">{criterion.name}</span>
												<span className="ml-2">
													(Max: {criterion.maxScore}, Peso: {criterion.weight})
												</span>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Modal for Creating Rubric */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<h3 className="text-2xl font-bold text-gray-900 mb-6">
							Crear Nueva Rúbrica
						</h3>
						<form onSubmit={handleCreateRubric}>
							<div className="mb-4">
								<label
									htmlFor="rubric-name"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Nombre de la Rúbrica
								</label>
								<input
									id="rubric-name"
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="Ej: Rúbrica de Calidad de Código"
									required
								/>
							</div>
							<div className="mb-6">
								<label
									htmlFor="rubric-desc"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Descripción (opcional)
								</label>
								<textarea
									id="rubric-desc"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									rows={3}
									placeholder="Describe el propósito de esta rúbrica..."
								/>
							</div>

							<div className="mb-6">
								<div className="flex items-center justify-between mb-4">
									<h4 className="text-lg font-semibold text-gray-800">
										Criterios de Evaluación
									</h4>
									<button
										type="button"
										onClick={addCriteria}
										className="text-blue-600 hover:text-blue-800 text-sm font-medium"
									>
										+ Agregar Criterio
									</button>
								</div>
								<div className="space-y-4">
									{formData.criteria.map((criterion) => (
										<div
											key={criterion.id}
											className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
										>
											<div className="flex-1">
												<label
													htmlFor={`criterion-name-${criterion.id}`}
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													Nombre del Criterio
												</label>
												<input
													id={`criterion-name-${criterion.id}`}
													type="text"
													value={criterion.name}
													onChange={(e) =>
														updateCriteria(criterion.id, "name", e.target.value)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
													placeholder="Ej: Funcionalidad"
													required
												/>
											</div>
											<div className="w-24">
												<label
													htmlFor={`criterion-max-${criterion.id}`}
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													Max Puntuación
												</label>
												<input
													id={`criterion-max-${criterion.id}`}
													type="number"
													min="1"
													max="100"
													value={criterion.maxScore}
													onChange={(e) =>
														updateCriteria(
															criterion.id,
															"maxScore",
															parseInt(e.target.value, 10) || 10,
														)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											<div className="w-24">
												<label
													htmlFor={`criterion-weight-${criterion.id}`}
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													Peso
												</label>
												<input
													id={`criterion-weight-${criterion.id}`}
													type="number"
													min="1"
													value={criterion.weight}
													onChange={(e) =>
														updateCriteria(
															criterion.id,
															"weight",
															parseInt(e.target.value, 10) || 1,
														)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											{formData.criteria.length > 1 && (
												<button
													type="button"
													onClick={() => removeCriteria(criterion.id)}
													className="text-red-500 hover:text-red-700 mt-6"
													title="Eliminar criterio"
												>
													×
												</button>
											)}
										</div>
									))}
								</div>
							</div>

							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => setShowModal(false)}
									className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
								>
									Crear Rúbrica
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
