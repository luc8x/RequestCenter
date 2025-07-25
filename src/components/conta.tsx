'use client';

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ContaProps {
session: {
    user?: {
        name?: string;
        email?: string;
    };
};
}

export function Conta() {
const { data: session } = useSession();

  if (!session) return <p>Carregando</p>;

return (
    <div className="flex gap-2">
        <DropdownMenu>
            <DropdownMenuTrigger className="flex gap-2 items-center">
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="p-2 text-white font-semibold text-1xl text-start leading-3">
                    {session.user?.name}
                    <br />
                    <span className="text-sm font-light">{session.user?.email}</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-red-500"
                >
                    Deslogar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
);
}