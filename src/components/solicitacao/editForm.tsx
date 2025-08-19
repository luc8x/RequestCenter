import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { BadgePlus, LoaderCircle, X, Image as ImageIcon, Trash2 } from "lucide-react";

type FormValues = {
  assunto: string;
  descricao: string;
  arquivos: FileList;
};

export function EditSolicitacaoForm({ solicitacao, onClose }: { solicitacao: Solicitacao; onClose: () => void }) {
  const [arquivosExistentes, setArquivosExistentes] = useState<{
    id: number;
    arquivoUrl: string;
    arquivoNome: string;
    analiseIA: string;
  }[]>([]);
  const [novoArquivos, setNovoArquivos] = useState<File[]>([]);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      assunto: solicitacao.assunto,
      descricao: solicitacao.descricao,
    },
  });

  React.useEffect(() => {
    const carregarArquivos = async () => {
      try {
        const res = await fetch(`/api/solicitacao/${solicitacao.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.arquivos) {
            setArquivosExistentes(data.arquivos);
          } else if (data.arquivoUrl) {
            setArquivosExistentes([{
              id: 0,
              arquivoUrl: data.arquivoUrl,
              arquivoNome: data.arquivoNome,
              analiseIA: data.analiseIA
            }]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar arquivos:", error);
      }
    };
    
    carregarArquivos();
    
    reset({
      assunto: solicitacao.assunto,
      descricao: solicitacao.descricao,
    });
  }, [solicitacao, reset]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Verificar se não excede o limite de 5 arquivos no total
      if (arquivosExistentes.length + novoArquivos.length + files.length > 5) {
        toast.error("Máximo de 5 imagens permitidas no total.");
        return;
      }
      
      // Verificar se todos são imagens
      const todosImagens = files.every(file => file.type.startsWith("image/"));
      if (!todosImagens) {
        toast.error("Apenas imagens são permitidas.");
        return;
      }
      
      setNovoArquivos(prev => [...prev, ...files]);
    }
  };
  
  const removerNovoArquivo = (index: number) => {
    setNovoArquivos(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData();
      formData.append("assunto", data.assunto);
      formData.append("descricao", data.descricao);
      
      // Adicionar novos arquivos
      novoArquivos.forEach(arquivo => {
        formData.append("arquivo", arquivo);
      });
      
      const res = await fetch(`/api/solicitacao/${solicitacao.id}`, {
        method: "PATCH",
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erro ao atualizar solicitação");
        return;
      }
      
      toast.success("Solicitação atualizada.");
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      toast.error("Erro na comunicação com o servidor.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-blue-500">Editar Solicitação</DialogTitle>
      </DialogHeader>

      <fieldset className="flex flex-col gap-2">
        <Label htmlFor="assunto">Assunto</Label>
        <Input
          id="assunto"
          {...register("assunto", { required: "Assunto é obrigatório" })}
          placeholder="Assunto da solicitação"
          aria-invalid={errors.assunto ? "true" : "false"}
        />
        {errors.assunto && <p className="text-red-500 text-sm">{errors.assunto.message}</p>}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          {...register("descricao", { required: "Descrição é obrigatória" })}
          placeholder="Descreva a solicitação"
          aria-invalid={errors.descricao ? "true" : "false"}
        />
        {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao.message}</p>}
      </fieldset>
      
      {/* Exibir arquivos existentes */}
      {arquivosExistentes.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <Label>Imagens existentes</Label>
          <div className="grid grid-cols-2 gap-2">
            {arquivosExistentes.map((arquivo, index) => (
              <div key={arquivo.id || index} className="relative border border-gray-700 rounded-md p-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-sm truncate">{arquivo.arquivoNome}</span>
                </div>
                <a 
                  href={arquivo.arquivoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline"
                >
                  Visualizar
                </a>
              </div>
            ))}
          </div>
        </fieldset>
      )}
      
      {novoArquivos.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <Label>Novas imagens</Label>
          <div className="grid grid-cols-2 gap-2">
            {novoArquivos.map((arquivo, index) => (
              <div key={index} className="relative border border-gray-700 rounded-md p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-400" />
                    <span className="text-sm truncate">{arquivo.name}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removerNovoArquivo(index)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      )}
      
      <fieldset className="flex flex-col gap-2">
        <Label htmlFor="arquivos">Adicionar imagens (máx. 5 no total)</Label>
        <Input
          id="arquivos"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={arquivosExistentes.length + novoArquivos.length >= 5}
        />
        <p className="text-xs text-gray-400">
          {5 - arquivosExistentes.length - novoArquivos.length} imagens restantes
        </p>
      </fieldset>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">
            <X />
            Fechar
          </Button>
        </DialogClose>
        <Button type="submit" variant="secondary" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoaderCircle className="animate-spin w-4 h-4 mr-1" /> Atualizando...
            </>
          ) : (
            <>
              <BadgePlus className="w-4 h-4 mr-1" /> Salvar
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
