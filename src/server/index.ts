import cors from 'cors';
import express, { type Express } from 'express';
import 'dotenv/config';

// Importar rutas
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';
import sprintsRouter from './routes/sprints';
import tasksRouter from './routes/tasks';
import userStoriesRouter from './routes/user-stories';
import usersRouter from './routes/users';

const app: Express = express();
const PORT = process.env.API_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/sprints', sprintsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/user-stories', userStoriesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling para rutas no encontradas
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 API Server corriendo en http://localhost:${PORT}`);
  console.log('📚 Rutas disponibles:');
  console.log('   POST   /api/auth/register');
  console.log('   POST   /api/auth/login');
  console.log('   POST   /api/auth/logout');
  console.log('   GET    /api/health');
  console.log('   GET    /api/users');
  console.log('   POST   /api/users');
  console.log('   GET    /api/projects');
  console.log('   POST   /api/projects');
  console.log('   GET    /api/sprints');
  console.log('   POST   /api/sprints');
  console.log('   GET    /api/tasks');
  console.log('   POST   /api/tasks');
  console.log('   GET    /api/user-stories');
  console.log('   POST   /api/user-stories');
});

export default server;
