import bcryptjs from "bcryptjs";
import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET todos los usuarios
router.get("/", async (_req, res) => {
	try {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				active: true,
				createdAt: true,
			},
		});
		res.json({ data: users });
	} catch {
		res.status(500).json({ error: "Error al obtener usuarios" });
	}
});

// GET usuario por ID
router.get("/:id", async (req, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.params.id },
			include: {
				projects: true,
				tasks: true,
			},
		});
		if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
		res.json({ data: user });
	} catch {
		res.status(500).json({ error: "Error al obtener usuario" });
	}
});

// POST crear usuario
router.post("/", async (req, res) => {
	try {
		const { email, name, password, role } = req.body;

		if (!email || !name || !password) {
			return res.status(400).json({ error: "Faltan campos requeridos" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);

		const user = await prisma.user.create({
			data: {
				email,
				name,
				password: hashedPassword,
				role: role || "TEAM_DEVELOPER",
			},
		});
		res.status(201).json({ data: user });
	} catch (error) {
		const err = error as { code?: string };
		if (err.code === "P2002") {
			return res.status(400).json({ error: "Email ya existe" });
		}
		res.status(500).json({ error: "Error al crear usuario" });
	}
});

// PUT actualizar usuario
router.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { password, ...otherData } = req.body;

		interface UserUpdateData {
			name?: string;
			email?: string;
			role?: "ADMIN" | "TEAM_DEVELOPER" | "PRODUCT_OWNER" | "SCRUM_MASTER";
			active?: boolean;
			password?: string;
		}

		const updateData: UserUpdateData = { ...otherData };

		if (password && typeof password === "string" && password.trim() !== "") {
			updateData.password = await bcryptjs.hash(password, 10);
		}

		const user = await prisma.user.update({
			where: { id },
			data: updateData,
		});
		res.json({ data: user });
	} catch {
		res.status(500).json({ error: "Error al actualizar usuario" });
	}
});

// DELETE usuario
router.delete("/:id", async (req, res) => {
	try {
		await prisma.user.delete({
			where: { id: req.params.id },
		});
		res.json({ data: { message: "Usuario eliminado" } });
	} catch {
		res.status(500).json({ error: "Error al eliminar usuario" });
	}
});

export default router;
