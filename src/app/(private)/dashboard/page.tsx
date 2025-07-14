"use client";

import { useSession } from "next-auth/react";

export default function DashPage() {
    const { data: session } = useSession();

    if (!session) return <p>Carregando</p>;

    return (
        <div>Bem-vindo, {session.user?.name}
        </div>
    );
}
