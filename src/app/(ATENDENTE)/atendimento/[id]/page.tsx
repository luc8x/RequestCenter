"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { Send } from 'lucide-react';
import { useParams } from "next/navigation";
import { NextResponse } from "next/server";

dayjs.locale("pt-br");

export default function ChatPage() {
  const params = useParams();
  const solicitacaoId = params.id;
  const { data: session } = useSession();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMensagens = async () => {
        const res = await fetch(`/api/solicitacao/chat/${solicitacaoId}`);
        console.log(res)
        const data = await res.json();
        setMensagens(data);
    };
    fetchMensagens();
  }, [solicitacaoId]);


  const handleEnviar = async () => {
    if (!input.trim()) return;

    const nova = {
      conteudo: input,
      autorId: session?.user?.id,
      solicitacaoId,
    };

    const res = await fetch(`/api/solicitacao/chat/${solicitacaoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nova),
    });

    if (res.ok) {
      const msgSalva = await res.json();
      setMensagens((prev) => [...prev, msgSalva]);
      setInput("");
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <Card className="flex flex-col h-[85vh]">
      <CardHeader className="px-4 pt-4 pb-2 border-b border-blue-400">
        <CardTitle className="text-lg font-semibold text-blue-400">
          Atendimento #{solicitacaoId}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-5 py-6 px-4">
        {Array.isArray(mensagens) ? (
  mensagens.map((msg) => {
    const isSelf = msg.autorId === session?.user?.id;
    const hora = dayjs(msg.createdAt).format("HH:mm");

    return (
      <div
        key={msg.id}
        className={cn(
          "flex items-end gap-2",
          isSelf ? "justify-end" : "justify-start"
        )}
      >
        {!isSelf && (
          <Avatar className="w-8 h-8 ring-1 ring-blue-400">
            <AvatarImage src={msg.autor?.avatar} />
            <AvatarFallback className="bg-blue-800 text-white text-xs">
              {msg.autor?.name?.slice(0, 2)?.toUpperCase() ?? "US"}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2 max-w-sm shadow-md relative group transition-all duration-200",
            isSelf ? "bg-blue-400 text-white" : "bg-blue-100 text-blue-900"
          )}
        >
          <div className="text-sm whitespace-pre-wrap">{msg.conteudo}</div>
          <span
            className={cn(
              "absolute text-xs text-blue-300",
              isSelf ? "bottom-[-16px] right-2" : "bottom-[-16px] left-2"
            )}
          >
            {hora}
          </span>
        </div>
      </div>
    );
  })
) : (
  <p>Nenhuma mensagem encontrada.</p>
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
        >
          <Input
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 text-white placeholder:text-gray-400/70 border-ring-700 focus:ring-gray-400 focus:border-ring-400"
          />
          <Button
            type="submit"
            variant={"secondary"}
          >
            <Send />
            Enviar
          </Button>
        </form>
      </CardFooter>
    </Card>

  );
}
