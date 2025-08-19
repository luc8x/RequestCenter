"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { Check, X, Eye, PictureInPicture2, Square } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from 'next/image'

export default function ChatLayout() {
    // Dados
    const params = useParams();
    const solicitacaoId = params.id as string;
    const [dataSolicitacao, setData] = useState<Record<string, unknown> | null>(null);
    const { data: session } = useSession();

    const [isPiPSupported] = useState(true);
    const [isPiPActive, setIsPiPActive] = useState(false);
    const [isTauriAvailable, setIsTauriAvailable] = useState(false);
    const [pipWindow, setPipWindow] = useState<Window | null>(null);

    const [loading, setLoading] = useState(true);



    const mapStatusToLabel = {
        ABERTA: "Aberta",
        EM_ATENDIMENTO: "Em atendimento",
        CANCELADA: "Cancelada",
        FINALIZADA: "Concluída",
    };

    const mapPrioridadeToLabel = {
        NAO_INFORMADA: "Não informado",
        BAIXA: "Baixa",
        MEDIA: "Média",
        ALTA: "Alta",
        CRITICA: "Critica",
    };

    const fetchSolicitacao = useCallback(async () => {
        try {
            setLoading(true);

            const res = await fetch(`/api/solicitacao/${solicitacaoId}/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }

            const json = await res.json();
            setData(json);
        } catch {
            toast.error("Erro ao buscar solicitação");
        } finally {
            setLoading(false);
        }
    }, [solicitacaoId]);

    useEffect(() => {
        fetchSolicitacao();
    }, [fetchSolicitacao]);

    useEffect(() => {
        const checkTauri = async () => {
            try {
                const response = await fetch('/api/tauri/chat', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                setIsTauriAvailable(response.ok);
            } catch {
                setIsTauriAvailable(false);
            }
        };

        checkTauri();
    }, []);

    const handleStatusChange = async (novoStatus: "FINALIZADA" | "CANCELADA") => {
        try {
            const res = await fetch(`/api/solicitacao/conclusao/${solicitacaoId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: novoStatus }),
            });

            if (!res.ok) throw new Error("Falha ao atualizar status");
            toast.success('Solicitação concluida.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Erro ao atualizar');
        }
    };

    const openChatPiP = async () => {
        try {
            if (isTauriAvailable) {
                const solicitacaoData = {
                    id: solicitacaoId,
                    assunto: dataSolicitacao?.assunto,
                    status: dataSolicitacao?.status,
                    solicitante: dataSolicitacao?.solicitante,
                    atendente: dataSolicitacao?.atendente
                };

                const response = await fetch('/api/tauri/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'open_chat_window',
                        data: solicitacaoData
                    })
                });

                if (response.ok) {
                    setIsPiPActive(true);
                    toast.success('Chat Flutuante está aberto!');
                    return;
                }
            }

            const chatUrl = `/chat-window?id=${solicitacaoId}`;
            const newWindow = window.open(
                chatUrl,
                'chatPiP',
                'width=400,height=600,resizable=yes,scrollbars=yes'
            );

            if (newWindow) {
                setPipWindow(newWindow);
                setIsPiPActive(true);
                toast.success('Chat web aberto!');
            } else {
                toast.error('Não foi possível abrir a janela de chat');
            }
        } catch (error) {
            console.error('Erro ao abrir chat:', error);
            toast.error('Erro ao abrir chat');
        }
    };

    const closeChatPiP = async () => {
        try {
            if (isTauriAvailable) {
                const response = await fetch('/api/tauri/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'close_chat_window'
                    })
                });

                if (response.ok) {
                    setIsPiPActive(false);
                    toast.success('Chat Tauri fechado!');
                    return;
                }
            }

            if (pipWindow && !pipWindow.closed) {
                pipWindow.close();
                setPipWindow(null);
                setIsPiPActive(false);
                toast.success('Chat web fechado!');
            }
        } catch (error) {
            console.error('Erro ao fechar chat:', error);
            toast.error('Erro ao fechar chat');
        }
    };

    useEffect(() => {
        if (pipWindow && !isTauriAvailable) {
            const checkClosed = setInterval(() => {
                if (pipWindow.closed) {
                    setIsPiPActive(false);
                    setPipWindow(null);
                    clearInterval(checkClosed);
                }
            }, 1000);

            return () => clearInterval(checkClosed);
        }
    }, [pipWindow, isTauriAvailable]);

    return (
        <section className='flex flex-col gap-4 col-span-1'>
            <Card>
                <CardHeader className="px-4 pt-4 pb-2 border-b border-blue-400">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-blue-400">
                            Informações da Solicitação
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {isPiPSupported && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={isPiPActive ? closeChatPiP : openChatPiP}
                                    className={cn(
                                        "text-gray-400 hover:text-white hover:bg-gray-700/50",
                                        isPiPActive && "text-green-400 hover:text-green-300"
                                    )}
                                    title={isPiPActive ?
                                        (isTauriAvailable ? "Fechar Chat Tauri" : "Fechar Chat Web") :
                                        (isTauriAvailable ? "Abrir Chat Tauri" : "Abrir Chat Web")
                                    }
                                >
                                    {isPiPActive ? (
                                        <Square className="w-4 h-4" />
                                    ) : (
                                        <PictureInPicture2 className="w-4 h-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto space-y-5 py-6 px-4 text-sm">
                    {loading ? (
                        <div className="animate-pulse flex-1 space-y-4 text-sm">
                            <div className="space-y-2">
                                <div className="w-24 h-4 bg-gray-600 rounded" />
                                <div className="w-full h-5 bg-gray-600 rounded" />
                            </div>
                            <div className="w-full h-20 bg-gray-600 rounded" />
                            <div className="grid grid-cols-2 gap-4">
                                {[0, 1].map(i => (
                                    <div key={i} className="space-y-2">
                                        <div className="w-24 h-4 bg-gray-600 rounded" />
                                        <div className="w-20 h-6 bg-gray-600 rounded" />
                                    </div>
                                ))}
                            </div>
                            {[0, 1].map(i => (
                                <div key={i}>
                                    <div className="h-px bg-gray-500 my-3" />
                                    <div className="space-y-2">
                                        <div className="w-40 h-4 bg-gray-600 rounded" />
                                        <div className="w-56 h-3 bg-gray-600 rounded" />
                                    </div>
                                </div>
                            ))}
                            {[0, 1].map(i => (
                                <div key={i}>
                                    <div className="h-px bg-gray-500 my-3" />
                                    <div className="space-y-2">
                                        <div className="w-40 h-3 bg-gray-600 rounded" />
                                        <div className="w-40 h-3 bg-gray-600 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 uppercase">Assunto</p>
                                <p className="text-base font-medium text-white">{dataSolicitacao.assunto}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 uppercase">Descrição</p>
                                <p className="text-gray-300 whitespace-pre-line">{dataSolicitacao.descricao}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase">Prioridade</p>
                                    <Badge variant="outline" className="text-gray-300 border-gray-400">
                                        {mapPrioridadeToLabel[dataSolicitacao?.prioridade as keyof typeof mapPrioridadeToLabel] ?? "Não informada"}
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase">Status</p>
                                    <Badge
                                        variant="outline"
                                        className={cn("border", {
                                            "border-green-400 text-green-300": dataSolicitacao?.status === "FINALIZADA",
                                            "border-yellow-400 text-yellow-300": dataSolicitacao?.status === "EM_ATENDIMENTO",
                                            "border-red-400 text-red-300": dataSolicitacao?.status === "CANCELADA",
                                            "border-blue-400 text-blue-300": dataSolicitacao?.status === "ABERTA",
                                            "border-gray-400 text-gray-300": !dataSolicitacao?.status,
                                        })}
                                    >

                                        {mapStatusToLabel[dataSolicitacao?.status as keyof typeof mapStatusToLabel] ?? "Status desconhecido"}
                                    </Badge>
                                </div>
                            </div>

                            <Separator className="my-2 bg-gray-600" />
                            {session?.user?.permissao === 'ATENDENTE' && (
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase">Solicitante</p>
                                    <p className="text-white">{dataSolicitacao.user?.name}</p>
                                    <p className="text-gray-400 text-xs">{dataSolicitacao.user?.email}</p>
                                </div>
                            )}

                            {session?.user?.permissao === 'SOLICITANTE' && (
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 uppercase">Atendente</p>
                                    <p className="text-white">{dataSolicitacao.atendente?.name}</p>
                                    <p className="text-gray-400 text-xs">{dataSolicitacao.atendente?.email}</p>
                                </div>
                            )}

                            {dataSolicitacao.arquivos && dataSolicitacao.arquivos.length > 0 && (
                                <>
                                    <Separator className="my-2 bg-gray-600" />
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400 uppercase">Arquivos da Solicitação</p>

                                        <Dialog>
                                            <DialogTrigger>
                                                <span className="flex items-center gap-2 p-0 h-auto text-blue-400 hover:text-blue-300 text-decoration-underline">
                                                    <Eye className="w-4 h-4 mr-1 " /> Visualizar {dataSolicitacao.arquivos.length} Arquivos
                                                </span>
                                            </DialogTrigger>

                                            <DialogContent className="min-w-[84vw] max-h-[90vh] bg-gray-900/95 backdrop-blur-sm border border-gray-700 overflow-hidden p-0" showCloseButton={false}>
                                                <DialogHeader className="px-6 pt-6 text-white">
                                                    <DialogTitle>Sugestão da IA</DialogTitle>
                                                    <DialogDescription className="text-gray-300">
                                                        Após uma análise criteriosa, a IA sugeriu a seguinte solução:
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogClose className="absolute top-4 right-4 rounded-full bg-gray-800/80 hover:bg-gray-700/80 p-2 transition-colors">
                                                    <X className="w-6 h-6 text-gray-300 hover:text-white" />
                                                </DialogClose>

                                                <div className="flex-1 flex flex-col items-center justify-center p-8">
                                                    <Carousel className="w-full max-w-[75vw] relative">
                                                        <CarouselContent>
                                                            {dataSolicitacao.arquivos.map((arquivo, index) => (
                                                                <CarouselItem key={arquivo.id}>
                                                                    <div className="flex flex-col items-center space-y-6">
                                                                        <div className="relative w-full flex items-center justify-center rounded-xl shadow-2xl overflow-hidden group">
                                                                            <Image
                                                                                src={arquivo.arquivoBase64}
                                                                                alt={`Arquivo ${index + 1}`}
                                                                                className="w-full h-auto object-contain max-h-[65vh] transition-transform duration-300"
                                                                                width={1200}
                                                                                height={1200}
                                                                                priority
                                                                                quality={100}
                                                                            />
                                                                        </div>

                                                                        <div className="w-full max-w-4xl text-center">
                                                                            <div className="text-gray-300 text-sm leading-relaxed px-6 py-4 bg-gray-800/30 rounded-lg border border-gray-700/50 min-h-[80px] max-h-[200px] overflow-y-auto">
                                                                                <div className="whitespace-pre-wrap break-words">
                                                                                    {arquivo.analiseIA || "Análise ainda não concluída"}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </CarouselItem>
                                                            ))}

                                                        </CarouselContent>
                                                        {dataSolicitacao.arquivos.length > 1 && (
                                                            <>
                                                                <CarouselPrevious className="bg-gray-800/90 hover:bg-gray-700/90 border-gray-600 text-gray-300 hover:text-white w-12 h-12 shadow-lg rounded-full transform transition-transform duration-300 hover:scale-110" />
                                                                <CarouselNext className="bg-gray-800/90 hover:bg-gray-700/90 border-gray-600 text-gray-300 hover:text-white w-12 h-12 shadow-lg rounded-full transform transition-transform duration-300 hover:scale-110" />
                                                            </>
                                                        )}
                                                    </Carousel>
                                                </div>



                                                {dataSolicitacao.arquivos.length > 1 && (
                                                    <div className="flex justify-center space-x-2 pb-6">
                                                        {dataSolicitacao.arquivos.map((_, index) => (
                                                            <div
                                                                key={index}
                                                                className="w-2 h-2 rounded-full bg-gray-600 transition-colors duration-200 hover:bg-gray-400"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </>
                            )}

                            <Separator className="my-2 bg-gray-600" />

                            <div className="text-xs text-gray-400 space-y-1">
                                <p>
                                    Criado em:{" "}
                                    <span className="text-white">
                                        {dayjs(dataSolicitacao?.createdAt).format("DD/MM/YYYY HH:mm")}
                                    </span>
                                </p>
                                <p>
                                    Atualizado em:{" "}
                                    <span className="text-white">
                                        {dayjs(dataSolicitacao?.updatedAt).format("DD/MM/YYYY HH:mm")}
                                    </span>
                                </p>
                            </div>

                            {session?.user?.permissao === 'ATENDENTE' &&
                                dataSolicitacao?.status !== 'FINALIZADA' &&
                                dataSolicitacao?.status !== 'CANCELADA' && (
                                    <>
                                        <Separator className="my-2 bg-gray-600" />

                                        <div className="text-xs text-gray-400 space-y-1 flex flex-col gap-1.5">
                                            <p>AÇÕES</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange("FINALIZADA")}
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Resolvido
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => handleStatusChange("CANCELADA")}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Cancelado
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                        </>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}
