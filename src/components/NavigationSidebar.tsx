import { Link, useLocation, useNavigate } from "react-router-dom";
import { NotificationBell } from "./NotificationBell";

interface SidebarProps {
	isOpen: boolean;
	user?: { id: string; name: string; email: string; role: string };
	onClose?: () => void; // Added for mobile close
}

export default function Sidebar({ isOpen, user, onClose }: SidebarProps) {
	const location = useLocation();
	const navigate = useNavigate();

	const ADMIN_MENU = [
		{ label: "Proyectos", href: "/projects", icon: "📊" },
		{ label: "Sprints", href: "/sprints", icon: "🏃" },
		{ label: "Tareas", href: "/tasks", icon: "✓" },
		{ label: "Historias", href: "/user-stories", icon: "📖" },
		{ label: "Reportes", href: "/reports", icon: "📈" },
		{ label: "Evaluaciones", href: "/evaluations", icon: "⭐" },
	];

	const STUDENT_MENU = [
		{ label: "Proyectos", href: "/projects", icon: "📊" },
		{ label: "Sprints", href: "/sprints", icon: "🏃" },
		{ label: "Tareas", href: "/tasks", icon: "✓" },
		{ label: "Historias", href: "/user-stories", icon: "📖" },
		{ label: "Reportes", href: "/reports", icon: "📈" },
	];

	// Seleccionar menú según el rol del usuario
	const filteredItems = user?.role === "ADMIN" ? ADMIN_MENU : STUDENT_MENU;

	const isActive = (href: string) => location.pathname === href;

	const handleLogout = () => {
		localStorage.removeItem("user");
		navigate("/login");
	};

	return (
		<>
			{/* Sidebar */}
			<aside
				className={`${
					isOpen ? "w-64" : "w-20"
				} bg-gray-900 text-white transition-all duration-300 hidden lg:flex flex-col`}
			>
				{/* Logo */}
				<div className="flex items-center justify-center h-16 border-b border-gray-700">
					<span className={`font-bold text-xl ${!isOpen && "hidden"}`}>WS</span>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-4 py-6 space-y-2">
					{filteredItems.map((item) => (
						<Link
							key={item.href}
							to={item.href}
							className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
								isActive(item.href)
									? "bg-blue-600 text-white"
									: "text-gray-300 hover:bg-gray-800"
							}`}
						>
							<span className="text-xl">{item.icon}</span>
							{isOpen && <span className="font-medium">{item.label}</span>}
						</Link>
					))}
				</nav>

				{/* User Info & Logout */}
				{isOpen && (
					<div className="border-t border-gray-700 p-4">
						<div className="mb-4 flex justify-end">
							<NotificationBell />
						</div>
						<div className="flex items-center gap-3 mb-3">
							<div className="w-10 h-10 bg-linear-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
								{user?.name?.charAt(0).toUpperCase()}
							</div>
							<div className="text-sm overflow-hidden">
								<p className="font-medium truncate">{user?.name}</p>
								<p className="text-gray-400 text-xs truncate">{user?.role}</p>
							</div>
						</div>
						<button
							type="button"
							onClick={handleLogout}
							className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
						>
							<span>🚪</span> Cerrar Sesión
						</button>
					</div>
				)}
			</aside>

			{/* Mobile Sidebar */}
			{isOpen && (
				<div className="fixed inset-0 z-40 lg:hidden">
					<button
						type="button"
						className="absolute inset-0 bg-black bg-opacity-50 w-full h-full cursor-default"
						onClick={onClose}
						onKeyDown={(e) => {
							if (e.key === "Escape" && onClose) onClose();
						}}
						aria-label="Cerrar menú"
					/>
					<aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col">
						<div className="flex items-center justify-center h-16 border-b border-gray-700">
							<span className="font-bold text-xl">WorkflowS</span>
						</div>
						<nav className="flex-1 px-4 py-6 space-y-2">
							{filteredItems.map((item) => (
								<Link
									key={item.href}
									to={item.href}
									onClick={onClose}
									className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
										isActive(item.href)
											? "bg-blue-600 text-white"
											: "text-gray-300 hover:bg-gray-800"
									}`}
								>
									<span className="text-xl">{item.icon}</span>
									<span className="font-medium">{item.label}</span>
								</Link>
							))}
							<button
								type="button"
								onClick={handleLogout}
								className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors mt-4"
							>
								<span className="text-xl">🚪</span>
								<span className="font-medium">Cerrar Sesión</span>
							</button>
						</nav>
					</aside>
				</div>
			)}
		</>
	);
}
