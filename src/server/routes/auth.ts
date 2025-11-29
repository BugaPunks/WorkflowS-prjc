import bcryptjs from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";

// POST /api/auth/register - Registrar nuevo usuario
router.post("/register", async (req, res) => {
	try {
		console.log("Register body:", req.body);
		const { name, email, password, role = "TEAM_DEVELOPER" } = req.body;

		// Validar campos requeridos
		if (!name || !email || !password) {
			console.log("Missing fields:", { name, email, hasPassword: !!password });
			return res.status(400).json({ error: "Faltan campos requeridos" });
		}

		// Validar email
		if (!/\S+@\S+\.\S+/.test(email)) {
			return res.status(400).json({ error: "Email inválido" });
		}

		// Validar contraseña
		if (password.length < 6) {
			return res
				.status(400)
				.json({ error: "La contraseña debe tener mínimo 6 caracteres" });
		}

		// Verificar si el email ya existe
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			return res.status(400).json({ error: "El email ya está registrado" });
		}

		// Hashear contraseña
		const hashedPassword = await bcryptjs.hash(password, 10);

		// Crear usuario
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role,
				active: true,
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
			},
		});

		res.status(201).json({
			message: "Usuario registrado exitosamente",
			user,
		});
	} catch (error) {
		const err = error as { code?: string; message?: string };
		console.error("Error en registro:", error);
		if (err.code === "P2002") {
			return res.status(400).json({ error: "El email ya está registrado" });
		}
		res.status(500).json({
			error: "Error al registrar usuario",
			details: err.message || String(error),
		});
	}
});

// POST /api/auth/login - Iniciar sesión
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validar campos requeridos
		if (!email || !password) {
			return res.status(400).json({ error: "Email y contraseña requeridos" });
		}

		// Buscar usuario por email
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(401).json({ error: "Email o contraseña incorrectos" });
		}

		// Verificar contraseña
		const passwordMatch = await bcryptjs.compare(password, user.password);

		if (!passwordMatch) {
			return res.status(401).json({ error: "Email o contraseña incorrectos" });
		}

		// Verificar si el usuario está activo
		if (!user.active) {
			return res.status(403).json({ error: "Usuario desactivado" });
		}

		// Generar JWT
		const token = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				role: user.role,
			},
			JWT_SECRET,
			{ expiresIn: "24h" },
		);

		res.json({
			message: "Inicio de sesión exitoso",
			token,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Error en login:", error);
		res.status(500).json({ error: "Error al iniciar sesión" });
	}
});

// POST /api/auth/logout - Cerrar sesión (placeholder para futuro JWT)
router.post("/logout", (_req, res) => {
	res.json({ message: "Sesión cerrada" });
});

export default router;
