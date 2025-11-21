import "./App.css";
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import { LoginForm } from "@/auth/LoginForm";
import { LoginSuccess } from "@/auth/LoginSuccess";
import { RegisterForm } from "@/auth/RegisterForm";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SessionProvider } from "@/hooks/useSession";
import Evaluations from "@/pages/Evaluations";
import ProjectDetail from "@/pages/ProjectDetail";
import Projects from "@/pages/Projects";
import Reports from "@/pages/Reports";
import Sprints from "@/pages/Sprints";
import Tasks from "@/pages/Tasks";
import UserStories from "@/pages/UserStories";

const App = () => {
	return (
		<Router>
			<SessionProvider>
				<Routes>
					{/* Rutas de autenticación */}
					<Route path="/login" element={<LoginForm />} />
					<Route path="/register" element={<RegisterForm />} />
					<Route path="/login-success" element={<LoginSuccess />} />

					{/* Rutas protegidas con DashboardLayout */}
					<Route element={<DashboardLayout />}>
						<Route path="/projects" element={<Projects />} />
						<Route path="/projects/:id" element={<ProjectDetail />} />
						<Route path="/sprints" element={<Sprints />} />
						<Route path="/tasks" element={<Tasks />} />
						<Route path="/user-stories" element={<UserStories />} />
						<Route path="/reports" element={<Reports />} />
						<Route path="/evaluations" element={<Evaluations />} />
					</Route>

					{/* Redirección por defecto */}
					<Route path="/" element={<Navigate to="/projects" replace />} />
				</Routes>
			</SessionProvider>
		</Router>
	);
};

export default App;
