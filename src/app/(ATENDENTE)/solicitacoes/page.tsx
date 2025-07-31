"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
} from "@/components/ui/card";
import { Solicitacao } from "@/components/solicitacoes/types";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquareShare  } from "lucide-react";
export default function SolicitacaoPage() {
  const [dataSolicitacao, setData] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSolicitacoes = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        fields: ['id', 'assunto', 'prioridade', 'status', 'descricao', 'createdAt'].join(',')
      });

      const res = await fetch(`/api/solicitacao/solicitacoes/solicitacoes_atendente?${params}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error();

      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Erro ao buscar solicitações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  const router = useRouter();

  const atenderSolicitacao = async (solicitacaoId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/solicitacao/${solicitacaoId}/atender`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error("Erro ao assumir a solicitação.");
      }

      toast.success("Solicitação atribuída com sucesso!");
      await router.push(`/atendimento/${solicitacaoId}`);
    } catch (err) {
      console.error(err);
      toast.error("Falha ao assumir a solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const mensagens = [
    // {
    //   nome: "João",
    //   mensagem: "Olá, podemos ver sua solicitação?",
    //   avatar: "https://github.com/shadcn.png",
    // },
    // {
    //   nome: "Lucas",
    //   mensagem: "Bom dia, como posso lhe ajudar?",
    //   avatar: "https://github.com/shadcn.png",
    // },
  ];

  return (
    <div className={`grid gap-6 ${mensagens && mensagens.length > 0 ? 'grid-cols-[1fr_2fr_1fr]' : 'grid-cols-[2fr_2fr]'} text-gray-100`}>
      {/* Métricas */}
      <section className='flex flex-col gap-4 col-span-1'>
        <div className="rounded-xl p-5 bg-gray-800 border border-gray-700 shadow-lg">
          <h3 className="font-semibold mb-1 text-blue-400">Solicitações</h3>
          <p className="text-sm text-gray-400 mb-4">Métricas gerais do sistema</p>
          {/* Coloque aqui seus KPIs, gráficos ou contadores */}
        </div>
      </section>

      {/* Solicitações e Formulário */}
      <section className='flex flex-col gap-4 col-span-1'>

        <div className="rounded-xl p-5 bg-gray-800 border border-gray-700 shadow-lg">
          <header className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-blue-400">Solicitações em aberto</h3>
          </header>

          {/* Lista */}
          {loading ? (
            <div className="max-h-80 overflow-auto flex flex-col gap-4 pr-1">
              {[...Array(3)].map((_, i) => (
                <div className="rounded-xl p-4 bg-gray-700 animate-pulse flex justify-between items-start">
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-gray-500 rounded w-1/3" />
                    <div className="h-3 bg-gray-600 rounded w-1/2" />
                    <div className="h-3 bg-gray-600 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : dataSolicitacao.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma solicitação encontrada.</p>
          ) : (
            <div className="max-h-80 overflow-auto flex flex-col gap-4 pr-1">
              {dataSolicitacao.map((solicitacao) => (
                <Dialog>
                  <DialogTrigger asChild>
                    <div
                      key={solicitacao.id}
                      className="rounded-xl p-4 bg-gray-700 hover:bg-gray-600 transition-colors flex justify-between items-start cursor-pointer"
                    >
                      <div>
                        <h4 className="text-base font-semibold text-white">{solicitacao.assunto}</h4>
                        <p className="text-sm text-gray-400">
                          Prioridade: <span className="font-medium">{solicitacao.prioridade}</span>
                        </p>
                        <p className="text-sm text-gray-400">
                          Status: <span className="font-medium">{solicitacao.status}</span>
                        </p>
                      </div>

                    </div>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-blue-400">Detalhes da Solicitação</DialogTitle>
                      <DialogDescription>
                        Aqui estão as informações completas da solicitação.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 text-sm text-gray-900">
                      <p><strong>Assunto:</strong> {solicitacao.assunto}</p>
                      <p><strong>Descrição:</strong> {solicitacao.descricao}</p>
                      <p><strong>Prioridade:</strong> {solicitacao.prioridade}</p>
                      <p><strong>Status:</strong> {solicitacao.status}</p>
                      <p>
                        <strong>Data de abertura:</strong>{" "}
                        {new Date(solicitacao.createdAt).toLocaleDateString("pt-BR")} às{" "}
                        {new Date(solicitacao.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => atenderSolicitacao(solicitacao.id)} disabled={loading}>
                        <MessageSquareShare className="h-4 w-4" /> {loading ? "Atualizando..." : "Atender"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              ))}
            </div>
          )}
        </div>
      </section>

      {/* Chats */}
      {mensagens && mensagens.length > 0 ? (
        <section>
          <Card>
            <h3 className="font-semibold mb-4 text-blue-400">Chats em Andamento</h3>
            <div className="flex flex-col gap-5">
              {mensagens.map((item) => (
                <a
                  key={item.id}
                  href={`/chat/${item.id}/`}
                  className="flex items-center gap-4 hover:bg-gray-700 p-2 rounded transition"
                >
                  <Avatar>
                    <AvatarImage src={item.avatar} />
                    <AvatarFallback>
                      {item.nome?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-5">
                    <span className="font-medium">{item.nome}</span>
                    <span className="text-sm text-gray-400">{item.mensagem}</span>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </section>
      ) : null}

    </div>

  );
}
