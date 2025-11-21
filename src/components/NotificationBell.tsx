import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";

interface Notification {
	id: string;
	title: string;
	message: string;
	type: string;
	read: boolean;
	createdAt: string;
}

export function NotificationBell() {
	const { session: user } = useSession();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);

	const loadNotifications = useCallback(async () => {
		if (!user) return;
		try {
			const response = await fetch(`/api/notifications?userId=${user.id}`);
			if (response.ok) {
				const data = await response.json();
				setNotifications(data.data || []);
				setUnreadCount(data.data.filter((n: Notification) => !n.read).length);
			}
		} catch (error) {
			console.error(error);
		}
	}, [user]);

	useEffect(() => {
		loadNotifications();
		const interval = setInterval(loadNotifications, 10000); // Poll every 10s
		return () => clearInterval(interval);
	}, [loadNotifications]);

	const handleMarkRead = async (id: string) => {
		try {
			await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
			setNotifications((prev) =>
				prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error(error);
		}
	};

	// Close on outside click could be implemented, but for now simple toggle

	return (
		<div className="relative group/notifications">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
				aria-label="Notificaciones"
				aria-expanded={isOpen}
			>
				<Bell size={20} />
				{unreadCount > 0 && (
					<span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className="absolute bottom-full left-0 mb-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl shadow-indigo-500/10 overflow-hidden z-50 border border-gray-100 animate-in slide-in-from-bottom-2 duration-200 origin-bottom-left max-h-[80vh] flex flex-col">
					<div className="p-4 bg-white border-b border-gray-50 flex justify-between items-center sticky top-0 z-10">
						<h3 className="font-semibold text-gray-900">Notificaciones</h3>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded-md transition-colors"
							aria-label="Cerrar notificaciones"
						>
							✕
						</button>
					</div>
					<div className="overflow-y-auto flex-1">
						{notifications.length === 0 ? (
							<div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
								<Bell size={24} className="text-gray-300 mb-1" />
								No tienes notificaciones nuevas.
							</div>
						) : (
							<div className="flex flex-col divide-y divide-gray-50">
								{notifications.map((notification) => (
									<button
										key={notification.id}
										type="button"
										onClick={() =>
											!notification.read && handleMarkRead(notification.id)
										}
										className={cn(
											"p-4 text-left hover:bg-gray-50 transition-colors w-full focus:outline-none focus:bg-gray-50",
											!notification.read
												? "bg-indigo-50/30 hover:bg-indigo-50/50"
												: "bg-white",
										)}
									>
										<div className="flex justify-between items-start mb-1 gap-2">
											<h4
												className={cn(
													"text-sm line-clamp-1",
													!notification.read
														? "font-bold text-indigo-900"
														: "font-medium text-gray-700",
												)}
											>
												{notification.title}
											</h4>
											<span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
												{new Date(notification.createdAt).toLocaleDateString(
													undefined,
													{ month: "short", day: "numeric" },
												)}
											</span>
										</div>
										<p
											className={cn(
												"text-xs line-clamp-2",
												!notification.read
													? "text-indigo-700/80"
													: "text-gray-500",
											)}
										>
											{notification.message}
										</p>
										{!notification.read && (
											<div className="mt-2 flex items-center gap-1">
												<div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
												<span className="text-[10px] font-medium text-indigo-600">
													No leído
												</span>
											</div>
										)}
									</button>
								))}
							</div>
						)}
					</div>
					{notifications.length > 0 && (
						<div className="p-2 bg-gray-50 border-t border-gray-100 text-center">
							<button
								type="button"
								className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
							>
								Ver todas
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
