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
import { EditSolicitacaoForm } from "@/components/solicitacoes/EditSolicitacaoForm";
import { Solicitacao } from "@/components/solicitacoes/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { LoaderCircle, Trash2, SquarePen, BadgePlus } from "lucide-react";

type FormValues = {
  assunto: string;
  descricao: string;
};

export default function SolicitacaoPage() {
  const [data, setData] = useState<Solicitacao[]>([]);
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
      const res = await fetch("/api/solicitacoes", {
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
    <div className="grid gap-4 grid-cols-4">
      {/* Métricas */}
      <section className="flex flex-col gap-4">
        <div
          className="rounded-lg shadow-lg p-5 border border-accent-foreground text-white"
          style={{ backgroundColor: "#111313" }}
        >
          <h3 className="font-semibold mb-1">Solicitações</h3>
          <p className="text-sm font-light mb-4">Métricas</p>
          {/* Métricas aqui, se necessário */}
        </div>
      </section>

      {/* Solicitações e Form */}
      <section className="flex flex-col gap-4 col-span-2">
        <div
          className="rounded-lg shadow-lg p-5 border border-accent-foreground"
          style={{ backgroundColor: "#111313" }}
        >
          <header className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Minhas Solicitações</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" className="cursor-pointer">
                  <BadgePlus />
                  Nova Solicitação
                </Button>
              </DialogTrigger>

              <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Solicitação</DialogTitle>
                  </DialogHeader>

                  <fieldset className="flex flex-col gap-2">
                    <Label htmlFor="assunto">Assunto</Label>
                    <Input
                      id="assunto"
                      type="text"
                      {...register("assunto", { required: "Assunto é obrigatório" })}
                      placeholder="Assunto da solicitação"
                      aria-invalid={errors.assunto ? "true" : "false"}
                    />
                    {errors.assunto && (
                      <p role="alert" className="text-red-500 text-sm">
                        {errors.assunto.message}
                      </p>
                    )}
                  </fieldset>

                  <fieldset className="flex flex-col gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      {...register("descricao", { required: "Descrição é obrigatória" })}
                      placeholder="Descreva a solicitação"
                      aria-invalid={errors.descricao ? "true" : "false"}
                    />
                    {errors.descricao && (
                      <p role="alert" className="text-red-500 text-sm">
                        {errors.descricao.message}
                      </p>
                    )}
                  </fieldset>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Fechar
                      </Button>
                    </DialogClose>
                    <Button type="submit" variant="secondary" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="animate-spin" /> Registrando...
                        </>
                      ) : (
                        <>
                          <BadgePlus /> Cadastrar
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </header>

          {/* Lista Solicitações */}
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma solicitação encontrada.</p>
          ) : (
            <div className="max-h-80 overflow-auto flex flex-col gap-4 pr-1">
              {data.map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="rounded-xl p-5 bg-muted text-foreground flex justify-between gap-2"
                >
                  <div>
                    <h3 className="text-lg font-semibold">{solicitacao.assunto}</h3>
                    <p className="text-sm text-muted-foreground">
                      Prioridade: <span className="font-medium">{solicitacao.prioridade}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="font-medium">{solicitacao.status}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger className="p-1.5 rounded cursor-pointer flex items-center">
                        <Trash2 className="h-4 w-4" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmação</DialogTitle>
                          <DialogDescription>Deseja deletar essa solicitação?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(solicitacao.id)}
                          >
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
                        className="p-1.5 rounded cursor-pointer flex items-center"
                      >
                        <SquarePen className="h-4 w-4" />
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
        <div
          className="rounded-lg shadow-lg p-5 border border-accent-foreground text-white"
          style={{ backgroundColor: "#111313" }}
        >
          <h3 className="font-semibold mb-4">Chats</h3>
          <div className="flex flex-col gap-5">
            {mensagens.map((item, i) => (
              <a key={i} href="#chat" className="flex items-center gap-5">
                <Avatar>
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>{item.nome.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-3">
                  <span className="font-semibold text-lg">{item.nome}</span>
                  <span className="text-sm font-light">{item.mensagem}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
