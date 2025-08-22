"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { FileDown, File, X, Send, PictureInPicture, MessageCircleMore } from 'lucide-react';
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import io, { Socket } from "socket.io-client";
import { Dialog, DialogContent } from "../ui/dialog";

const chatChannel = new BroadcastChannel('chat-channel');

export default function Chat() {
  const params = useParams();
  const solicitacaoId = params.id as string;
  const { data: session } = useSession();
  const [loadingMensagens, setLoadingMensagens] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [input, setInput] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [confirmarUrl, setConfirmarUrl] = useState<string | null>(null);
  const isDocumentPiPSupported = () => 'documentPictureInPicture' in window;
  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
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
    chatChannel.onmessage = (event) => {
      if (event.data.type === 'newMessage') {
        setMensagens((prev) => [...prev, event.data.content]);
      } else if (event.data.type === 'syncMessages') {
        setMensagens(event.data.messages);
      } else if (event.data.type === 'requestSolicitacaoId') {
        chatChannel.postMessage({ type: 'setSolicitacaoId', solicitacaoId });
      }
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
        chatChannel.postMessage({ type: 'syncMessages', messages: json });
      } catch (e) {
        toast.error("Erro ao buscar mensagens:", e);
      } finally {
        setLoadingMensagens(false);
      }
    };

    buscarMensagensAntigas();
  }, [solicitacaoId]);

  const openPiPWindow = async () => {
    if (!isDocumentPiPSupported()) {
      toast.error('Seu navegador não suporta a API de Document Picture-in-Picture.');
      return;
    }

    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 400,
        height: 600,
      });

      setIsPipActive(true);
      const styleLinks = document.querySelectorAll('link[rel="stylesheet"]');
      styleLinks.forEach((link) => {
        const newLink = pipWindow.document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = link.href;
        pipWindow.document.head.appendChild(newLink);
      });

      const styles = document.querySelectorAll('style');
      styles.forEach((style) => {
        const newStyle = pipWindow.document.createElement('style');
        newStyle.textContent = style.textContent;
        pipWindow.document.head.appendChild(newStyle);
      });

      const iframe = pipWindow.document.createElement('iframe');
      iframe.src = `/chat-pip?solicitacaoId=${solicitacaoId}`;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      pipWindow.document.body.appendChild(iframe);

      pipWindow.addEventListener('pagehide', () => {
        setIsPipActive(false);
      });

      toast.success('A Picture-in-Picture está ativa!');

    } catch (error) {
      console.error('Erro ao abrir a Picture-in-Picture:', error);
      toast.error('Erro ao abrir Picture-in-Picture');
    }
  };

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
        const novaMensagem = await res.json();
        chatChannel.postMessage({ type: 'newMessage', content: novaMensagem });
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

  return (
    <section className='flex flex-col gap-4 col-span-1'>
      <div
        ref={chatContainerRef}
      >
        <Card className="flex flex-col h-[85vh]">
          <CardHeader className="px-4 pt-4 pb-2 border-b border-blue-400">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-blue-400">
                Atendimento
              </CardTitle>
              {!isPipActive && (
                <>
                  <Button
                    variant="transparent"
                    size="sm"
                    onClick={openPiPWindow}
                    disabled={!isDocumentPiPSupported() || isPipActive}
                    className="text-blue-400 hover:text-white"
                  >
                    <PictureInPicture className="w-4 h-4 mr-1" />
                  </Button>
                </>
              )}

            </div>
          </CardHeader>

          {isPipActive ? (
            <>
              <CardContent className="flex-1 flex items-center justify-center py-6 px-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <span className="text-blue-400 font-semibold text-lg flex items-center gap-3">
                    <MessageCircleMore className="w-10 h-10" />  Chat em modo Picture-in-Picture
                  </span>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Continue acompanhando suas mensagens na janela flutuante.
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <>
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
                            <AvatarFallback className="bg-gray-800 text-white text-xs">
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
                            "rounded-2xl px-4 py-2 max-w-xs w-full shadow-md space-y-2 flex flex-col",
                            isSelf ? "bg-blue-600" : "bg-gray-700"
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
                                  <img
                                    src={process.env.NEXT_PUBLIC_BASE_URL + msg.arquivoUrl}
                                    width={200}
                                    height={200}
                                    alt="Arquivo"
                                    className="w-full h-auto rounded-lg object-contain"
                                  />
                                </a>
                              ) : (
                                <div
                                  onClick={() => setConfirmarUrl(msg.arquivoUrl)}
                                  className="group flex items-center gap-3 p-3 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors max-w-xs"
                                >
                                  <div className="flex-shrink-0 bg-gray-700 rounded-md p-2">
                                    <FileDown className="w-5 h-5 text-blue-400" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-white text-sm truncate">{msg.arquivoNome ?? "Arquivo"}</span>
                                    <span className="text-xs text-gray-400 group-hover:underline">Clique para abrir</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="text-sm whitespace-pre-wrap break-all leading-snug">{msg.conteudo}</div>
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
                              <AvatarFallback className="bg-blue-700 text-white text-xs">
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

              <CardFooter className="flex flex-col w-full border-t border-blue-400 px-4 py-3">
                <AnimatePresence>
                  {arquivo && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, height: 0, overflow: 'hidden', paddingTop: 0, paddingBottom: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto', paddingTop: '1rem', paddingBottom: '1rem', marginBottom: '1rem' }}
                      exit={{ opacity: 0, y: 10, height: 0, paddingTop: 0, paddingBottom: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center px-2 justify-between border border-gray-700/50 rounded-2xl w-full"
                    >
                      <div className="flex gap-3 items-center">
                        <File size={23} color="#3381ff" />
                        <span className="text-xs text-blue-400 truncate max-w-[400px]">
                          {arquivo
                            ? arquivo.name.length > 50
                              ? arquivo.name.slice(0, 50) + '...'
                              : arquivo.name
                            : 'Sem arquivo'}
                        </span>
                      </div>
                      <X
                        size={23}
                        color="#f14445"
                        className="cursor-pointer"
                        onClick={() => {
                          setArquivo(null)
                          if (inputFileRef.current) inputFileRef.current.value = "";
                          inputFileRef.current?.blur();
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEnviar();
                  }}
                  className="w-full relative flex items-center gap-3"
                >
                  <Input
                    type="file"
                    id="upload"
                    ref={inputFileRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setArquivo(file);
                      
                      // if (file) {
                      //   setTimeout(() => {
                      //     scrollToBottom();
                      //   }, 350);
                      // }
                    }}
                  />
                  <label htmlFor="upload" className="rounded-full w-14 h-12 p-0 flex items-center justify-center transition-all duration-200 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/25">
                    <FileDown size={23} />
                  </label>

                  <Input
                    placeholder="Digite uma mensagem..."
                    style={{
                      width: '100%',
                      height: '50px',
                    }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-gray-700/80 border-gray-600/50 text-white placeholder:text-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm rounded-full pr-11 py-3 text-sm"
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() && !arquivo}
                    size="sm"
                    className={cn(
                      "absolute right-2 rounded-full w-8 h-8 p-0 transition-all duration-200",
                      (input.trim() || arquivo)
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/25"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <Send size={20} />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      </div>

      <Dialog open={!!confirmarUrl} onOpenChange={() => setConfirmarUrl(null)}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-sm border border-gray-700">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white">Abrir arquivo externo</h2>
            <p className="text-sm text-gray-400">
              Este arquivo será aberto em uma nova aba. Deseja continuar?
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant={'transparent'}
              onClick={() => setConfirmarUrl(null)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700/50 transition"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (confirmarUrl) {
                  window.open(confirmarUrl, '_blank');
                  setConfirmarUrl(null);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Abrir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
