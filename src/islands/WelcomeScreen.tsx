import { UserRole } from "@/models/user";
import AdminWelcomeOptions from "./AdminWelcomeOptions";
import CommonWelcomeOptions from "./CommonWelcomeOptions";
import LogoutButton from "./LogoutButton";
import ProductOwnerWelcomeOptions from "./ProductOwnerWelcomeOptions";
import ScrumMasterWelcomeOptions from "./ScrumMasterWelcomeOptions";
import TeamDeveloperWelcomeOptions from "./TeamDeveloperWelcomeOptions";
import UserInfoCard from "./UserInfoCard";
import WelcomeHeader from "./WelcomeHeader";

interface WelcomeScreenProps {
	session: {
		username: string;
		email: string;
		role: UserRole;
	};
}

export default function WelcomeScreen({ session }: WelcomeScreenProps) {
	// Renderizar las opciones específicas según el rol del usuario
	const renderRoleSpecificOptions = () => {
		switch (session.role) {
			case UserRole.ADMIN:
				return <AdminWelcomeOptions />;
			case UserRole.PRODUCT_OWNER:
				return <ProductOwnerWelcomeOptions />;
			case UserRole.SCRUM_MASTER:
				return <ScrumMasterWelcomeOptions />;
			case UserRole.TEAM_DEVELOPER:
				return <TeamDeveloperWelcomeOptions />;
			default:
				return null;
		}
	};

	return (
		<div className="bg-white shadow-md rounded-lg p-8 my-8">
			{/* Encabezado de bienvenida */}
			<WelcomeHeader username={session.username} />

			{/* Tarjeta de información del usuario */}
			<UserInfoCard
				username={session.username}
				email={session.email}
				role={session.role}
			/>

			<div className="mt-6">
				<h2 className="text-xl font-semibold mb-4">¿Qué puedes hacer ahora?</h2>

				{/* Opciones específicas según el rol */}
				{renderRoleSpecificOptions()}

				{/* Opciones comunes para todos los roles */}
				{session.role !== UserRole.ADMIN && <CommonWelcomeOptions />}
			</div>

			{/* Botón de cerrar sesión */}
			<LogoutButton />
		</div>
	);
}
