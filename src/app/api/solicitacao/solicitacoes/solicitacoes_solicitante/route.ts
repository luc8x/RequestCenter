import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.permissao !== "SOLICITANTE") {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 403 }
    );
  }

  const contentType = req.headers.get("content-type");
  if (!contentType?.startsWith("multipart/form-data")) {
    return NextResponse.json(
      { error: "Tipo de conteúdo inválido" },
      { status: 400 }
    );
  }

  const formData = await req.formData();
  const assunto = (formData.get("assunto") as string)?.trim();
  const descricao = (formData.get("descricao") as string)?.trim();

  console.log('form: ',formData)
  
  if (!assunto || !descricao) {
    return NextResponse.json(
      { error: "Assunto e descrição são obrigatórios" },
      { status: 400 }
    );
  }
  
  const arquivos = formData.getAll("arquivo");
  const arquivo = arquivos[0];
  let arquivoUrl: string | null = null;
  let arquivoNome: string | null = null;

  if (arquivo && arquivo.size > 0) {
    if (!arquivo.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas." }, { status: 400 });
    }
    
    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const ext = path.extname(arquivo.name);
    const nomeArquivo = `${uuid()}${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", "solicitacoes");
    
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    await writeFile(`${uploadPath}/${nomeArquivo}`, buffer);

    arquivoUrl = `/uploads/solicitacoes/${nomeArquivo}`;
    arquivoNome = arquivo.name;
  }

  console.log(arquivoNome, arquivoUrl)
  const novaSolicitacao = await prisma.solicitacao.create({
    data: {
      assunto,
      descricao,
      userId: session.user.id,
      arquivoUrl,
      arquivoNome,
    },
  });

  return NextResponse.json(novaSolicitacao, { status: 201 });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const fieldsParam = req.nextUrl.searchParams.get("fields");
  const fields = fieldsParam?.split(",") ?? [];

  const select = fields.reduce((acc, field) => {
    acc[field] = true;
    return acc;
  }, {} as Record<string, boolean>);

  if (fields.length === 0) {
    return NextResponse.json({ error: "Nenhum campo solicitado." }, { status: 400 });
  }

  const solicitacoes = await prisma.solicitacao.findMany({
    where: { userId: session.user.id },
    select
  });

  return NextResponse.json(solicitacoes);
}
