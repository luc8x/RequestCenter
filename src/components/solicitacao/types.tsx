export type Solicitacao = {
  id: string;
  assunto: string;
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  status: "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA" | "CANCELADA";
};