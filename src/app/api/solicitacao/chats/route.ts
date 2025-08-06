import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const chats = await prisma.solicitacao.findMany({
      where: {
        mensagens: {
          some: {},
        },
      },
      select: {
        id: true,
        assunto: true,
        mensagens: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            conteudo: true,
            arquivoNome: true,
            autor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const mensagens = chats.map((chat) => {
      const ultima = chat.mensagens[0];
      return {
        id: chat.id,
        assunto: chat.assunto,
        name: ultima.autor.name,
        mensagem: ultima.conteudo || ultima.arquivoNome,
        avatar: "https://github.com/shadcn.png",
      };
    });

    return NextResponse.json(mensagens);
  } catch (error) {
    console.error("[GET_CHAT_LIST]", error);
    return NextResponse.json({ error: "Erro ao buscar mensagens" }, { status: 500 });
  }
}
