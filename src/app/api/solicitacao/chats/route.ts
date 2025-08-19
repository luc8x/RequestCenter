import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";

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
      let tipoMensagem = null

      if (ultima && !ultima.conteudo) {
        if (
          ultima.arquivoNome &&
          /\.(png|jpe?g)$/i.test(ultima.arquivoNome)
        ) {
          tipoMensagem = 1
        } else if (
          ultima.arquivoNome &&
          /\.(pdf|docx|doc)$/i.test(ultima.arquivoNome)
        ) {
          tipoMensagem = 2
        }
      }

      return {
        id: chat.id,
        assunto: chat.assunto,
        name: ultima.autor.name,
        mensagem: ultima.conteudo || ultima.arquivoNome,
        tipo: tipoMensagem,
        avatar: "",
      };
    });

    return NextResponse.json(mensagens);
  } catch (error) {
    console.error("[GET_CHAT_LIST]", error);
    return NextResponse.json({ error: "Erro ao buscar mensagens" }, { status: 500 });
  }
}
