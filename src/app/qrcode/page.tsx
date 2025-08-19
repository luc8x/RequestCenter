'use client';

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { Separator } from "@/components/ui/separator";


interface Solicitacao {
  assunto: string;
  descricao: string;
  prioridade: string;
  status: string;
  arquivoNome?: string | null;
  analiseIA?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  closingAt?: string | null;
}

const statusColorMap: Record<string, "default" | "success" | "warning" | "destructive"> = {
  aberta: "warning",
  em_andamento: "default",
  aprovado: "success",
  pendente: "warning",
  rejeitado: "destructive",
  concluido: "success",
  default: "default",
};

const prioridadeColorMap: Record<string, "default" | "destructive" | "warning" | "success"> = {
  alta: "destructive",
  media: "warning",
  baixa: "success",
  nao_informada: "default",
  default: "default",
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "—";
  try {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", {
      locale: ptBR,
    });
  } catch {
    return dateString;
  }
}

function SolicitacaoQRCodeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSolicitacoes = useCallback(async () => {
    if (!token) {
      toast.error("Token não fornecido.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/solicitacao/qrcode/${token}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error();

      const json = await res.json();
      setSolicitacao(json || null);
    } catch {
      toast.error("Erro ao buscar solicitações.");
      setSolicitacao(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  return (
    <main className="w-full h-dvh flex justify-center items-center bg-blue-600">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
        className="flex justify-center"
      >
        <Card className="bg-white border-white text-black w-7xl">
          <CardHeader>
            <CardTitle className="mb-8">
              <p className="text-center text-3xl font-semibold text-black">{solicitacao?.assunto || 'Detalhes da Solicitação'}</p>
              <p className="text-sm leading-relaxed text-center">{solicitacao?.descricao}</p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                Carregando informações...
              </div>
            ) : solicitacao ? (
              <section
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
                aria-label="Informações detalhadas da solicitação"
              >
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-wrap gap-x-6 gap-y-4">
                    <div className="flex flex-col min-w-[120px]">
                      <h3 className="font-semibold mb-1 text-black">Status</h3>
                      <Badge
                        variant={statusColorMap[solicitacao?.status.toLowerCase()] ?? "default"}
                        className="uppercase tracking-wide text-black"
                        aria-label={`Status da solicitação: ${solicitacao?.status}`}
                      >
                        {solicitacao?.status}
                      </Badge>
                    </div>

                    <div className="flex flex-col min-w-[140px]">
                      <h3 className="font-semibold mb-1 text-black">Prioridade</h3>
                      <Badge
                        variant={prioridadeColorMap[solicitacao?.prioridade.toLowerCase()] ?? "default"}
                        className="capitalize tracking-wide text-white"
                        aria-label={`Prioridade da solicitação: ${solicitacao?.prioridade}`}
                      >
                        {solicitacao?.prioridade.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-1 text-black">Arquivo</h3>
                    <p>{solicitacao?.arquivoNome || 'Nenhum arquivo anexado'}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-1 text-black">Análise IA</h3>
                    <p className="text-sm leading-relaxed">{solicitacao?.analiseIA || 'Sem análise'}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-1 text-black">Criado em</h3>
                    <time dateTime={solicitacao?.createdAt}>
                      {formatDate(solicitacao?.createdAt)}
                    </time>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-1 text-black">Última atualização</h3>
                    <time dateTime={solicitacao?.updatedAt}>
                      {formatDate(solicitacao?.updatedAt)}
                    </time>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-1 text-black">Fechado em</h3>
                    <time dateTime={solicitacao?.closingAt || undefined}>
                      {formatDate(solicitacao?.closingAt)}
                    </time>
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 250, damping: 18 }}
                    className="bg-white p-6 rounded-3xl shadow-lg"
                  >
                    <QRCode
                      value={`${process.env.NEXT_PUBLIC_BASE_URL}/qrcode/?token=${solicitacao.token}`}
                      size={320}
                      style={{ borderRadius: "10px" }}
                    />
                  </motion.div>
                </div>
              </section>
            ) : (
              <p role="alert" className="text-center text-red-600 font-semibold text-lg">
                Solicitação não encontrada.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}

export default function SolicitacaoQRCode() {
  return (
    <Suspense fallback={<div className="w-full h-dvh flex justify-center items-center bg-blue-600">Carregando...</div>}>
      <SolicitacaoQRCodeContent />
    </Suspense>
  );
}
