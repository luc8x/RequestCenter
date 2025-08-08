"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { io, Socket } from "socket.io-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import "dayjs/locale/pt-br";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image, File } from 'lucide-react';

export default function ChatRecentes() {
    const [loadingChat, setLoadingChat] = useState(true);
    const [dataChat, setDataChat] = useState([]);
    const socketRef = useRef<Socket | null>(null);

    const fetchChats = useCallback(async () => {
        try {
            setLoadingChat(true);

            const res = await fetch("/api/solicitacao/chats", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) throw new Error();

            const json = await res.json();
            console.log("Dados recebidos do backend:", json);
            setDataChat(json);
        } catch {
            toast.error("Erro ao buscar chats.");
        } finally {
            setLoadingChat(false);
        }
    }, []);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    useEffect(() => {
        const socket = io("http://localhost:3001", { path: "/api/socket_io" });
        socketRef.current = socket;

        socket.emit("solicitacoes");

        socket.on("nova_mensagem", () => {
            fetchChats();
        });

        return () => socket.disconnect();
    }, [fetchChats]);

    return (
        <section>
            {loadingChat ? (
                <Card>
                    <h3 className="font-semibold mb-4 text-blue-400">Chats em Andamento</h3>
                    <div className="flex flex-col gap-5">
                        <div className="max-h-80 overflow-auto flex flex-col gap-4 pr-1">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-xl p-4 bg-gray-700 animate-pulse flex justify-between items-start"
                                >
                                    <div className="space-y-2 w-full">
                                        <div className="h-4 bg-gray-500 rounded w-1/3" />
                                        <div className="h-3 bg-gray-600 rounded w-1/2" />
                                        <div className="h-3 bg-gray-600 rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

            ) : dataChat.length > 0 ? (
                <Card>
                    <h3 className="font-semibold mb-4 text-blue-400">Chats em Andamento</h3>
                    <ScrollArea className="max-h-80 rounded-md flex flex-col">
                        {dataChat.map((item) => (
                            <div key={item.id} className="flex flex-col gap-5 rounded-xl p-4 bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer mb-4">
                                <a
                                    key={item.id}
                                    href={`/chat/${item.id}/`}
                                    className="flex items-start gap-2 flex-col"
                                >
                                    <span><strong>{item.assunto}</strong></span>
                                    <div className="flex gap-4">
                                        <Avatar className="w-9 h-9">
                                            <AvatarImage src={item?.avatar ?? "/avatar-placeholder.png"} />
                                            <AvatarFallback className="text-black">
                                                {item.name?.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col leading-7">
                                            <span className="font-medium">{item.name}</span>
                                                <div className="flex gap-1.5 items-center">
                                                    {item.tipo && (
                                                        <span className="text-sm text-gray-400">
                                                            {item.tipo == 1 ? (
                                                                <Image size={16} />

                                                            ) : item.tipo == 2 ? (
                                                                <File size={16} />
                                                            ) : (
                                                                ''
                                                            )}
                                                        </span>
                                                    )}
                                                    <span className="text-sm text-gray-400">{item.mensagem}</span>
                                                </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </ScrollArea>
                </Card>
            ) : (
                <Card>
                    <h3 className="font-semibold mb-4 text-blue-400">Chat recente</h3>
                    <div className="max-h-80 overflow-auto flex flex-col gap-4 pr-1">
                        <p className="text-gray-400 text-sm">Nenhum chat em andamento.</p>
                    </div>
                </Card>
            )}

        </section>
    );
}
