import { Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import { Buffer } from "buffer";
import path from "path";
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";
import { GoogleGenerativeAI } from "@google/generative-ai";

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Starting worker...');

async function gerarConteudoComRetry(model, prompt, inlineData, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const result = await model.generateContent([{ text: prompt.trim() }, { inlineData }]);
      return result;
    } catch (err) {
      console.error(`Tentativa ${i+1} falhou:`, err);
      if ((err.status === 503 || err.message.includes('503')) && i < tentativas - 1) {
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`Aguardando ${waitTime}ms antes de tentar novamente...`);
        await new Promise((res) => setTimeout(res, waitTime));
        continue;
      }
      throw err;
    }
  }
}

async function processarArquivo(arquivo) {
  if (!arquivo || arquivo.buffer.length === 0 || !arquivo.type.startsWith("image/")) {
    throw new Error("Arquivo inválido. Apenas imagens são aceitas.");
  }

  const ext = path.extname(arquivo.name).slice(1).toLowerCase() || 'png';
  const nomeArquivo = `${uuid()}.${ext}`;
  const caminho = path.join(process.cwd(), "public", "uploads", "solicitacoes", nomeArquivo);

  await writeFile(caminho, arquivo.buffer);
  const imageBase64 = arquivo.buffer.toString("base64");

  const prompt = `
Você é um assistente especializado em inspeção de qualidade de produtos.
Analise a imagem enviada, identifique possíveis defeitos, danos ou irregularidades no produto
e descreva-os de forma detalhada e em português.
Se possível, sugira a causa provável do problema e classifique como estético ou funcional.
`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("Gerando análise com IA...");
    const result = await gerarConteudoComRetry(model, prompt, { mimeType: arquivo.type, data: imageBase64 });
    return {
      nomeArquivo,
      urlArquivo: `/uploads/solicitacoes/${nomeArquivo}`,
      resultado: result.response.text(),
    };
  } catch (error) {
    console.error("Erro ao gerar análise com IA:", error);
    return {
      nomeArquivo,
      urlArquivo: `/uploads/solicitacoes/${nomeArquivo}`,
      resultado: "Análise temporariamente indisponível. Tente novamente mais tarde.",
    };
  }
}

try {
  const redisConnection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null
  });

  const prisma = new PrismaClient();

  const worker = new Worker(
    "analise-imagens",
    async job => {
      try {
        console.log(`Processando job ${job.id}...`);
        console.log(`Dados do job:`, JSON.stringify(job.data, null, 2));
        const { arquivoId, arquivoNome, arquivoBuffer, arquivoType = "image/png" } = job.data;
        console.log(`Arquivo ${arquivoNome} recebido com tipo: ${arquivoType}`);
        const buffer = Buffer.from(arquivoBuffer, "base64");
        const arquivoFake = {
          buffer,
          name: arquivoNome,
          type: arquivoType
        };
        
        console.log(`Processando arquivo ${arquivoNome}...`);
        const resultado = await processarArquivo(arquivoFake);
        
        console.log(`Atualizando registro no banco de dados...`);
        await prisma.arquivoSolicitacao.update({
          where: { id: arquivoId },
          data: { analiseIA: resultado.resultado }
        });
        
        console.log(`Arquivo ${arquivoNome} processado com sucesso.`);
        return { success: true };
      } catch (error) {
        console.error(`Erro ao processar job:`, error);
        throw error;
      }
    },
    { connection: redisConnection }
  );

  worker.on("completed", job => console.log(`Job ${job.id} concluído.`));
  worker.on("failed", (job, err) => console.error(`Job ${job.id} falhou:`, err));
  
  console.log('Worker initialized successfully');
} catch (error) {
  console.error('Error initializing worker:', error);
}