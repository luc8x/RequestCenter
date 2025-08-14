import path from "path";
import { writeFile } from "fs/promises";
import { v4 as uuid } from "uuid";
import pLimit from "p-limit";
import { GenerativeModel, GenerateContentResult } from "@google/generative-ai";

interface InlineData {
  mimeType: string;
  data: string;
}

async function gerarConteudoComRetry(
  model: GenerativeModel,
  prompt: string,
  inlineData: InlineData,
  tentativas: number = 3,
  backoffBaseMs: number = 1000
): Promise<GenerateContentResult> {
  let ultimaErro: any;

  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      const result = await model.generateContent([
        { text: prompt.trim() },
        { inlineData }
      ]);
      return result;
    } catch (err: any) {
      ultimaErro = err;
      const isUltimaTentativa = tentativa === tentativas;
      const erroTemporario = err?.status === 503;

      console.warn(
        `[Gemini] Erro na tentativa ${tentativa}/${tentativas}:`,
        err?.message || err
      );

      if (!erroTemporario || isUltimaTentativa) break;

      const delay = Math.pow(2, tentativa - 1) * backoffBaseMs;
      const jitter = Math.floor(Math.random() * 200);
      await new Promise((res) => setTimeout(res, delay + jitter));
    }
  }

  throw new Error(
    `[Gemini] Falha após ${tentativas} tentativas: ${ultimaErro?.message || ultimaErro}`
  );
}

export async function processarArquivo(
  model: GenerativeModel,
  arquivo: { buffer: Buffer; name: string; type: string }
) {
  if (!arquivo || arquivo.buffer.length === 0 || !arquivo.type.startsWith("image/")) {
    throw new Error("Arquivo inválido. Apenas imagens são aceitas.");
  }

  const ext = path.extname(arquivo.name).slice(1).toLowerCase();
  const nomeArquivo = `${uuid()}.${ext}`;
  const caminho = path.join(process.cwd(), "public", "uploads", "solicitacoes", nomeArquivo);

  await writeFile(caminho, arquivo.buffer);

  const imageBase64 = arquivo.buffer.toString("base64");

const prompt = `
Você é um especialista em inspeção de qualidade de produtos.
Analise cuidadosamente a imagem fornecida e identifique, se houver:
- Defeitos, danos ou irregularidades visíveis
- Possível causa provável
- Classificação: estético ou funcional

Responda em português, de forma clara e objetiva, com no máximo 500 caracteres.
Se não identificar problemas, responda exatamente: "Nenhum defeito encontrado".
`;

  try {
    const result = await gerarConteudoComRetry(model, prompt, {
      mimeType: arquivo.type,
      data: imageBase64
    });

    return {
      nomeArquivo,
      urlArquivo: `/uploads/solicitacoes/${nomeArquivo}`,
      resultado: result.response.text(),
    };
  } catch {
    return {
      nomeArquivo,
      urlArquivo: `/uploads/solicitacoes/${nomeArquivo}`,
      resultado: "Análise temporariamente indisponível. Tente novamente mais tarde.",
    };
  }
}

export async function processarMultiplosArquivos(
  model: GenerativeModel,
  arquivos: { buffer: Buffer; name: string; type: string }[]
) {
  const limit = pLimit(2);
  return Promise.all(
    arquivos
      .filter((a) => a && a.buffer.length > 0 && a.type.startsWith("image/"))
      .map((arquivo) => limit(() => processarArquivo(model, arquivo)))
  );
}
