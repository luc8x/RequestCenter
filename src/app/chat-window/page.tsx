'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

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

  useEffect(() => {
    if (solicitacaoId) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        path: "/api/socket_io",
      });

      newSocket.emit('join_chat', solicitacaoId);

      newSocket.on('nova_mensagem', (novaMensagem: Message) => {
        setMessages(prev => [...prev, novaMensagem]);
      });

      return () => {
        newSocket.disconnect();
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
    if (!inputValue.trim() || !solicitacaoId) return;
    
    try {
      const formData = new FormData();
      formData.append('conteudo', inputValue);
      
      const response = await fetch(`/api/solicitacao/chat/${solicitacaoId}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        setInputValue('');
        toast.success('Mensagem enviada!');
      } else {
        toast.error('Erro ao enviar mensagem');
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

  return (
    <div className="h-screen w-full bg-transparent flex flex-col overflow-hidden">
      <div className="h-full w-full bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent rounded-t-xl">
          <AnimatePresence>
            {messages.map((message) => {
              const isUser = isCurrentUser(message.autorId);
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex max-w-[85%]",
                    isUser ? "ml-auto" : "mr-auto"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm break-words shadow-lg",
                      isUser
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-700/80 text-gray-100 rounded-bl-sm"
                    )}
                  >
                    {!isUser && (
                      <p className="text-xs font-semibold mb-1 opacity-80">
                        {message.autor.name}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{message.conteudo}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-700/50 p-4 bg-gray-800/40 backdrop-blur-sm rounded-b-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="Digite sua mensagem..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm"
            />
            <Button 
              type="submit" 
              disabled={!inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:shadow-blue-500/25"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;