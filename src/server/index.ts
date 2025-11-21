import cors from "cors";
import express, { type Express } from "express";
import "dotenv/config";

// Importar rutas
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import documentsRouter from "./routes/documents";
import metricsRouter from "./routes/metrics";
import projectsRouter from "./routes/projects";
import rubricsRouter from "./routes/rubrics";
import sprintsRouter from "./routes/sprints";
import tasksRouter from "./routes/tasks";
import userStoriesRouter from "./routes/user-stories";
import usersRouter from "./routes/users";

const app: Express = express();
const PORT = process.env.API_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas API
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/sprints", sprintsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/user-stories", userStoriesRouter);
app.use("/api/chat", chatRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/rubrics", rubricsRouter);
app.use("/api/metrics", metricsRouter);

// Health check
app.get("/api/health", (_req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling para rutas no encontradas
app.use((_req, res) => {
	res.status(404).json({ error: "Ruta no encontrada" });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
	console.log(`🚀 API Server corriendo en http://localhost:${PORT}`);
	console.log("📚 Rutas disponibles:");
	console.log("   POST   /api/auth/register");
	console.log("   POST   /api/auth/login");
	console.log("   GET    /api/projects");
	console.log("   POST   /api/chat/:projectId/messages");
	console.log("   GET    /api/documents/:projectId");
});

export default server;
