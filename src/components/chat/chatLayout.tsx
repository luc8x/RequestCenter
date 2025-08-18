"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { Check, FileDown, Send, X, Eye, Minimize2, Maximize2, Move, PictureInPicture2, Square } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { io, Socket } from "socket.io-client";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from 'next/image'

export default function ChatLayout() {
  // Dados
  const params = useParams();
  const solicitacaoId = params.id as string;
  const [dataSolicitacao, setData] = useState([]);
  const { data: session } = useSession();
  // const [dialogOpen, setDialogOpen] = useState(false);
  
  // Estados para modo flutuante
  const [isFloating, setIsFloating] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Estados para Picture-in-Picture
  const [isPiPSupported, setIsPiPSupported] = useState(true); // Sempre suportado para popup
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  //Loadings
  const [loadingMensagens, setLoadingMensagens] = useState(true);
  const [loading, setLoading] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Submit
  const [input, setInput] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [arquivo, setArquivo] = useState<File | null>(null);

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

      if (!res.ok) throw new Error();

      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Erro ao buscar solicitações.");
    } finally {
      setLoading(false);
    }
  }, [solicitacaoId]);

  useEffect(() => {
    fetchSolicitacao();
  }, [fetchSolicitacao]);

  useEffect(() => {
    const socket = io("http://localhost:3001", {
      path: "/api/socket_io",
    });

    socketRef.current = socket;

    socket.emit("join_chat", solicitacaoId);

    socket.on("nova_mensagem", (mensagem) => {
      setMensagens((prev) => [...prev, mensagem]);
    });

    return () => {
      socket.disconnect();
    };
  }, [solicitacaoId]);

  useEffect(() => {
    const buscarMensagensAntigas = async () => {
      setLoadingMensagens(true);
      try {
        const res = await fetch(`/api/solicitacao/chat/${solicitacaoId}`);
        if (!res.ok) throw new Error("Erro");
        const json = await res.json();
        setMensagens(json);
      } catch (err) {
        toast.error("Erro ao buscar mensagens:", err);
      } finally {
        setLoadingMensagens(false);
      }
    };

    buscarMensagensAntigas();
  }, [solicitacaoId]);





  const handleEnviar = async () => {
    if (!input.trim() && !arquivo) return;

    const formData = new FormData();
    formData.append("conteudo", input);
    if (arquivo) {
      formData.append("arquivo", arquivo);
    }

    try {
      const res = await fetch(`/api/solicitacao/chat/${solicitacaoId}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setInput("");
        setArquivo(null);
      }
    } catch (e) {
      toast.error("Erro ao enviar mensagem", e);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // useEffect para monitorar fechamento da janela PiP
  useEffect(() => {
    if (pipWindow) {
      const checkClosed = setInterval(() => {
        if (pipWindow.closed) {
          setIsPiPActive(false);
          setPipWindow(null);
          clearInterval(checkClosed);
        }
      }, 1000);

      return () => clearInterval(checkClosed);
    }
  }, [pipWindow]);

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
      toast.error(err ? err : 'Erro ao atulizar');
    }
  };

  // Funções para arrastar o chat flutuante
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - floatingPosition.x,
      y: e.clientY - floatingPosition.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Usa clientX/clientY para movimento dentro da viewport
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Garante que a janela não saia completamente da viewport
    const minX = -300; // Permite que 100px da janela fique visível
    const minY = 0;
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;
    
    setFloatingPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Função para abrir o chat em janela PiP
  const openChatPiP = () => {
    if (isPiPActive || !session?.user) return;
    
    try {
      // Criar HTML para a janela PiP
      const pipHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Chat PiP - Solicitação #${dataSolicitacao?.id}</title>
          <meta charset="utf-8">
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
            .chat-container { height: 100vh; display: flex; flex-direction: column; background: #111827; color: white; }
            .chat-header { background: #1f2937; padding: 1rem; border-bottom: 1px solid #374151; }
            .chat-messages { flex: 1; overflow-y: auto; padding: 1rem; }
            .chat-input { background: #1f2937; padding: 1rem; border-top: 1px solid #374151; }
            .message { margin-bottom: 1rem; }
            .message-user { text-align: right; }
            .message-content { display: inline-block; padding: 0.5rem 1rem; border-radius: 0.5rem; max-width: 70%; }
            .message-user .message-content { background: #2563eb; }
            .message-other .message-content { background: #374151; }
            .input-container { display: flex; gap: 0.5rem; }
            .input-field { flex: 1; padding: 0.5rem; border: 1px solid #374151; border-radius: 0.25rem; background: #374151; color: white; }
            .send-button { padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 0.25rem; cursor: pointer; }
            .send-button:hover { background: #1d4ed8; }
          </style>
        </head>
        <body>
          <div class="chat-container">
            <div class="chat-header">
              <h1>Chat - Solicitação #${dataSolicitacao?.id}</h1>
            </div>
            <div class="chat-messages" id="messages"></div>
            <div class="chat-input">
              <div class="input-container">
                <input type="text" id="messageInput" class="input-field" placeholder="Digite sua mensagem..." />
                <button id="sendButton" class="send-button">Enviar</button>
              </div>
            </div>
          </div>
          <script>
            let messages = ${JSON.stringify(mensagens)};
            const userId = ${session.user.id};
            const userType = '${session.user.permissao}';
            const solicitacaoId = '${params.id}';
            
            function renderMessages() {
              const container = document.getElementById('messages');
              container.innerHTML = '';
              
              messages.forEach(msg => {
                const isUser = msg.autorId === userId;
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message ' + (isUser ? 'message-user' : 'message-other');
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                contentDiv.innerHTML = '<strong>' + msg.autor.name + ':</strong><br>' + msg.conteudo;
                
                messageDiv.appendChild(contentDiv);
                container.appendChild(messageDiv);
              });
              
              container.scrollTop = container.scrollHeight;
            }
            
            async function sendMessage() {
              const input = document.getElementById('messageInput');
              const message = input.value.trim();
              if (!message) return;
              
              try {
                const formData = new FormData();
                formData.append('conteudo', message);
                
                const response = await fetch('/api/solicitacao/chat/' + solicitacaoId, {
                  method: 'POST',
                  body: formData
                });
                
                if (response.ok) {
                  input.value = '';
                  loadMessages();
                }
              } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
              }
            }
            
            async function loadMessages() {
              try {
                const response = await fetch('/api/solicitacao/chat/' + solicitacaoId);
                if (response.ok) {
                  messages = await response.json();
                  renderMessages();
                }
              } catch (error) {
                console.error('Erro ao carregar mensagens:', error);
              }
            }
            
            document.getElementById('sendButton').onclick = sendMessage;
            document.getElementById('messageInput').onkeypress = function(e) {
              if (e.key === 'Enter') sendMessage();
            };
            
            renderMessages();
            setInterval(loadMessages, 2000);
          </script>
        </body>
        </html>
      `;
      
      // Abrir janela popup
      const newWindow = window.open(
        'about:blank',
        'chatPiP',
        'width=400,height=600,resizable=yes,scrollbars=no,status=no,menubar=no,toolbar=no'
      );
      
      if (newWindow) {
        newWindow.document.write(pipHtml);
        newWindow.document.close();
        setPipWindow(newWindow);
        setIsPiPActive(true);
        toast.success('Chat PiP aberto!');
      }
    } catch (error) {
      console.error('Erro ao abrir Chat PiP:', error);
      toast.error('Erro ao abrir Chat PiP');
    }
  };

  // Função para fechar o chat PiP
  const closeChatPiP = () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
      setIsPiPActive(false);
    }
  };

  if (isFloating) {
    return (
      <>
        {/* Portal para renderizar fora do DOM da aplicação */}
        {typeof window !== 'undefined' && (
          <div 
            className="fixed bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl resize overflow-hidden"
            style={{
              left: floatingPosition.x,
              top: floatingPosition.y,
              width: '400px',
              height: '600px',
              minWidth: '350px',
              minHeight: '400px',
              maxWidth: '600px',
              maxHeight: '800px',
              zIndex: 2147483647, // Valor máximo para z-index
              position: 'fixed'
            }}
          >
            {/* Header do chat flutuante */}
            <div 
              className="flex items-center justify-between p-3 bg-gray-800/50 border-b border-gray-700 cursor-move select-none"
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-white truncate">
                  Chat - {dataSolicitacao?.assunto || 'Carregando...'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFloating(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-700/50"
                >
                  <Maximize2 className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
            </div>

            {/* Conteúdo do chat flutuante com layout fixo */}
            <div className="flex flex-col h-[calc(100%-60px)]">
              {/* Área de mensagens com scroll */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
                {loadingMensagens ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-600 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <div className="w-20 h-3 bg-gray-600 rounded" />
                          <div className="w-full h-4 bg-gray-600 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : mensagens.length > 0 ? (
                  mensagens.map((mensagem: any, index: number) => {
                    const isUser = mensagem.usuario?.id === session?.user?.id;
                    return (
                      <motion.div
                        key={mensagem.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={cn(
                          "flex gap-2 max-w-[85%]",
                          isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm break-words",
                            isUser
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-100"
                          )}
                        >
                          <div className="flex flex-col gap-1">
                            <p className="whitespace-pre-wrap">{mensagem.conteudo}</p>
                            {mensagem.arquivoUrl && (
                              <div className="mt-2">
                                <a
                                  href={mensagem.arquivoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200 underline"
                                >
                                  <FileDown className="w-3 h-3" />
                                  {mensagem.nomeOriginalArquivo || "Arquivo"}
                                </a>
                              </div>
                            )}
                            <span className="text-xs opacity-70">
                              {dayjs(mensagem.criadoEm).format("DD/MM/YYYY HH:mm")}
                            </span>
                          </div>
                        </div>
                        <Avatar className="w-6 h-6 flex-shrink-0">
                          <AvatarFallback className="text-xs bg-gray-600 text-gray-200">
                            {mensagem.usuario?.nome?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-gray-400 text-xs text-center">Nenhuma mensagem encontrada.</p>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input fixo na parte inferior */}
              <div className="border-t border-gray-700 p-3 bg-gray-900/50 backdrop-blur-sm">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEnviar();
                  }}
                  className="flex items-center gap-2 w-full"
                  encType="multipart/form-data"
                >
                  {arquivo && (
                    <span className="text-xs text-gray-400 truncate max-w-[100px]">{arquivo.name}</span>
                  )}

                  <input
                    type="file"
                    id="upload-floating"
                    className="hidden"
                    onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                  />
                  <label htmlFor="upload-floating" className="bg-secondary p-1.5 text-black rounded-md cursor-pointer flex-shrink-0">
                    <FileDown size={16} />
                  </label>

                  <Input
                    placeholder="Digite sua mensagem..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 text-white placeholder:text-gray-400/70 border-gray-600 focus:ring-gray-400 focus:border-gray-400 text-sm"
                  />

                  <Button type="submit" variant="secondary" size="sm" disabled={!input.trim() && !arquivo} className="flex-shrink-0">
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`grid gap-6 grid-cols-1 md:grid-cols-[2fr_2fr] text-gray-100`}>
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
                    title={isPiPActive ? "Sair do Picture-in-Picture" : "Ativar Picture-in-Picture"}
                  >
                    {isPiPActive ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <PictureInPicture2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFloating(true)}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                  title="Modo flutuante"
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-5 py-6 px-4 text-sm">
            {loading ? (
              <div className="animate-pulse flex-1 overflow-y-auto space-y-5 text-sm">
                <div className="space-y-1">
                  <div className="w-24 h-4 bg-gray-600 rounded-md" />
                  <div className="w-full h-5 bg-gray-600 rounded-md" />
                </div>

                <div className="space-y-1">
                  <div className="w-24 h-4 bg-gray-600 rounded-md" />
                  <div className="w-full h-20 bg-gray-600 rounded-md" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="w-24 h-4 bg-gray-600 rounded-md" />
                    <div className="w-20 h-6 bg-gray-600 rounded-md" />
                  </div>
                  <div className="space-y-1">
                    <div className="w-24 h-4 bg-gray-600 rounded-md" />
                    <div className="w-20 h-6 bg-gray-600 rounded-md" />
                  </div>
                </div>

                <div className="h-px bg-gray-500 my-2" />

                <div className="space-y-1">
                  <div className="w-24 h-4 bg-gray-600 rounded-md" />
                  <div className="w-40 h-4 bg-gray-600 rounded-md" />
                  <div className="w-56 h-3 bg-gray-600 rounded-md" />
                </div>

                <div className="space-y-1">
                  <div className="w-24 h-4 bg-gray-600 rounded-md" />
                  <div className="w-40 h-4 bg-gray-600 rounded-md" />
                  <div className="w-56 h-3 bg-gray-600 rounded-md" />
                </div>

                <div className="h-px bg-gray-500 my-2" />

                <div className="text-xs text-gray-400 space-y-1">
                  <div className="w-40 h-3 bg-gray-600 rounded-md" />
                  <div className="w-40 h-3 bg-gray-600 rounded-md" />
                </div>

                <div className="h-px bg-gray-500 my-2" />

                <div className="text-xs text-gray-400 space-y-1">
                  <div className="w-40 h-3 bg-gray-600 rounded-md" />
                  <div className="w-40 h-3 bg-gray-600 rounded-md" />
                </div>
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
                              {/* Botões centralizados abaixo da imagem */}
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
      <section className='flex flex-col gap-4 col-span-1'>
        <Card className="flex flex-col h-[85vh]">
          <CardHeader className="px-4 pt-4 pb-2 border-b border-blue-400">
            <CardTitle className="text-lg font-semibold text-blue-400">
              Atendimento
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-5 py-6 px-4">
            {loadingMensagens ? (
              <div className="flex flex-col gap-4">
                {[...Array(4)].map((_, i) => {
                  const isSelf = i % 2 === 0;

                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3 animate-pulse",
                        isSelf ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isSelf && (
                        <div className="w-10 h-10 rounded-full bg-gray-600 shadow-md" />
                      )}

                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 max-w-xs w-full shadow-md space-y-2",
                          isSelf ? "bg-blue-600" : "bg-gray-700"
                        )}
                      >
                        <div className={cn("h-3 rounded", isSelf ? "bg-blue-400 w-1/2" : "bg-gray-500 w-1/2")} />
                        <div className={cn("h-3 rounded", isSelf ? "bg-blue-300 w-5/6" : "bg-gray-600 w-5/6")} />
                        <div className={cn("h-3 rounded", isSelf ? "bg-blue-300 w-1/3" : "bg-gray-600 w-1/3")} />
                      </div>

                      {isSelf && (
                        <div className="w-10 h-10 rounded-full bg-gray-600 shadow-md" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : Array.isArray(mensagens) && mensagens.length > 0 ? (
              mensagens.map((msg) => {
                const isSelf = msg.autorId === session?.user?.id;
                const hora = dayjs(msg.createdAt).format("HH:mm");
                return (
                  <motion.div
                    key={msg.id}
                    initial={msg.autorId === session?.user?.id && msg.id === mensagens[mensagens.length - 1]?.id ?
                      { opacity: 0, y: 20, scale: 0.95 } : false}
                    animate={msg.autorId === session?.user?.id && msg.id === mensagens[mensagens.length - 1]?.id ?
                      { opacity: 1, y: 0, scale: 1 } : false}
                    transition={{
                      duration: 0.35,
                      type: "spring",
                      bounce: 0.25,
                      stiffness: 120,
                      damping: 15,
                    }}
                    className={cn(
                      "flex items-start gap-3",
                      isSelf ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isSelf && (
                      <Avatar className="w-8 h-8 ring-1 ring-blue-400">
                        <AvatarFallback className="bg-blue-700 text-white text-xs">
                          <div className="text-sm font-semibold leading-none">
                            {msg.autor.name?.[0] ?? "U"}
                            {msg.autor.name?.split(" ")?.[1]?.[0] ?? "S"}
                          </div>
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <motion.div
                      layout
                      className={cn(
                        "rounded-2xl px-2 py-2 max-w-xs w-full shadow-md space-y-2 flex flex-col",
                        isSelf ? "bg-blue-800" : "bg-gray-700"
                      )}
                    >
                      <div className="text-sm font-semibold leading-none">
                        {msg.autor.name}
                      </div>
                      {msg.arquivoUrl && (
                        <div className="mt-2">
                          {msg.arquivoUrl.match(/\.(jpe?g|png|gif|webp)$/i) ? (
                            <a
                              href={msg.arquivoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              <Image
                                src={msg.arquivoUrl}
                                alt="Arquivo"
                                className="w-full h-auto rounded-lg object-contain"
                              />
                            </a>
                          ) : (
                            <a
                              href={msg.arquivoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-3 p-3 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors max-w-xs"
                            >
                              <div className="flex-shrink-0 bg-gray-700 rounded-md p-2">
                                <FileDown className="w-5 h-5 text-blue-400" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-white text-sm truncate">{msg.arquivoNome ?? "Arquivo"}</span>
                                <span className="text-xs text-gray-400 group-hover:underline">Clique para abrir</span>
                              </div>
                            </a>
                          )}
                        </div>
                      )}

                      <div className="text-sm whitespace-pre-wrap break-words leading-snug">{msg.conteudo}</div>
                      <div
                        className="text-end font-semibold text-xs opacity-60"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {hora}
                      </div>
                    </motion.div>

                    {
                      isSelf && (
                        <Avatar className="w-8 h-8 ring-1 ring-blue-400">
                          <AvatarFallback className="bg-gray-800 text-white text-xs">
                            {msg.autor?.name?.slice(0, 2)?.toUpperCase() ?? "US"}
                          </AvatarFallback>
                        </Avatar>
                      )
                    }
                  </motion.div>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm">Nenhuma mensagem encontrada.</p>
            )}

            <div ref={chatEndRef} />
          </CardContent>

          <CardFooter className="border-t border-blue-400 px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEnviar();
              }}
              className="flex items-center gap-2 w-full"
              encType="multipart/form-data"
            >
              {arquivo && (
                <span className="text-xs text-gray-400 truncate max-w-[200px]">{arquivo.name}</span>
              )}

              <input
                type="file"
                id="upload"
                className="hidden"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              />
              <label htmlFor="upload" className="bg-secondary p-1.5 text-black rounded-md">
                <FileDown size={20} />
              </label>

              <Input
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 text-white placeholder:text-gray-400/70 border-ring-700 focus:ring-gray-400 focus:border-ring-400"
              />

              <Button type="submit" variant="secondary" disabled={!input.trim() && !arquivo}>
                <Send className="w-4 h-4 mr-1" />
                Enviar
              </Button>
            </form>
          </CardFooter>
        </Card>
      </section>
      

    </div >
  );
}
