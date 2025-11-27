import { Router } from "express";
import { prisma } from "../db";

const router = Router();

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
router.post("/:projectId", async (req, res) => {
	try {
		const { projectId } = req.params;
		const { name, type, size } = req.body;

		if (!name) return res.status(400).json({ error: "Nombre requerido" });

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
			// If it exists, we could either return error or create version automatically.
			// To be explicit, let's treat it as "conflict" unless the user used the "new version" endpoint.
			// But for backward compatibility/simplicity, if they just upload same name, we can create version.
			// Let's create version to be friendly.

			const lastVersion =
				existingDoc.versions.length > 0
					? existingDoc.versions[0].version
					: existingDoc.version;
			const newVersion = lastVersion + 1;

			const version = await prisma.document.create({
				data: {
					projectId,
					name,
					type: type || "FILE",
					size: size || 0,
					url: `https://fake-storage.com/${projectId}/${name}?v=${newVersion}`,
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
				type: type || "FILE",
				size: size || 0,
				url: `https://fake-storage.com/${projectId}/${name}?v=1`,
				version: 1,
			},
		});

		res.status(201).json(document);
	} catch (_error) {
		console.error(_error);
		res.status(500).json({ error: "Error al subir documento" });
	}
});

// POST subir nueva versión explícita
router.post("/:id/versions", async (req, res) => {
	try {
		const { id } = req.params; // Parent Document ID
		const { name, type, size } = req.body;

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

		// If the user tries to add version to a child, redirect to parent?
		// Better to enforce that :id is the parent.
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

		// If name is not provided, use parent name
		const finalName = name || parentDoc.name;

		const document = await prisma.document.create({
			data: {
				projectId: parentDoc.projectId,
				name: finalName,
				type: type || parentDoc.type,
				size: size || parentDoc.size,
				url: `https://fake-storage.com/${parentDoc.projectId}/${finalName}?v=${newVersion}`,
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
