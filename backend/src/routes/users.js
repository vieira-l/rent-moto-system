import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { logAction } from "../lib/audit.js";

const router = Router();
const ROLES = ["ADMIN", "MANAGER", "EMPLOYEE"];
const safeSelect = { id: true, name: true, username: true, role: true, createdAt: true };

// Todas as rotas abaixo exigem estar logado E ser ADMIN — checado no backend,
// não apenas escondido na tela (item 25/26 do checklist).
router.use(requireAuth, requireRole("ADMIN"));

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany({ select: safeSelect, orderBy: { createdAt: "asc" } });
  res.json(users);
});

router.post("/", async (req, res) => {
  const { name, username, password, role } = req.body || {};
  if (!name || !username || !password) return res.status(400).json({ error: "Nome, usuário e senha são obrigatórios." });
  if (password.length < 8) return res.status(400).json({ error: "A senha deve ter pelo menos 8 caracteres." });
  if (!ROLES.includes(role)) return res.status(400).json({ error: "Nível de acesso inválido." });

  const uname = String(username).trim().toLowerCase();
  const exists = await prisma.user.findUnique({ where: { username: uname } });
  if (exists) return res.status(409).json({ error: "Já existe um usuário com esse nome de usuário." });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, username: uname, passwordHash, role }, select: safeSelect });
  await logAction(req.user.id, "CREATE", "User", user.id, `Criou usuário ${uname} (${role})`);
  res.status(201).json(user);
});

router.put("/:id", async (req, res) => {
  const { name, role, password } = req.body || {};
  const data = {};
  if (name) data.name = name;
  if (role) {
    if (!ROLES.includes(role)) return res.status(400).json({ error: "Nível de acesso inválido." });
    data.role = role;
  }
  if (password) {
    if (password.length < 8) return res.status(400).json({ error: "A senha deve ter pelo menos 8 caracteres." });
    data.passwordHash = await bcrypt.hash(password, 12);
  }
  const user = await prisma.user.update({ where: { id: req.params.id }, data, select: safeSelect });
  await logAction(req.user.id, "UPDATE", "User", user.id, "Atualizou dados do usuário");
  res.json(user);
});

router.delete("/:id", async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: "Você não pode excluir o usuário com o qual está logado." });
  const total = await prisma.user.count();
  if (total <= 1) return res.status(400).json({ error: "Não é possível excluir o único usuário do sistema." });
  await prisma.user.delete({ where: { id: req.params.id } });
  await logAction(req.user.id, "DELETE", "User", req.params.id, null);
  res.json({ ok: true });
});

export default router;
