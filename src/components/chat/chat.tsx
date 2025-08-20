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
import { FileDown, Send, PictureInPicture,MessageCircleMore } from 'lucide-react';
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import io, { Socket } from "socket.io-client";
import Image from 'next/image'

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

  const isDocumentPiPSupported = () => 'documentPictureInPicture' in window;

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
      }
    };
  }, []);

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
      iframe.src = '/chat-window';
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
                    <PictureInPicture  className="w-4 h-4 mr-1" />
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
                    <MessageCircleMore className="w-10 h-10"/>  Chat em modo PiP
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
                                  <Image
                                    src={msg.arquivoUrl}
                                    width={200}
                                    height={200}
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
            </>
          )}
        </Card>
      </div>
    </section>
  );
}
