// src/app/api/minhas-solicitacoes/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  try {
    const solicitacoes = await prisma.solicitacao.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        assunto: true,
        prioridade: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(solicitacoes, { status: 200 });
  } catch (err) {
    console.error("Erro ao buscar solicitações:", err);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
