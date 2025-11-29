import { Router } from "express";
import multer from "multer";
import { prisma } from "../db";

const router = Router();

// Configuración de Multer para almacenamiento local
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, "uploads/");
	},
	filename: (_req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		cb(null, `${uniqueSuffix}-${file.originalname}`);
	},
});

const upload = multer({ storage });

// GET documentos de un proyecto (solo las versiones más recientes)
router.get("/:projectId", async (req, res) => {
	try {
		const { projectId } = req.params;
		// Get all documents where parentId is null (top level documents)
		const documents = await prisma.document.findMany({
			where: {
				projectId,
				parentId: null,
			},
			include: {
				versions: {
					orderBy: { version: "desc" },
				},
			},
			orderBy: { uploadedAt: "desc" },
		});

		const result = documents.map((doc) => {
			// Find max version
			const maxVersion =
				doc.versions.length > 0
					? Math.max(...doc.versions.map((v) => v.version), doc.version)
					: doc.version;

			return {
				...doc,
				latestVersion: maxVersion,
				versionCount: doc.versions.length + 1,
			};
		});

		res.json({ data: result });
	} catch (_error) {
		res.status(500).json({ error: "Error al obtener documentos" });
	}
});

// POST subir documento (Root)
router.post("/:projectId", upload.single("file"), async (req, res) => {
	try {
		const { projectId } = req.params;
		const file = req.file;

		if (!file) return res.status(400).json({ error: "No se envió archivo" });

		const name = Buffer.from(file.originalname, "latin1").toString("utf8"); // Handle potential encoding issues
		const type = file.mimetype.split("/").pop()?.toUpperCase() || "FILE";
		const size = file.size;
		// Ensure URL is accessible from frontend (served via express.static at /uploads)
		const url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

		// Check if document with same name exists in this project (and is a root document)
		const existingDoc = await prisma.document.findFirst({
			where: {
				projectId,
				name,
				parentId: null,
			},
			include: {
				versions: {
					orderBy: { version: "desc" },
					take: 1,
				},
			},
		});

		if (existingDoc) {
			const lastVersion =
				existingDoc.versions.length > 0
					? existingDoc.versions[0].version
					: existingDoc.version;
			const newVersion = lastVersion + 1;

			const version = await prisma.document.create({
				data: {
					projectId,
					name,
					type,
					size,
					url,
					version: newVersion,
					parentId: existingDoc.id,
				},
			});
			return res.status(201).json(version);
		}

		// Create new root document
		const document = await prisma.document.create({
			data: {
				projectId,
				name,
				type,
				size,
				url,
				version: 1,
			},
		});

		res.status(201).json(document);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error al subir documento" });
	}
});

// POST subir nueva versión explícita
router.post("/:id/versions", upload.single("file"), async (req, res) => {
	try {
		const { id } = req.params; // Parent Document ID
		const file = req.file;

		if (!file) return res.status(400).json({ error: "No se envió archivo" });

		// Find parent
		const parentDoc = await prisma.document.findUnique({
			where: { id },
			include: {
				versions: {
					orderBy: { version: "desc" },
					take: 1,
				},
			},
		});

		if (!parentDoc) {
			return res
				.status(404)
				.json({ error: "Documento original no encontrado" });
		}

		if (parentDoc.parentId) {
			return res.status(400).json({
				error:
					"No se puede crear una versión de una versión. Use el ID del documento original.",
			});
		}

		const lastVersion =
			parentDoc.versions.length > 0
				? parentDoc.versions[0].version
				: parentDoc.version;
		const newVersion = lastVersion + 1;

		const name = Buffer.from(file.originalname, "latin1").toString("utf8");
		const type = file.mimetype.split("/").pop()?.toUpperCase() || "FILE";
		const size = file.size;
		const url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

		const document = await prisma.document.create({
			data: {
				projectId: parentDoc.projectId,
				name,
				type,
				size,
				url,
				version: newVersion,
				parentId: parentDoc.id,
			},
		});

		res.status(201).json(document);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error al crear nueva versión" });
	}
});

// GET historial de versiones
router.get("/:id/versions", async (req, res) => {
	try {
		const { id } = req.params;
		const doc = await prisma.document.findUnique({
			where: { id },
		});

		if (!doc) return res.status(404).json({ error: "Documento no encontrado" });

		// If it's a version, find parent. If it's parent, use it.
		const parentId = doc.parentId || doc.id;

		const history = await prisma.document.findMany({
			where: {
				OR: [{ id: parentId }, { parentId: parentId }],
			},
			orderBy: { version: "desc" },
		});

		res.json({ data: history });
	} catch (_error) {
		res.status(500).json({ error: "Error al obtener versiones" });
	}
});

// DELETE documento
router.delete("/:id", async (req, res) => {
	try {
		await prisma.document.delete({ where: { id: req.params.id } });
		res.json({ message: "Documento eliminado" });
	} catch (_error) {
		res.status(500).json({ error: "Error al eliminar documento" });
	}
});

export default router;
