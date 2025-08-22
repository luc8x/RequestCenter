import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const mapStatusToLabel = {
  ABERTA: "Aberta",
  EM_ATENDIMENTO: "Em atendimento",
  CANCELADA: "Cancelada",
  FINALIZADA: "Concluída",
};

export const mapPrioridadeToLabel = {
  NAO_INFORMADA: "Não informado",
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Critica",
};