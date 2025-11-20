import './App.css';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import { LoginForm } from '@/auth/LoginForm';
import { LoginSuccess } from '@/auth/LoginSuccess';
import { RegisterForm } from '@/auth/RegisterForm';
import { SessionProvider } from '@/hooks/useSession';
import ComingSoon from '@/pages/ComingSoon';
import ProjectDetail from '@/pages/ProjectDetail';
import Projects from '@/pages/Projects';
import Sprints from '@/pages/Sprints';
import Tasks from '@/pages/Tasks';
import UserStories from '@/pages/UserStories';

const App = () => {
  return (
    <Router>
      <SessionProvider>
        <Routes>
          {/* Rutas de autenticación */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login-success" element={<LoginSuccess />} />

          {/* Rutas principales */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/sprints" element={<Sprints />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/user-stories" element={<UserStories />} />
          <Route
            path="/reports"
            element={
              <ComingSoon
                title="Reportes"
                description="Próximamente tendrás acceso a reportes detallados de tu proyecto"
                icon="📈"
              />
            }
          />
          <Route
            path="/evaluations"
            element={
              <ComingSoon
                title="Evaluaciones"
                description="Las evaluaciones estarán disponibles muy pronto"
                icon="⭐"
              />
            }
          />

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/projects" replace />} />
        </Routes>
      </SessionProvider>
    </Router>
  );
};

export default App;
