import DropdownMenu, { type DropdownMenuSection } from "./DropdownMenu";

export default function TeamDeveloperWelcomeOptions() {
	// Menú de proyectos
	const projectsSections: DropdownMenuSection[] = [
		{
			items: [
				{ label: "Ver mis proyectos", href: "/projects" },
				{ label: "Proyectos activos", href: "/projects?filter=active" },
				{ label: "Proyectos completados", href: "/projects?filter=completed" },
			],
		},
	];

	// Menú de tareas
	const tasksSections: DropdownMenuSection[] = [
		{
			items: [
				{ label: "Todas mis tareas", href: "/tasks" },
				{ label: "Tareas pendientes", href: "/tasks?filter=pending" },
				{ label: "Tareas en progreso", href: "/tasks?filter=in-progress" },
				{ label: "Tareas completadas", href: "/tasks?filter=completed" },
			],
		},
	];

	// Icono personalizado para tareas
	const taskIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="1.5"
			stroke="currentColor"
			className="w-4 h-4"
			aria-hidden="true"
		>
			<title>Icono de tarea</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
	);

	return (
		<div className="space-y-6">
			<div className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-bold mb-4 text-gray-800">
					Panel de Desarrollador
				</h2>
				<p className="text-gray-600 mb-6">
					Como miembro del equipo de desarrollo, eres responsable de entregar
					incrementos de producto de alta calidad en cada sprint.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Tarjeta de Mis Proyectos */}
					<div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
						<div className="flex justify-between items-start mb-4">
							<div>
								<h3 className="font-bold text-lg text-blue-800">
									Mis Proyectos
								</h3>
								<p className="text-gray-600 mt-1">
									Visualiza los proyectos en los que participas como
									desarrollador.
								</p>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-blue-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<title>Icono de proyecto</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
						</div>
						<div className="flex justify-between items-center">
							<a href="/projects" className="text-blue-600 hover:underline">
								Ver proyectos →
							</a>
							<DropdownMenu
								buttonText="Opciones"
								sections={projectsSections}
								className="ml-2"
							/>
						</div>
					</div>

					{/* Tarjeta de Mis Tareas */}
					<div className="bg-green-50 p-5 rounded-lg border border-green-200">
						<div className="flex justify-between items-start mb-4">
							<div>
								<h3 className="font-bold text-lg text-green-800">Mis Tareas</h3>
								<p className="text-gray-600 mt-1">
									Gestiona tus tareas asignadas y actualiza su progreso.
								</p>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-green-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<title>Icono de tareas</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
								/>
							</svg>
						</div>
						<div className="flex justify-between items-center">
							<a href="/tasks" className="text-green-600 hover:underline">
								Ver tareas →
							</a>
							<DropdownMenu
								buttonText="Opciones"
								sections={tasksSections}
								buttonIcon={taskIcon}
								className="ml-2"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-bold mb-4 text-gray-800">
					Acciones Rápidas
				</h2>
				<div className="grid grid-cols-2 md:grid-cols-2 gap-4">
					<a
						href="/tasks?filter=pending"
						className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-8 w-8 mx-auto mb-2 text-gray-700"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<title>Icono de tareas pendientes</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
							/>
						</svg>
						<span className="text-sm font-medium text-gray-700">
							Tareas Pendientes
						</span>
					</a>
					<a
						href="/tasks"
						className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-8 w-8 mx-auto mb-2 text-gray-700"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<title>Icono de todas las tareas</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						<span className="text-sm font-medium text-gray-700">
							Todas mis tareas
						</span>
					</a>
				</div>
			</div>
		</div>
	);
}
