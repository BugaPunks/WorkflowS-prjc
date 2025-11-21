import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";

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

	// Keyboard handler for accessibility
	const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
		if (e.key === "Enter" || e.key === " ") {
			handleMarkRead(id);
		}
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
				aria-label="Notificaciones"
			>
				<span className="text-xl">🔔</span>
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
						{unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200 animate-fade-in">
					<div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
						<h3 className="font-semibold text-gray-700">Notificaciones</h3>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="text-gray-400 hover:text-gray-600"
						>
							×
						</button>
					</div>
					<div className="max-h-96 overflow-y-auto">
						{notifications.length === 0 ? (
							<div className="p-4 text-center text-gray-500 text-sm">
								No tienes notificaciones.
							</div>
						) : (
							notifications.map((notification) => (
								<button
									key={notification.id}
									type="button"
									onClick={() =>
										!notification.read && handleMarkRead(notification.id)
									}
									onKeyDown={(e) =>
										!notification.read && handleKeyDown(e, notification.id)
									}
									className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
										!notification.read ? "bg-blue-50" : ""
									}`}
								>
									<div className="flex justify-between items-start mb-1">
										<h4
											className={`text-sm ${!notification.read ? "font-bold text-blue-800" : "font-semibold text-gray-700"}`}
										>
											{notification.title}
										</h4>
										<span className="text-xs text-gray-400">
											{new Date(notification.createdAt).toLocaleDateString()}
										</span>
									</div>
									<p className="text-sm text-gray-600">
										{notification.message}
									</p>
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
