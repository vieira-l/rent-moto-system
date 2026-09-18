import { prisma } from "./prisma.js";

// Item 20 do checklist: log de auditoria de ações sensíveis.
export async function logAction(userId, action, entity, entityId, detail) {
  try {
    await prisma.auditLog.create({ data: { userId, action, entity, entityId, detail } });
  } catch (e) {
    // Nunca deixe uma falha de log derrubar a operação principal.
    console.error("Falha ao gravar log de auditoria:", e.message);
  }
}
