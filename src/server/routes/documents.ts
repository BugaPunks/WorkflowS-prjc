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

		// If a document has versions, the "latest" info is actually in the versions array if we want to show that?
		// Or usually we show the "parent" as the container and the highest version number.
		// Let's map to a structure that shows version info.

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

		res.json(result);
	} catch (_error) {
		res.status(500).json({ error: "Error al obtener documentos" });
	}
});

// POST subir documento (Simulado con Versionado)
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

		let document: {
			id: string;
			name: string;
			type: string;
			size: number;
			uploadedAt: Date;
			projectId: string;
			url: string;
			version: number;
		};

		if (existingDoc) {
			// Create a new version
			// Determine next version number
			const lastVersion =
				existingDoc.versions.length > 0
					? existingDoc.versions[0].version
					: existingDoc.version;
			const newVersion = lastVersion + 1;

			document = await prisma.document.create({
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
		} else {
			// Create new root document
			document = await prisma.document.create({
				data: {
					projectId,
					name,
					type: type || "FILE",
					size: size || 0,
					url: `https://fake-storage.com/${projectId}/${name}?v=1`,
					version: 1,
				},
			});
		}

		res.status(201).json(document);
	} catch (_error) {
		console.error(_error);
		res.status(500).json({ error: "Error al subir documento" });
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

		res.json(history);
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
