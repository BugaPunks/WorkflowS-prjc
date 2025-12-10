import StudentDashboard from "@/components/dashboards/StudentDashboard";
import TeacherDashboard from "@/components/dashboards/TeacherDashboard";
import { useSession } from "@/hooks/useSession";
import { UserRole } from "@/models/user";

export default function Dashboard() {
	const { session, loading } = useSession();

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
			</div>
		);
	}

	if (!session) return null;

	return (
		<div className="p-8 max-w-7xl mx-auto">
			{session.role === UserRole.ADMIN ? (
				<TeacherDashboard />
			) : (
				<StudentDashboard />
			)}
		</div>
	);
}
