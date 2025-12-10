import { useSession } from "@/hooks/useSession";
import CommonWelcomeOptions from "@/islands/CommonWelcomeOptions";
import ProductOwnerWelcomeOptions from "@/islands/ProductOwnerWelcomeOptions";
import ScrumMasterWelcomeOptions from "@/islands/ScrumMasterWelcomeOptions";
import TeamDeveloperWelcomeOptions from "@/islands/TeamDeveloperWelcomeOptions";
import WelcomeHeader from "@/islands/WelcomeHeader";
import { UserRole } from "@/models/user";

export default function StudentDashboard() {
	const { session } = useSession();

	if (!session) return null;

	const renderRoleSpecificOptions = () => {
		switch (session.role) {
			case UserRole.PRODUCT_OWNER:
				return <ProductOwnerWelcomeOptions />;
			case UserRole.SCRUM_MASTER:
				return <ScrumMasterWelcomeOptions />;
			case UserRole.TEAM_DEVELOPER:
				return <TeamDeveloperWelcomeOptions />;
			default:
				// Fallback for students with undefined specific role, defaults to Dev view
				return <TeamDeveloperWelcomeOptions />;
		}
	};

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<WelcomeHeader username={session.name} />

			{/* Role Specific Content */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				{renderRoleSpecificOptions()}
			</div>

			{/* Common Tools */}
			<div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-800 mb-4">
					Herramientas Comunes
				</h3>
				<CommonWelcomeOptions />
			</div>
		</div>
	);
}
