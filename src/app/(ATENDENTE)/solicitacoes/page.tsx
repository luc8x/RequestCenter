"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { EditSolicitacaoForm } from "@/components/solicitacoes/EditSolicitacaoForm";
import { Solicitacao } from "@/components/solicitacoes/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { LoaderCircle, Trash2, SquarePen, BadgePlus } from "lucide-react";

type FormValues = {
  assunto: string;
  descricao: string;
};

export default function SolicitacaoPage() {
  const [dataSolicitacao, setData] = useState<Solicitacao[]>([]);
  const [error, setError] = useState("");
  const [solicitacaoEdit, setSolicitacaoEdit] = useState<Solicitacao | null>(null);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onSubmit",
  });

  const fetchSolicitacoes = useCallback(async () => {
    try {
      const res = await fetch("/api/solicitacoes/solicitacoes");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Erro ao buscar solicitações.");
    }
  }, []);

  useEffect(() => {
    fetchSolicitacoes();
  }, [fetchSolicitacoes]);

  const onSubmit = async (formData: FormValues) => {
    setError("");
    try {
      const res = await fetch("/api/solicitacoes/solicitacoes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erro ao cadastrar solicitação.");
        return;
      }

      reset();
      fetchSolicitacoes();
      toast.success("Solicitação cadastrada.");
    } catch {
      toast.error("Erro na comunicação com o servidor.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/solicitacoes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setData((prev) => prev.filter((item) => item.id !== id));
      toast.success("Solicitação deletada.");
    } catch {
      toast.error("Erro ao deletar solicitação.");
    }
  };

  const handleCloseEdit = () => {
    setSolicitacaoEdit(null);
    setOpen(false);
    fetchSolicitacoes();
  };

  const mensagens = [
    {
      nome: "João",
      mensagem: "Olá, podemos ver sua solicitação?",
      avatar: "https://github.com/shadcn.png",
    },
    {
      nome: "Lucas",
      mensagem: "Bom dia, como posso lhe ajudar?",
      avatar: "https://github.com/shadcn.png",
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-[1fr_2fr_1fr] text-gray-100">
      {/* Métricas */}
      <section className="flex flex-col gap-4">
        <div className="rounded-xl p-5 bg-gray-800 border border-gray-700 shadow-lg">
          <h3 className="font-semibold mb-1 text-blue-400">Solicitações</h3>
          <p className="text-sm text-gray-400 mb-4">Métricas gerais do sistema</p>
          {/* Coloque aqui seus KPIs, gráficos ou contadores */}
        </div>
      </section>

      {/* Solicitações e Formulário */}
      <section className="flex flex-col gap-4 col-span-1">
        <div className="rounded-xl p-5 bg-gray-800 border border-gray-700 shadow-lg">
          <header className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-blue-400">Minhas Solicitações</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <BadgePlus className="w-4 h-4" /> Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-blue-500">Cadastrar Solicitação</DialogTitle>
                  </DialogHeader>

                  <fieldset className="flex flex-col gap-2">
                    <Label htmlFor="assunto">Assunto</Label>
                    <Input
                      id="assunto"
                      {...register("assunto", { required: "Assunto é obrigatório" })}
                      placeholder="Assunto da solicitação"
                    />
                    {errors.assunto && (
                      <p className="text-red-500 text-sm">{errors.assunto.message}</p>
                    )}
                  </fieldset>

                  <fieldset className="flex flex-col gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      {...register("descricao", { required: "Descrição é obrigatória" })}
                      placeholder="Descreva a solicitação"
                    />
                    {errors.descricao && (
                      <p className="text-red-500 text-sm">{errors.descricao.message}</p>
                    )}
                  </fieldset>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="animate-spin w-4 h-4 mr-1" /> Registrando...
                        </>
                      ) : (
                        <>
                          <BadgePlus className="w-4 h-4 mr-1" /> Cadastrar
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </header>

          {/* Lista */}
          {dataSolicitacao.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma solicitação encontrada.</p>
          ) : (
            <div className="max-h-80 overflow-auto flex flex-col gap-4 pr-1">
              {dataSolicitacao.map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="rounded-xl p-4 bg-gray-700 hover:bg-gray-600 transition-colors flex justify-between items-start"
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

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger className="p-2 rounded hover:bg-gray-600 transition">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmar exclusão</DialogTitle>
                          <DialogDescription>Deseja realmente deletar esta solicitação?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="destructive" onClick={() => handleDelete(solicitacao.id)}>
                            <Trash2 className="h-4 w-4" /> Deletar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={open && solicitacaoEdit?.id === solicitacao.id} onOpenChange={setOpen}>
                      <DialogTrigger
                        onClick={() => {
                          setSolicitacaoEdit(solicitacao);
                          setOpen(true);
                        }}
                        className="p-2 rounded hover:bg-gray-600 transition"
                      >
                        <SquarePen className="h-4 w-4 text-blue-400" />
                      </DialogTrigger>
                      <DialogContent>
                        {solicitacaoEdit && (
                          <EditSolicitacaoForm solicitacao={solicitacaoEdit} onClose={handleCloseEdit} />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Chats */}
      <section>
        <Card>
          <h3 className="font-semibold mb-4 text-blue-400">Chats Recentes</h3>
          <div className="flex flex-col gap-5">
            {mensagens.map((item, i) => (
              <a key={i} href={`/chat/${i+1}/`} className="flex items-center gap-4 hover:bg-gray-700 p-2 rounded transition">
                <Avatar>
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.nome.slice(0, 2).toUpperCase()}</AvatarFallback>
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
    </div>

  );
}
