'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: number;
  conteudo: string;
  autorId: number;
  solicitacaoId: number;
  createdAt: string;
  autor: {
    id: number;
    name: string;
    email: string;
  };
}

const ChatWindow = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [solicitacaoId] = useState<number | null>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !solicitacaoId || !session?.user) return;

    const messageContent = inputValue.trim();
    setInputValue('');

    const tempMessage: Message = {
      id: Date.now(),
      conteudo: messageContent,
      autorId: session.user.id,
      solicitacaoId: solicitacaoId,
      createdAt: new Date().toISOString(),
      autor: {
        id: session.user.id,
        name: session.user.name || 'Usuário',
        email: session.user.email || ''
      }
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      const formData = new FormData();
      formData.append('conteudo', messageContent);

      const response = await fetch(`/api/solicitacao/chat/${solicitacaoId}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        toast.error('Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
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

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-10 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 p-4">
        <h1 className="text-white font-semibold text-lg">Chat</h1>
      </div>

      <ScrollArea className="h-full pt-[65px]">
        <div className='px-5 flex flex-col gap-3'>
          <AnimatePresence>
            {messages.map((message, index) => {
              const isUser = isCurrentUser(message.autorId);
              const userInitials = message.autor.name
                .split(' ')
                .map((name) => name.charAt(0))
                .join('')
                .toUpperCase()
                .slice(0, 2);

              const isFirst = index === 0;
              const isLast = index === messages.length - 1;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex items-start gap-3 max-w-[85%]",
                    isUser ? "ml-auto flex-row-reverse" : "mr-auto", isFirst && "mt-22", isLast && "mb-4")}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-md",
                      isUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-600 text-gray-200"
                    )}
                  >
                    {userInitials || <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={cn(
                      "flex flex-col",
                      isUser ? "items-end" : "items-start"
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-medium mb-1 px-1",
                        isUser ? "text-blue-300" : "text-gray-400"
                      )}
                    >
                      {isUser ? "Você" : message.autor.name}
                    </p>

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 text-sm break-words shadow-lg max-w-full",
                        isUser
                          ? "bg-blue-500 text-white rounded-br-md"
                          : "bg-gray-700 text-gray-100 rounded-bl-md"
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap break-all leading-snug">
                        {message.conteudo}
                      </div>
                      <span
                        className={cn(
                          "text-xs mt-1 block",
                          isUser ? "text-blue-100" : "text-gray-400"
                        )}
                      >
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

      <div className="bg-gray-800/90 backdrop-blur-sm border-t border-gray-700/50 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative"
        >
          <div className="relative flex items-center">
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
              disabled={!inputValue.trim()}
              size="sm"
              className={cn(
                "absolute right-2 rounded-full w-8 h-8 p-0 transition-all duration-200",
                inputValue.trim()
                  ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/25"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>

  );
};

export default ChatWindow;