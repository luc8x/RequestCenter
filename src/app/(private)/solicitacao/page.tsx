"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";;
import { createSolicitacaoSchema } from "@/schemas/solicitacaoSchema";
import { z } from "zod";
import { toast } from "sonner"
import { useEffect, useState } from "react";

// Componentes
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/solicitacoes/minhasSolicitacoes/data-table";
import { columns, Solicitacao } from "@/components/solicitacoes/minhasSolicitacoes/columns"

// Icons
import { LoaderCircle } from 'lucide-react';
import { BadgePlus } from 'lucide-react';

type FormData = z.infer<typeof createSolicitacaoSchema>

export default function SolicitacaoPage() {
    const [data, setData] = useState<Solicitacao[]>([]);
    const [error, setError] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(createSolicitacaoSchema),
    });

    const fetchSolicitacoes = async () => {
        const res = await fetch("/api/solicitacoes/minhasSolicitacoes");
        const json = await res.json();
        setData(json);
    };

    useEffect(() => {
        fetchSolicitacoes();
    }, []);

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/solicitacoes/${id}`, { method: "DELETE" });
        if (res.ok) {
            setData((prev) => prev.filter((item) => item.id !== id));
            toast.success("Solicitação deletada.");
        } else {
            toast.error("Ocorreu algum erro ao deletar.");
        }
    };

    const onSubmit = async (formData: FormData) => {
        setError("");

        const res = await fetch("/api/solicitacoes/createSolicitacao", {
            method: "POST",
            body: JSON.stringify(formData),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            reset();
            fetchSolicitacoes();
            toast.success("Solicitação cadastrada.");
        } else {
            const err = await res.json();
            toast.error(err.message || "Ocorreu algum erro ao cadastrar.");
        }
    };

    return (
        <div className="grid gap-4 grid-cols-2 justify-center">
            <div>
                <div className="bg-white rounded-lg shadow-lg p-6 border border-accent-foreground">
                    <div className="flex justify-between mb-2">
                        <h1 className="text-3xl font-semibold">Cadastrar Solicitação</h1>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <fieldset className="flex flex-col gap-2">
                            <Label>Assunto</Label>
                            <Input type="text" {...register("assunto")} className="input" required placeholder="Assunto da solicitação" />
                            {errors.assunto && <p className="text-red-500 text-sm">{errors.assunto.message}</p>}
                        </fieldset>

                        <fieldset className="flex flex-col gap-2">
                            <Label>Descrição</Label>
                            <Textarea {...register("descricao")} required placeholder="Descreva a solicitação" />
                            {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao.message}</p>}
                        </fieldset>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <Button type="submit" variant={"secondary"} disabled={isSubmitting} className="btn btn-primary w-full">
                            {isSubmitting ? (<> <LoaderCircle /> Registrando... </>) : (<> <BadgePlus /> Cadastrar Solicitação</>)}
                        </Button>
                    </form>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border border-accent-foreground">
                <div className="flex flex-col justify-between mb-2">
                    <h1 className="text-3xl font-semibold">Minhas Solicitações</h1>
                    <p className="text-sm text-gray-500">Todas as suas solicitações apareceram abaixo.</p>
                </div>
                <DataTable columns={columns(handleDelete)} data={data} />
            </div>
        </div>
    );
}
