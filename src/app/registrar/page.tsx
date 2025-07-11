"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";;
import { registerSchema } from "@/schemas/authSchema";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Componentes
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';

// Icons
import { LoaderCircle } from 'lucide-react';

type FormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState("")

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(registerSchema) })

    const onSubmit = async (data: FormData) => {
        setError("")

        const res = await fetch("/api/auth/regista", {
            method: "POST",
            body: JSON.stringify(data),
        })

        if (res.ok) {
            router.push("/login")
        } else {
            const err = await res.json()
            setError(err.message || "Erro ao registrar")
        }
    }

    return (
        <div className="border-2 rounded-lg max-w-md mx-auto my-55 p-5">
            <h1 className="text-2xl font-semibold">Cadastrar-se</h1>
            <p className="mb-4 text-sm text-gray-400">Insira as informações abaixo para criar sua conta.</p>
            <div className="mb-5 flex justify-between">
                <Button type="submit" variant={"secondary"} disabled={isSubmitting} className="btn btn-primary">
                        
                </Button>
                <Button type="submit" variant={"secondary"} disabled={isSubmitting} className="btn btn-primary">
                    
                </Button>
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card text-muted-foreground px-2">Ou continue com</span>
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
                        <Label>Senha</Label>
                        <Input type="password" {...register("password")} className="input" required placeholder="Senha" />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </fieldset>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button type="submit" variant={"secondary"} disabled={isSubmitting} className="btn btn-primary w-full">
                        {isSubmitting ? (<> <LoaderCircle /> Registrando... </>) : (<> <UserPlus /> Criar Conta</>)}
                    </Button>
                </form>
            </div>

        </div>
    )
}