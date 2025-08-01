import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getIO } from "@/lib/socket";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await context.params;
    const solicitacaoId = Number(id);
    if (isNaN(solicitacaoId))
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const mensagens = await prisma.mensagem.findMany({
      where: { solicitacaoId: solicitacaoId },
      orderBy: { createdAt: "asc" },
      include: {
        autor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(mensagens);

  } catch (err) {
    console.error("Erro no GET /api/solicitacao/chat/:id", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await context.params;
  const solicitacaoId = Number(id);
  if (isNaN(solicitacaoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const { conteudo } = await request.json();
  if (!conteudo || typeof conteudo !== "string" || conteudo.trim() === "")
    return NextResponse.json({ error: "Conteúdo inválido" }, { status: 400 });

  const novaMensagem = await prisma.mensagem.create({
    data: {
      conteudo: conteudo.trim(),
      autorId: session.user.id,
      solicitacaoId,
    },
    include: {
      autor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const io = getIO();
  io.to(String(solicitacaoId)).emit("nova_mensagem", novaMensagem);

  return NextResponse.json(novaMensagem);
}