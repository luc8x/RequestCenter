import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import React from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { BadgePlus, LoaderCircle } from "lucide-react";

type FormValues = {
  assunto: string;
  descricao: string;
};

export function EditSolicitacaoForm({ solicitacao, onClose }: { solicitacao: Solicitacao; onClose: () => void }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      assunto: solicitacao.assunto,
      descricao: solicitacao.descricao,
    },
  });

  React.useEffect(() => {
    reset({
      assunto: solicitacao.assunto,
      descricao: solicitacao.descricao,
    });
  }, [solicitacao, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch(`/api/solicitacao/${solicitacao.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erro ao atualizar solicitação");
        return;
      }
      toast.success("Solicitação atualizada.");
      onClose();
    } catch {
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

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
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
