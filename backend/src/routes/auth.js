import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import { logAction } from "../lib/audit.js";

const router = Router();

// Limita tentativas de login (mitiga força bruta) — item 30 / boas práticas de sessão.
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas de login. Tente novamente em alguns minutos." },
});

const isProd = process.env.NODE_ENV === "production";
const cookieOpts = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 8 * 60 * 60 * 1000,
};

// IMPORTANTE: propositalmente NÃO existe rota pública de cadastro.
// Novas contas só são criadas por um usuário ADMIN autenticado, em /users (routes/users.js).
router.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Informe usuário e senha." });

  const user = await prisma.user.findUnique({ where: { username: String(username).trim().toLowerCase() } });
  // Mensagem genérica de propósito: não revelar se o erro foi "usuário não existe" ou "senha errada".
  if (!user) return res.status(401).json({ error: "Usuário ou senha inválidos." });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Usuário ou senha inválidos." });

  const token = signToken(user);
  res.cookie("token", token, cookieOpts);
  await logAction(user.id, "LOGIN", "User", user.id, null);
  res.json({ id: user.id, name: user.name, username: user.username, role: user.role });
});

router.post("/logout", requireAuth, async (req, res) => {
  await logAction(req.user.id, "LOGOUT", "User", req.user.id, null);
  res.clearCookie("token", cookieOpts);
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, username: true, role: true } });
  if (!user) return res.status(401).json({ error: "Usuário não encontrado." });
  res.json(user);
});

export default router;
