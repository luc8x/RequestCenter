import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.permissao !== "SOLICITANTE") {
    return NextResponse.json({ error: `Vocé não está autorizado. ${session.user.permissao}` }, { status: 403 });
  }

  const { assunto, descricao, prioridade } = await req.json();

  if (!assunto || !descricao) {
    return NextResponse.json({ error: "Assunto e descrição são obrigatórios" }, { status: 400 });
  }

  // Validação enum Prioridade
  const prioridadesValidas = ["BAIXA", "MEDIA", "ALTA", "CRITICA", "NAO_INFORMADA"];
  if (prioridade && !prioridadesValidas.includes(prioridade)) {
    return NextResponse.json({ error: "Prioridade inválida" }, { status: 400 });
  }

  const novaSolicitacao = await prisma.solicitacao.create({
    data: {
      assunto,
      descricao,
      prioridade: prioridade ?? "NAO_INFORMADA",
      userId: session.user.id,
    },
  });

  return NextResponse.json(novaSolicitacao, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Para solicitante, lista só as próprias solicitações
  // Para atendente, pode listar todas ou só as atribuídas
  // Aqui exemplo simples: lista todas para atendente, só as próprias para solicitante

  const userId = session.user.id;
  const userPermissao = session.user.permissao; // suposição que veio no session

  let solicitacoes;

  if (userPermissao === "ATENDENTE") {
    solicitacoes = await prisma.solicitacao.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        atendente: true,
      },
    });
  } else {
    solicitacoes = await prisma.solicitacao.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        atendente: true,
      },
    });
  }

  return NextResponse.json(solicitacoes);
}