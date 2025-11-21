import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET documentos de un proyecto
router.get("/:projectId", async (req, res) => {
	try {
		const { projectId } = req.params;
		const documents = await prisma.document.findMany({
			where: { projectId },
			orderBy: { uploadedAt: "desc" },
		});
		res.json({ data: documents });
	} catch (_error) {
		res.status(500).json({ error: "Error al obtener documentos" });
	}
});

// POST subir documento (Simulado)
router.post("/:projectId", async (req, res) => {
	try {
		const { projectId } = req.params;
		const { name, type, size } = req.body;

		if (!name) return res.status(400).json({ error: "Nombre requerido" });

		const document = await prisma.document.create({
			data: {
				projectId,
				name,
				type: type || "FILE",
				size: size || 0,
				url: `https://fake-storage.com/${projectId}/${name}`, // Simulado
			},
		});

		res.status(201).json({ data: document });
	} catch (_error) {
		res.status(500).json({ error: "Error al subir documento" });
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
