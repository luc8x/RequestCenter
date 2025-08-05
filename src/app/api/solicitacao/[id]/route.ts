import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const solicitacaoAtual = await prisma.solicitacao.findUnique({ where: { id } });
  if (!solicitacaoAtual) {
    return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
  }

  const userId = session.user.id;

  if (solicitacaoAtual.userId !== userId) {
    return NextResponse.json({ error: "Sem permissão para deletar" }, { status: 403 });
  }

  try {
    await prisma.solicitacao.delete({ where: { id } });
    return NextResponse.json({ message: "Solicitação deletada com sucesso" });
  } catch {
    return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const id = Number(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const solicitacao = await prisma.solicitacao.findUnique({
    where: { id },
    include: {
      user: true,
      atendente: true,
    },
  });

  if (!solicitacao) {
    return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
  }

  const userId = session.user.id;
  const permissao = session.user.permissao;

  console.log(solicitacao)

if (solicitacao.userId !== userId && solicitacao.atendenteId !== userId && permissao !== "ATENDENTE") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  return NextResponse.json(solicitacao);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { pathname } = req.nextUrl;
  const idString = pathname.split("/").pop();
  const id = Number(idString);

  if (isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const data = await req.json();
  const { assunto, descricao, prioridade, status, atendenteId } = data;

  const prioridadesValidas = ["BAIXA", "MEDIA", "ALTA", "CRITICA", "NAO_INFORMADA"];
  const statusValidos = ["ABERTA", "EM_ATENDIMENTO", "FINALIZADA", "CANCELADA"];

  if (
    prioridade && !prioridadesValidas.includes(prioridade) ||
    status && !statusValidos.includes(status)
  ) {
    return NextResponse.json({ error: "Dados inválidos para prioridade ou status" }, { status: 400 });
  }

  const solicitacaoAtual = await prisma.solicitacao.findUnique({ where: { id } });
  if (!solicitacaoAtual) {
    return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
  }

  const userId = session.user.id;
  const permissao = session.user.permissao;

  if (
    (assunto || descricao) && solicitacaoAtual.userId !== userId
  ) {
    return NextResponse.json({ error: "Somente o solicitante pode alterar esses campos" }, { status: 403 });
  }

  if (
    (status || atendenteId || prioridade) && permissao !== "ATENDENTE"
  ) {
    return NextResponse.json({ error: "Somente atendente pode alterar status, prioridade ou assumir solicitação" }, { status: 403 });
  }

  try {
    const atualizado = await prisma.solicitacao.update({
      where: { id },
      data: {
        ...(assunto && { assunto }),
        ...(descricao && { descricao }),
        ...(prioridade && { prioridade }),
        ...(status && { status }),
        ...(atendenteId && { atendenteId }),
      },
    });

    return NextResponse.json(atualizado);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
