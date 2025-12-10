import DropdownMenu, { type DropdownMenuSection } from "./DropdownMenu";

export default function ScrumMasterWelcomeOptions() {
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

	// Menú de sprints
	const sprintsSections: DropdownMenuSection[] = [
		{
			items: [
				{ label: "Crear nuevo sprint", href: "/sprints/create" },
				{ label: "Todos los sprints", href: "/sprints" },
				{ label: "Sprints activos", href: "/sprints?filter=in_progress" },
				{ label: "Historial de sprints", href: "/sprints?filter=completed" },
				{ label: "Planificar sprint", href: "/sprints/plan" },
			],
		},
	];

	// Icono personalizado para sprints
	const sprintIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="1.5"
			stroke="currentColor"
			className="w-4 h-4"
			aria-hidden="true"
			role="img"
		>
			<title>Icono de sprint</title>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
			/>
		</svg>
	);

	return (
		<div className="space-y-6">
			<div className="bg-white p-6 rounded-lg shadow-md">
				<h2 className="text-xl font-bold mb-4 text-gray-800">
					Panel de Scrum Master
				</h2>
				<p className="text-gray-600 mb-6">
					Como Scrum Master, eres responsable de facilitar el proceso Scrum y
					ayudar al equipo a mejorar continuamente.
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
									Visualiza y gestiona los proyectos donde eres Scrum Master.
								</p>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-blue-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
								role="img"
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

					{/* Tarjeta de Sprints */}
					<div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
						<div className="flex justify-between items-start mb-4">
							<div>
								<h3 className="font-bold text-lg text-purple-800">
									Gestionar Sprints
								</h3>
								<p className="text-gray-600 mt-1">
									Planifica y administra los sprints de tus proyectos.
								</p>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-purple-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
								role="img"
							>
								<title>Icono de sprint</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<div className="flex justify-between items-center">
							<a href="/sprints" className="text-purple-600 hover:underline">
								Ver todos los sprints →
							</a>
							<DropdownMenu
								buttonText="Opciones"
								sections={sprintsSections}
								buttonIcon={sprintIcon}
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
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					<a
						href="/sprints"
						className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center transition-colors"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-8 w-8 mx-auto mb-2 text-gray-700"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
							role="img"
						>
							<title>Icono de nuevo sprint</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
						<span className="text-sm font-medium text-gray-700">
							Gestionar Sprints
						</span>
					</a>
				</div>
			</div>
		</div>
	);
}
