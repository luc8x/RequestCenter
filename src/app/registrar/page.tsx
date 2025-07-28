"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";;
import { registerSchema } from "@/schemas/authSchema";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from 'next/image'

// Componentes
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import ParticulasDotsBackground from "@/components/TSparticulasBackground";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Icons
import { LoaderCircle } from 'lucide-react';
import { UserPlus } from 'lucide-react';
import { DoorOpen } from 'lucide-react';

type FormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState("")

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(registerSchema) })

    const onSubmit = async (data: FormData) => {
        setError("")

        const res = await fetch("/api/registra", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        })

        if (res.ok) {
            router.push("/login")
        } else {
            const err = await res.json()
            setError(err.message || "Erro ao registrar")
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <ParticulasDotsBackground />
            <div className="bg-white/10 backdrop-blur rounded-lg shadow-lg p-6 border border-white text-white">
                <div className="flex justify-between mb-2">
                    <h1 className="text-3xl font-semibold">Cadastrar-se</h1>
                    <a href="/login" className="text-sm flex gap-2 items-center"><DoorOpen size={15} />Login</a>
                </div>
                <p className="mb-4 text-sm text-white">Insira as informações abaixo para criar sua conta.</p>
                <div className="mb-5 flex justify-between gap-2">
                    <Button type="submit" variant={"secondary"} disabled={isSubmitting} className="btn btn-primary w-45">
                        <Image alt="Google" src={'/google.png'} width={20} height={20} />Google
                    </Button>
                    <Button type="submit" variant={"secondary"} disabled={isSubmitting} className="btn btn-primary w-45">
                        <Image alt="Github" src={'/github.png'} width={20} height={20} />Github
                    </Button>
                </div>
                <div className="flex">
                    <div className="inset-0 flex items-center">
                        <span className="w-30 border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="btext-white px-2">Ou continue com</span>
                    </div>
                    <div className="inset-0 flex items-center">
                        <span className="w-30 border-t"></span>
                    </div>
                </div>
                <div className="mt-5">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <fieldset className="flex flex-col gap-2">
                            <Label>Nome Completo</Label>
                            <Input type="text" {...register("name")} className="input" required placeholder="Nome completo" />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </fieldset>

                        <fieldset className="flex flex-col gap-2">
                            <Label>Email</Label>
                            <Input type="email" {...register("email")} className="input" required placeholder="exemplo@exemplo.com" />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </fieldset>

                        <fieldset className="flex flex-col gap-2">
                            <Label>Permissões</Label>
                            <Select name="permissao">
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione sua permissão" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SOLICITANTE">Solicitante</SelectItem>
                                    <SelectItem value="ATENDENTE">Atendente</SelectItem>
                                </SelectContent>
                            </Select>
                        </fieldset>

                        <fieldset className="flex flex-col gap-2">
                            <Label>Senha</Label>
                            <Input type="password" {...register("password")} className="input" required placeholder="Senha" />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </fieldset>

                        <p className="text-red-500 text-sm">{error}</p>

                        <Button type="submit" variant={"secondary"} disabled={isSubmitting} className="btn btn-primary w-full">
                            {isSubmitting ? (<> <LoaderCircle className="animate-spin" /> Registrando... </>) : (<> <UserPlus /> Criar Conta</>)}
                        </Button>
                    </form>
                </div>

            </div>
        </div>
    )
}