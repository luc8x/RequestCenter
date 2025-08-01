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
import { motion } from "framer-motion";

dayjs.locale("pt-br");

export default function ChatPage() {
  const params = useParams();
  const solicitacaoId = params.id;
  const { data: session } = useSession();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loadingMensagens, setLoadingMensagens] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMensagens = async () => {
      try {
        setLoadingMensagens(true);
        const res = await fetch(`/api/solicitacao/chat/${solicitacaoId}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMensagens(data);
      } catch (err) {
        console.error("Erro ao buscar mensagens", err);
      } finally {
        setLoadingMensagens(false);
      }
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
    <div className={`grid gap-6 grid-cols-[2fr_2fr] text-gray-100`}>
      <section className='flex flex-col gap-4 col-span-1'>
        <Card className="flex flex-col h-[85vh]">
          <CardHeader className="px-4 pt-4 pb-2 border-b border-blue-400">
            <CardTitle className="text-lg font-semibold text-blue-400">
              Chat #{solicitacaoId}
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
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
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
                        <AvatarImage src={msg.autor?.avatar} />
                        <AvatarFallback className="bg-blue-800 text-white text-xs">
                          {msg.autor?.name?.slice(0, 2)?.toUpperCase() ?? "US"}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <motion.div
                      layout
                      className={cn(
                        "rounded-2xl px-4 py-3 max-w-xs w-full shadow-md space-y-2 flex flex-col",
                        isSelf ? "bg-blue-600" : "bg-gray-700"
                      )}
                    >
                      <div className="text-sm font-semibold leading-none">{msg.autor.name}</div>
                      <div className="text-sm whitespace-pre-wrap leading-snug">{msg.conteudo}</div>
                      <div
                        className="text-end font-semibold text-xs opacity-60"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {hora}
                      </div>
                    </motion.div>

                    {isSelf && (
                      <div className="w-10 h-10 rounded-full bg-gray-600 shadow-md" />
                    )}
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
            >
              <Input
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 text-white placeholder:text-gray-400/70 border-ring-700 focus:ring-gray-400 focus:border-ring-400"
              />
              <Button type="submit" variant="secondary">
                <Send />
                Enviar
              </Button>
            </form>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
