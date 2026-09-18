import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logAction } from "../lib/audit.js";

// Fábrica de CRUD REST protegido: qualquer usuário autenticado pode ler;
// somente ADMIN/MANAGER podem criar, editar ou excluir (EMPLOYEE fica só leitura).
// Isso é a autorização aplicada de verdade no backend (não só escondida na tela).
export function crudRouter(model, entityName, { writeRoles = ["ADMIN", "MANAGER"] } = {}) {
  const router = Router();
  router.use(requireAuth);

  router.get("/", async (req, res) => {
    const rows = await model.findMany({ orderBy: { id: "desc" } });
    res.json(rows);
  });

  router.get("/:id", async (req, res) => {
    const row = await model.findUnique({ where: { id: req.params.id } });
    if (!row) return res.status(404).json({ error: "Não encontrado." });
    res.json(row);
  });

  router.post("/", requireRole(...writeRoles), async (req, res) => {
    try {
      const row = await model.create({ data: req.body });
      await logAction(req.user.id, "CREATE", entityName, row.id, null);
      res.status(201).json(row);
    } catch (e) {
      res.status(400).json({ error: "Dados inválidos." });
    }
  });

  router.put("/:id", requireRole(...writeRoles), async (req, res) => {
    try {
      const row = await model.update({ where: { id: req.params.id }, data: req.body });
      await logAction(req.user.id, "UPDATE", entityName, row.id, null);
      res.json(row);
    } catch (e) {
      res.status(400).json({ error: "Dados inválidos." });
    }
  });

  router.delete("/:id", requireRole(...writeRoles), async (req, res) => {
    try {
      await model.delete({ where: { id: req.params.id } });
      await logAction(req.user.id, "DELETE", entityName, req.params.id, null);
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: "Não foi possível excluir (pode haver registros dependentes)." });
    }
  });

  return router;
}
