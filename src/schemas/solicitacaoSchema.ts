import { z } from "zod"
import { Prioridade } from "@prisma/client";

export const createSolicitacaoSchema = z.object({
  assunto: z.string().min(5).max(255),
  descricao: z.string().min(10),
});