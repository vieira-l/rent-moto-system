import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { prisma } from "./lib/prisma.js";
import { crudRouter } from "./routes/crudFactory.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CORS_ORIGIN; // ex: https://seu-frontend.vercel.app

if (!ORIGIN) {
  console.warn("AVISO: CORS_ORIGIN não definido no .env — configure antes de ir para produção.");
}

app.use(helmet());
// CORS restrito: só o domínio do SEU frontend pode chamar esta API, com cookies.
app.use(cors({ origin: ORIGIN || false, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Limite geral de requisições por IP (mitiga abuso/DoS simples).
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/motorcycles", crudRouter(prisma.motorcycle, "Motorcycle"));
app.use("/renters", crudRouter(prisma.renter, "Renter"));
app.use("/contracts", crudRouter(prisma.contract, "Contract"));
app.use("/payments", crudRouter(prisma.payment, "Payment"));
app.use("/maintenance-types", crudRouter(prisma.maintenanceType, "MaintenanceType"));
app.use("/maintenance-records", crudRouter(prisma.maintenanceRecord, "MaintenanceRecord"));
app.use("/mileage-records", crudRouter(prisma.mileageRecord, "MileageRecord"));
app.use("/expenses", crudRouter(prisma.expense, "Expense"));
app.use("/revenues", crudRouter(prisma.revenue, "Revenue"));
app.use("/incidents", crudRouter(prisma.incident, "Incident"));

// 404 explícito (não vaza stack trace nem estrutura interna).
app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));

// Tratador de erro central: NUNCA envia stack trace / detalhes internos ao cliente
// (item 29 do checklist — mensagens de erro não podem vazar informação sensível).
app.use((err, req, res, next) => {
  console.error(err); // detalhe completo só no log do servidor
  res.status(500).json({ error: "Erro interno do servidor." });
});

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
