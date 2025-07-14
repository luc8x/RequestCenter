import { ColumnDef } from "@tanstack/react-table";

// Componentes
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// Icons
import { Trash2 } from "lucide-react";


export type Solicitacao = {
  id: string;
  assunto: string;
  prioridade: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  status: "ABERTA" | "EM_ANDAMENTO" | "FINALIZADA" | "CANCELADA";
};

export const columns = (
  onDelete: (id: string) => void
): ColumnDef<Solicitacao>[] => [
    {
      accessorKey: "assunto",
      header: "Assunto",
    },
    {
      accessorKey: "prioridade",
      header: "Prioridade",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const solicitacao = row.original;

        const handleClick = () => {
          if (confirm) onDelete(solicitacao.id);
        };

        return (
          <Dialog>
            <DialogTrigger className="bg-red-500 p-1.5 rounded text-white cursor-pointer"><Trash2 className="h-4 w-4" /></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Você tem certeza disso?</DialogTitle>
                <DialogDescription>
                  Realmente você deseja deletar essa solicitação
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" size="sm" onClick={handleClick} className="cursor-pointer">
                  <Trash2 className="h-4 w-4" /> Deletar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];
