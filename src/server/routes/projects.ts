import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET todos los proyectos
router.get("/", async (req, res) => {
	try {
		const { memberId } = req.query;
		const whereClause = memberId
			? {
					OR: [
						{ ownerId: String(memberId) },
						{ members: { some: { userId: String(memberId) } } },
					],
				}
			: {};

		const projects = await prisma.project.findMany({
			where: whereClause,
			include: {
				owner: {
					select: { id: true, name: true, email: true },
				},
				members: true,
				sprints: true,
			},
		});
		res.json(projects);
	} catch (error) {
		console.error("Error al obtener proyectos:", error);
		res.status(500).json({
			error: "Error al obtener proyectos",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// GET proyecto por ID
router.get("/:id", async (req, res) => {
	try {
		const project = await prisma.project.findUnique({
			where: { id: req.params.id },
			include: {
				owner: true,
				members: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								role: true,
								avatar: true,
							},
						},
					},
				},
				sprints: true,
				userStories: true,
				tasks: true,
			},
		});
		if (!project)
			return res.status(404).json({ error: "Proyecto no encontrado" });
		res.json({ data: project });
	} catch (error) {
		console.error("Error al obtener proyecto:", error);
		res.status(500).json({
			error: "Error al obtener proyecto",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// POST crear proyecto
router.post("/", async (req, res) => {
	try {
		const { name, description, ownerId, startDate, endDate } = req.body;

		if (!name || !ownerId) {
			return res.status(400).json({ error: "Faltan campos requeridos" });
		}

		const project = await prisma.project.create({
			data: {
				name,
				description,
				ownerId,
				startDate: startDate ? new Date(startDate) : undefined,
				endDate: endDate ? new Date(endDate) : undefined,
			},
		});
		res.status(201).json({ data: project });
	} catch (error) {
		console.error("Error al crear proyecto:", error);
		res.status(500).json({
			error: "Error al crear proyecto",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// PUT actualizar proyecto
router.put("/:id", async (req, res) => {
	try {
		const { startDate, endDate, ...rest } = req.body;
		const project = await prisma.project.update({
			where: { id: req.params.id },
			data: {
				...rest,
				startDate: startDate ? new Date(startDate) : undefined,
				endDate: endDate ? new Date(endDate) : undefined,
			},
		});
		res.json({ data: project });
	} catch (error) {
		console.error("Error al actualizar proyecto:", error);
		res.status(500).json({
			error: "Error al actualizar proyecto",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// POST asignar miembro a proyecto
router.post("/:id/members", async (req, res) => {
	try {
		const projectId = req.params.id;
		const { userId, role } = req.body; // role: SCRUM_MASTER, PRODUCT_OWNER, TEAM_DEVELOPER

		if (!userId || !role) {
			return res
				.status(400)
				.json({ error: "Faltan campos requeridos (userId, role)" });
		}

		// Check if already member
		const existingMember = await prisma.projectMember.findUnique({
			where: {
				projectId_userId: {
					projectId,
					userId,
				},
			},
		});

		if (existingMember) {
			// Update role if exists
			const updatedMember = await prisma.projectMember.update({
				where: { id: existingMember.id },
				data: { role },
			});
			return res.json({ data: updatedMember, message: "Rol actualizado" });
		}

		const member = await prisma.projectMember.create({
			data: {
				projectId,
				userId,
				role,
			},
			include: {
				project: { select: { name: true } },
			},
		});

		// Notificar al usuario
		await prisma.notification.create({
			data: {
				userId,
				title: "Nuevo Proyecto Asignado",
				message: `Has sido añadido al proyecto "${member.project.name}" como ${role}`,
				type: "PROJECT_ASSIGNED",
			},
		});

		res.status(201).json({ data: member });
	} catch (error) {
		console.error("Error al asignar miembro:", error);
		res.status(500).json({
			error: "Error al asignar miembro",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// DELETE eliminar miembro de proyecto
router.delete("/:id/members/:userId", async (req, res) => {
	try {
		const { id: projectId, userId } = req.params;
		await prisma.projectMember.delete({
			where: {
				projectId_userId: {
					projectId,
					userId,
				},
			},
		});
		res.json({ message: "Miembro eliminado del proyecto" });
	} catch (error) {
		console.error("Error al eliminar miembro:", error);
		res.status(500).json({ error: "Error al eliminar miembro" });
	}
});

// DELETE proyecto
router.delete("/:id", async (req, res) => {
	try {
		await prisma.project.delete({
			where: { id: req.params.id },
		});
		res.json({ data: { message: "Proyecto eliminado" } });
	} catch (error) {
		console.error("Error al eliminar proyecto:", error);
		res.status(500).json({
			error: "Error al eliminar proyecto",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

export default router;
