import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let solicitacoes;
  if (session.user.permissao === "SOLICITANTE") {
    solicitacoes = await prisma.solicitacao.findMany({
      where: { userId: session.user.id },
      include: {
        mensagens: {
          orderBy: { createdAt: 'asc' },
          include: { autor: true }
        },
        atendente: true
      }
    })
  }

  return NextResponse.json(solicitacoes);
}