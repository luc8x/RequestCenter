'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileDown, File, Send, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Message {
  id: number;
  conteudo: string;
  autorId: number;
  solicitacaoId: number;
  createdAt: string;
  arquivoUrl?: string;
  arquivoNome?: string;
  autor: {
    id: number;
    name: string;
    email: string;
  };
}

const ChatWindow = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [solicitacaoId, setSolicitacaoId] = useState<string | null>(searchParams.get('solicitacaoId'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const [confirmarUrl, setConfirmarUrl] = useState<string | null>(null);
  const [imagemUrl, setImagemUrl] = useState<string | null>(null);
  const [imagemNome, setImagemNome] = useState<string | null>(null);

  const isImagem = (url: string) => {
    return /\.(jpe?g|png|gif|webp)$/i.test(url);
  };

  useEffect(() => {
    const chatChannel = new BroadcastChannel('chat-channel');

    chatChannel.onmessage = (event) => {
      if (event.data.type === 'setSolicitacaoId') {
        setSolicitacaoId(event.data.solicitacaoId);
      } else if (event.data.type === 'newMessage') {
        setMessages((prev) => [...prev, event.data.content]);
      } else if (event.data.type === 'syncMessages') {
        setMessages(event.data.messages);
      }
    };

    if (!solicitacaoId) {
      chatChannel.postMessage({ type: 'requestSolicitacaoId' });
    }

    return () => {
      chatChannel.close();
    };
  }, [solicitacaoId]);

  useEffect(() => {
    if (solicitacaoId) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        path: "/api/socket_io",
      });

      socketRef.current = newSocket;
      newSocket.emit('join_chat', solicitacaoId);

      newSocket.on('nova_mensagem', (novaMensagem: Message) => {
        setMessages(prev => [...prev, novaMensagem]);
      });

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
      };
    }
  }, [solicitacaoId]);

  const loadMessages = useCallback(async () => {
    if (!solicitacaoId) return;

    try {
      const response = await fetch(`/api/solicitacao/chat/${solicitacaoId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    }
  }, [solicitacaoId]);

  useEffect(() => {
    if (session && solicitacaoId) {
      loadMessages();
    }
  }, [session, solicitacaoId, loadMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEnviar = async () => {
    if ((!inputValue.trim() && !arquivo) || !solicitacaoId || !session?.user) return;

    const formData = new FormData();
    formData.append('conteudo', inputValue.trim());
    if (arquivo) {
      formData.append("arquivo", arquivo);
    }

    try {
      const response = await fetch(`/api/solicitacao/chat/${solicitacaoId}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        toast.error('Erro ao enviar mensagem');
      } else {
        setInputValue('');
        setArquivo(null);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isCurrentUser = (autorId: number) => {
    return session?.user?.id === autorId;
  };

  const handleArquivoClick = (url: string, nome: string) => {
    if (isImagem(url)) {
      setImagemUrl(url);
      setImagemNome(nome);
    } else {
      setConfirmarUrl(url);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-10 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <h1 className="text-white font-semibold text-lg">Chat</h1>
      </div>
      {!messages ? (
        // Loading
        <div className="h-full flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : messages.length === 0 ? (
        // Nenhuma mensagem
        <div className="h-full flex flex-col gap-2 items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
          <p className="text-gray-400 text-sm text-center">
            Nenhuma mensagem encontrada.
          </p>
          <p className="text-gray-400 text-sm text-center">
            Envie uma mensagem para começar a conversa.
          </p>
        </div>
      ) : (
        // Lista de mensagens
        <ScrollArea className="flex-1 bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
          <div className={cn("px-5 pt-20 pb-22 flex flex-col gap-4 transition-all", (arquivo) ? 'mb-18' : 'pb-22')}>
            <AnimatePresence>
              {messages?.map((message) => {
                const isUser = isCurrentUser(message.autorId);
                const userInitials = message.autor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    onAnimationComplete={scrollToBottom}
                    className={cn(
                      "flex items-start gap-3 max-w-[85%]",
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-md",
                        isUser ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-200"
                      )}
                    >
                      {userInitials || <User className="w-4 h-4" />}
                    </div>

                    {/* Conteúdo da mensagem */}
                    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
                      <p className={cn("text-xs font-medium mb-1 px-1", isUser ? "text-blue-300" : "text-gray-400")}>
                        {isUser ? "Você" : message.autor.name}
                      </p>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 text-sm break-words shadow-lg max-w-full",
                          isUser ? "bg-blue-500 text-white rounded-br-md" : "bg-gray-700 text-gray-100 rounded-bl-md"
                        )}
                      >
                        <div className='flex flex-col gap-2'>
                          {message.arquivoUrl && (
                            <div className="mt-2">
                              {message.arquivoUrl.match(/\.(jpe?g|png|gif|webp)$/i) ? (
                                <div
                                  onClick={() => handleArquivoClick(message.arquivoUrl, message.arquivoNome)}
                                  className={cn(
                                    isImagem(message.arquivoUrl)
                                      ? "cursor-zoom-in w-fit"
                                      : "group flex items-center gap-3 p-3 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors max-w-xs cursor-pointer"
                                  )}
                                >
                                  <img
                                    src={process.env.NEXT_PUBLIC_BASE_URL + message.arquivoUrl}
                                    width={200}
                                    height={200}
                                    alt="Arquivo"
                                    className="w-full max-w-[500px] h-auto rounded-lg object-contain"
                                  />
                                </div>
                              ) : (

                                <div className="group flex items-center gap-3 p-3 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 transition-colors max-w-xs" onClick={() => handleArquivoClick(message.arquivoUrl)}>
                                  <div className="flex-shrink-0 bg-gray-700 rounded-md p-2">
                                    <FileDown className="w-5 h-5 text-blue-400" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-white text-sm truncate">{message.arquivoNome ?? "Arquivo"}</span>
                                    <span className="text-xs text-gray-400 group-hover:underline">Clique para abrir</span>
                                  </div>
                                </div>

                              )}
                            </div>
                          )}

                          <div className="text-sm whitespace-pre-wrap break-all leading-snug">
                            {message.conteudo}
                          </div>
                        </div>
                        <span className={cn("text-xs mt-1 block", isUser ? "text-blue-100 text-right" : "text-gray-400 text-left")}>
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700/50 p-4">
        <AnimatePresence>
          {arquivo && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0, overflow: 'hidden', paddingTop: 0, paddingBottom: 0, marginBottom: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto', paddingTop: '1rem', paddingBottom: '1rem', marginBottom: '1rem' }}
              exit={{ opacity: 0, y: 10, height: 0, paddingTop: 0, paddingBottom: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center px-2 justify-between border border-gray-700/50 rounded-2xl"
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
                onClick={() => setArquivo(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEnviar();
          }}
          className="relative flex items-center gap-3"
        >
          <Input
            type="file"
            id="upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setArquivo(file);
              if (file) {
                setTimeout(() => {
                  scrollToBottom();
                }, 350);
              }
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
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-gray-700/80 border-gray-600/50 text-white placeholder:text-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm rounded-full pr-11 py-3 text-sm"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() && !arquivo}
            size="sm"
            className={cn(
              "absolute right-2 rounded-full w-8 h-8 p-0 transition-all duration-200",
              (inputValue.trim() || arquivo)
                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/25"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            )}
          >
            <Send size={20} />
          </Button>

        </form>
      </div>

      <Dialog open={!!imagemUrl} onOpenChange={() => setImagemUrl(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm border border-gray-700">
          <DialogHeader className="text-gray-600 text-start">
            <DialogTitle style={{ fontSize: '15px' }}>{imagemNome}</DialogTitle>
          </DialogHeader>
          {imagemUrl && (
            <img
              src={process.env.NEXT_PUBLIC_BASE_URL + imagemUrl}
              alt="Visualização"
              className="max-w-full max-h-full rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmarUrl} onOpenChange={() => setConfirmarUrl(null)}>
        <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-sm border border-gray-700">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Abrir arquivo externo</h2>
            <p className="text-sm text-gray-400">
              Este arquivo será aberto em uma nova aba. Deseja continuar?
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant={'outline'}
              onClick={() => setConfirmarUrl(null)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
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
    </div>

  );
};

export default ChatWindow;