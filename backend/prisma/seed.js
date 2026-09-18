import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const username = (process.env.SEED_ADMIN_USERNAME || "admin").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Defina SEED_ADMIN_PASSWORD no .env antes de rodar o seed (não use senha padrão em produção).");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { name: "Administrador", username, passwordHash, role: "ADMIN" },
  });
  console.log(`Usuário admin "${username}" criado/confirmado.`);

  const defaultTypes = [
    { name: "Troca de óleo", kmInterval: 2000, timeIntervalDays: 90 },
    { name: "Pastilhas de freio", kmInterval: 8000, timeIntervalDays: 240 },
    { name: "Pneus", kmInterval: 15000, timeIntervalDays: 540 },
    { name: "Relação (corrente/coroa/pinhão)", kmInterval: 12000, timeIntervalDays: 365 },
    { name: "Revisão geral", kmInterval: 5000, timeIntervalDays: 180 },
  ];
  for (const t of defaultTypes) {
    const existing = await prisma.maintenanceType.findFirst({ where: { name: t.name } });
    if (!existing) await prisma.maintenanceType.create({ data: t });
  }
  console.log("Tipos de manutenção padrão criados/confirmados.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
