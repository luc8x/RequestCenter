"use client"

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";;
import { loginSchema } from "@/schemas/authSchema";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

// Componentes
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus } from 'lucide-react';
import { DoorOpen } from 'lucide-react';

// Icons
import { LoaderCircle } from 'lucide-react';
import ParticulasDotsBackground from "@/components/TSparticulasBackground";

type FormData = z.infer<typeof loginSchema>

export default function RegisterPage() {
    const router = useRouter()
    const [error, setError] = useState("")

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(loginSchema) })

    const onSubmit = async (data: FormData) => {
        setError("")

        const res = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        });

        if (res?.ok) {
            router.push("/dashboard");
        } else {
            setError("Credenciais inválidas");
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center">
            <ParticulasDotsBackground />
            <div className="bg-white/10 backdrop-blur rounded-lg shadow-lg p-6 border border-white text-white">
                <div className="flex justify-between mb-2">
                    <h1 className="text-3xl font-semibold">Login</h1>
                    <a href="/registrar" className="text-sm flex gap-2 items-center"><UserPlus size={15} />Cadastrar-se</a>
                </div>
                <div className="mb-5">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                        <p className="text-red-500 text-sm">{error}</p>

                        <fieldset className="flex gap-2">
                            <Checkbox id="lembre" /> <Label htmlFor="lembre">Lembre-se de mim</Label>
                        </fieldset>

                        <Button type="submit" variant={"secondary"} disabled={isSubmitting} className="btn btn-primary w-full">
                            {isSubmitting ? (<> <LoaderCircle className="animate-spin" /> Logando... </>) : (<> <DoorOpen /> Logar</>)}
                        </Button>
                    </form>
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
                <div className="mt-5 flex justify-between gap-2">
                    <Button type="submit" variant={"secondary"} disabled={isSubmitting} className="btn btn-primary w-45">
                        <img src={'google.png'} width={20}></img>Google
                    </Button>
                    <Button type="submit" variant={"secondary"} disabled={isSubmitting} className="btn btn-primary w-45">
                        <img src={'github.png'} width={20}></img>Github
                    </Button>
                </div>
            </div>
        </div>
    )
}