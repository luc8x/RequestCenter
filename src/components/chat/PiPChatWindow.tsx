"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, X } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

interface Message {
  id: number;
  conteudo: string;
  dataEnvio: string;
  remetente: {
    id: number;
    nome: string;
    tipo: string;
  };
}

interface PiPChatWindowProps {
  solicitacaoId: string;
  userId: number;
  userName: string;
  userType: string;
  onClose: () => void;
}

export default function PiPChatWindow({ 
  solicitacaoId, 
  userId, 
  userType, 
  onClose 
}: PiPChatWindowProps) {
  const [mensagens, setMensagens] = useState<Message[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carregarMensagens = async () => {
      try {
        const response = await fetch(`/api/chat/${solicitacaoId}/mensagens`);
        if (response.ok) {
          const data = await response.json();
          setMensagens(data);
        }
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      }
    };

    carregarMensagens();
  }, [solicitacaoId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/${solicitacaoId}/mensagens`);
        if (response.ok) {
          const data = await response.json();
          setMensagens(data);
        }
      } catch (error) {
        console.error("Erro ao atualizar mensagens:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [solicitacaoId]);

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/${solicitacaoId}/mensagens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conteudo: novaMensagem,
          remetenteId: userId,
        }),
      });

      if (response.ok) {
        const novaMensagemData = await response.json();
        setMensagens(prev => [...prev, novaMensagemData]);
        setNovaMensagem("");
        toast.success("Mensagem enviada!");
      } else {
        throw new Error("Falha ao enviar mensagem");
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
      <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-lg font-semibold">Chat PiP - Solicitação #{solicitacaoId}</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.map((mensagem) => {
          const isUser = mensagem.remetente.tipo === userType;
          return (
            <div
              key={mensagem.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-gray-600">
                      {mensagem.remetente.nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs opacity-75">
                    {mensagem.remetente.nome}
                  </span>
                </div>
                <p className="text-sm">{mensagem.conteudo}</p>
                <span className="text-xs opacity-60 mt-1 block">
                  {dayjs(mensagem.dataEnvio).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <form onSubmit={enviarMensagem} className="flex gap-2">
          <Input
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!novaMensagem.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}