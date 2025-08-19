"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

// Componentes
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { EditSolicitacaoForm } from "@/components/solicitacao/editForm";
import { Solicitacao } from "@/components/solicitacao/types";
import { DeletarDialog } from "@/components/solicitacao/deleteForm";

import { LoaderCircle, SquarePen, BadgePlus, Mail, MessageCircle, X } from "lucide-react";
import ChatRecentes from "@/components/chat/chatRecentes";
import { CompartilharPopover } from "@/components/shareSolicitacao/popover";

type FormValues = {
  assunto: string;
  descricao: string;
  arquivo: FileList;
};

export default function SolicitacaoPage() {
  const [dataSolicitacao, setData] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [solicitacaoEdit, setSolicitacaoEdit] = useState<Solicitacao | null>(null);
  const [open, setOpen] = useState(false);
  const [openCadastrar, setOpenCadastrar] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [openSolicitacaoConfirmacaoDialog, setOpenSolicitacaoConfirmacaoDialog] = useState(false);

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
      setLoading(true);

      const params = new URLSearchParams({
        fields: ['id', 'assunto', 'prioridade', 'status', 'descricao', 'token'].join(',')
      });

      const res = await fetch(`/api/solicitacao/solicitacoes/solicitacoes_solicitante?${params}`, {
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

  const onSubmit = async (data: FormValues) => {
    setError("");
    try {
      const formData = new FormData();
      formData.append("assunto", data.assunto);
      formData.append("descricao", data.descricao);
      
      if (data.arquivo?.length) {
        Array.from(data.arquivo).forEach(arquivo => {
          formData.append("arquivo", arquivo);
        });
      }

      const res = await fetch("/api/solicitacao/solicitacoes/solicitacoes_solicitante/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erro ao cadastrar solicitação.");
        return;
      }

      const novaSolicitacao = await res.json();

      setQrCodeUrl(`${process.env.NEXT_PUBLIC_BASE_URL}/qrcode/${novaSolicitacao.token}}`);
      setOpenSolicitacaoConfirmacaoDialog(true);

      reset();
      fetchSolicitacoes();
      toast.success("Solicitação cadastrada!");
    } catch (e) {
      console.error(e)
      toast.error("Erro na comunicação com o servidor.");
    }
  };

  const handleCloseEdit = () => {
    setSolicitacaoEdit(null);
    setOpen(false);
    fetchSolicitacoes();
  };

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-[2fr_1fr] text-gray-100">
      {/* Solicitações e Formulário */}
      <section className="flex flex-col gap-4 col-span-1">
        <div className="rounded-xl p-5 bg-gray-800 border border-gray-700 shadow-lg">
          <header className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-blue-400">Minhas Solicitações</h3>
            <Dialog open={openCadastrar} onOpenChange={setOpenCadastrar}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                  <BadgePlus className="w-4 h-4" /> Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  await handleSubmit(onSubmit)(e);
                  setOpenCadastrar(false);
                }} className="space-y-4">
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

                  <fieldset className="flex flex-col gap-2">
                    <Label htmlFor="arquivos">Anexos (máx. 5 imagens)</Label>
                    <Input
                      id="arquivos"
                      type="file"
                      accept="image/*"
                      multiple
                      {...register("arquivo", {
                        validate: (fileList: FileList) => {
                          if (!fileList?.length) return "Pelo menos uma imagem é obrigatória";
                          if (fileList.length > 5) return "Máximo de 5 imagens permitidas";
                          for (let i = 0; i < fileList.length; i++) {
                            if (!fileList[i].type.startsWith("image/")) {
                              return "Apenas imagens são permitidas";
                            }
                          }
                          return true;
                        },
                      })}
                    />
                    {errors.arquivo && (
                      <p className="text-red-500 text-sm">{errors.arquivo.message}</p>
                    )}
                  </fieldset>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">
                        <X />
                        Cancelar
                      </Button>
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

            <Dialog
              open={openSolicitacaoConfirmacaoDialog}
              onOpenChange={setOpenSolicitacaoConfirmacaoDialog}
            >
              {qrCodeUrl && (
                <DialogContent className="space-y-1 p-6 rounded-xl shadow-lg">
                  <DialogHeader className="text-center space-y-1">
                    <DialogTitle className="text-blue-600 text-lg font-semibold">
                      Solicitação Registrada!
                    </DialogTitle>
                    <h6 className="text-sm text-gray-700 dark:text-gray-200">
                      Compartilhar via:
                    </h6>
                  </DialogHeader>
                  <div className="flex flex-row items-start justify-between">
                    {/* Botões de compartilhamento */}
                    <div className="flex flex-col gap-5">
                      <div className="flex justify-start gap-2 flex-wrap">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(
                            "Acompanhe sua solicitação: " + qrCodeUrl
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <MessageCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm">WhatsApp</span>
                        </a>

                        <a
                          href={`mailto:?subject=Acompanhe sua solicitação&body=${encodeURIComponent(
                            qrCodeUrl
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Mail className="h-5 w-5 text-blue-500" />
                          <span className="text-sm">E-mail</span>
                        </a>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-200">Acompanhe e fique por dentro do andamento</p>
                    </div>



                    {/* QR Code */}
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="flex justify-center"
                    >
                      <QRCode
                        value={qrCodeUrl}
                        size={180}
                        className="bg-white p-3 rounded-lg shadow"
                      />
                    </motion.div>
                  </div>

                </DialogContent>
              )}
            </Dialog>
          </header>

          {/* Lista */}
          {loading ? (
            <div className="max-h-80 overflow-auto flex flex-col gap-4 pr-1">
              {[...Array(3)].map((i) => (
                <div key={i} className="rounded-xl p-4 bg-gray-700 animate-pulse flex justify-between items-start">
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-gray-500 rounded w-1/3" />
                    <div className="h-3 bg-gray-600 rounded w-1/2" />
                    <div className="h-3 bg-gray-600 rounded w-1/4" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-600 rounded" />
                    <div className="h-8 w-8 bg-gray-600 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : dataSolicitacao.length === 0 ? (
            <p key={0} className="text-sm text-gray-400">Nenhuma solicitação encontrada.</p>
          ) : (
            <ScrollArea className="max-h-80 rounded-md flex flex-col">

              {dataSolicitacao.map((solicitacao, index) => (
                <div
                  key={solicitacao.id}
                  className={`rounded-xl p-4 bg-gray-700 hover:bg-gray-600 transition-colors flex justify-between items-start ${index !== dataSolicitacao.length - 1 ? "mb-4" : ""
                    }`}
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

                  {solicitacao.status != 'EM_ATENDIMENTO' && (
                    <div className="flex gap-2">
                      <DeletarDialog solicitacao={solicitacao} onDelete={(id) => setData((prev) => prev.filter((item) => item.id !== id))} />

                      <Dialog open={open && solicitacaoEdit?.id === solicitacao.id} onOpenChange={setOpen}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger
                              onClick={() => {
                                setSolicitacaoEdit(solicitacao);
                                setOpen(true);
                              }}
                              className="p-2 rounded-md hover:bg-gray-700/50 transition-colors flex items-center justify-center"
                              aria-label="Visualizar QR Code"
                            >
                              <SquarePen className="h-5 w-5 text-blue-400" />
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-sm">
                            Editar
                          </TooltipContent>
                        </Tooltip>
                        <DialogContent>
                          {solicitacaoEdit && (
                            <EditSolicitacaoForm solicitacao={solicitacaoEdit} onClose={handleCloseEdit} />
                          )}
                        </DialogContent>
                      </Dialog>

                      <CompartilharPopover solicitacao={solicitacao} />
                    </div>
                  )}
                </div>
              ))}

            </ScrollArea>
          )}
        </div>
      </section>

      {/* Chats */}
      <ChatRecentes />
    </div>

  );
}
