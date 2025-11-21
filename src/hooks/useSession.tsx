import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { type User, UserRole } from "@/models/user";

interface SessionContextType {
	session: User | null;
	loading: boolean;
	isAuthenticated: boolean;
	login: (userData: User) => void;
	logout: () => void;
	permissions: string[];
}

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [session, setSession] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [permissions, setPermissions] = useState<string[]>([]);

	useEffect(() => {
		// Cargar sesión desde localStorage al inicio
		const userData = localStorage.getItem("user");
		if (userData) {
			try {
				const parsedUser = JSON.parse(userData);
				setSession(parsedUser);
			} catch (error) {
				console.error("Error al parsear los datos de sesión:", error);
			}
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		// Actualizar permisos según el rol del usuario
		if (session) {
			const newPermissions = getPermissionsByRole(session.role);
			setPermissions(newPermissions);
		} else {
			setPermissions([]);
		}
	}, [session]);

	const login = (userData: User) => {
		// Filtrar el usuario para no guardar el password en localStorage
		// Usamos `_password` para indicar que es intencionalmente no utilizado
		const { password: _password, ...userForStorage } = userData;
		// Usar la sintaxis spread del objeto para ignorar un valor sin usar
		setSession({ ...userData, password: "" }); // No almacenar el password en la sesión
		localStorage.setItem("user", JSON.stringify(userForStorage));
	};

	const logout = () => {
		setSession(null);
		setPermissions([]);
		localStorage.removeItem("user");
	};

	const value: SessionContextType = {
		session,
		loading,
		isAuthenticated: !!session,
		login,
		logout,
		permissions,
	};

	return (
		<SessionContext.Provider value={value}>{children}</SessionContext.Provider>
	);
};

const getPermissionsByRole = (role: UserRole): string[] => {
	switch (role) {
		case UserRole.ADMIN:
			return [
				"create:project",
				"edit:project",
				"delete:project",
				"manage:users",
				"view:rubrics",
			];
		case UserRole.PRODUCT_OWNER:
			return [
				"create:project",
				"edit:project",
				"create:user-story",
				"create:sprint",
				"manage:team",
			];
		case UserRole.SCRUM_MASTER:
			return [
				"create:sprint",
				"manage:sprint",
				"assign:user-story",
				"create:task",
			];
		case UserRole.TEAM_DEVELOPER:
			return ["create:task", "update:task", "view:project"];
		default:
			return ["view:project"];
	}
};

export const useSession = () => {
	const context = useContext(SessionContext);
	if (!context) {
		throw new Error("useSession debe ser usado dentro de un SessionProvider");
	}
	return context;
};
