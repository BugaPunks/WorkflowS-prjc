import { UserRole } from "../../models/user.ts";
import LogoutButton from "../LogoutButton.tsx";
import ProductOwnerWelcomeOptions from "../ProductOwnerWelcomeOptions.tsx";
import ScrumMasterWelcomeOptions from "../ScrumMasterWelcomeOptions.tsx";
import TeamDeveloperWelcomeOptions from "../TeamDeveloperWelcomeOptions.tsx";
import UserInfoCard from "../UserInfoCard.tsx";
import AdminWelcomeOptions from "./AdminWelcomeOptions.tsx";
import CommonWelcomeOptions from "./CommonWelcomeOptions.tsx";
import WelcomeHeader from "./WelcomeHeader.tsx";

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
    <div class="bg-white shadow-md rounded-lg p-8 my-8">
      {/* Encabezado de bienvenida */}
      <WelcomeHeader username={session.username} />

      {/* Tarjeta de información del usuario */}
      <UserInfoCard username={session.username} email={session.email} role={session.role} />

      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-4">¿Qué puedes hacer ahora?</h2>

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
