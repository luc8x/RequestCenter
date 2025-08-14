import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { QrCode, Share2, Mail, MessageCircle } from "lucide-react";
import QRCode from "react-qr-code";
import { useState } from "react";

export function CompartilharPopover({ solicitacao }) {
  const [openQRCode, setOpenQRCode] = useState(false);

  const Url = `${process.env.NEXT_PUBLIC_BASE_URL}/qrcode?token=${solicitacao.token}`;

  const opcoes = [
    {
      label: "WhatsApp",
      icon: <MessageCircle className="h-5 w-5 text-green-500" />,
      href: `https://wa.me/?text=${encodeURIComponent("Acompanhe sua solicitação: " + Url)}`,
    },
    {
      label: "E-mail",
      icon: <Mail className="h-5 w-5 text-blue-500" />,
      href: `mailto:?subject=Acompanhe sua solicitação&body=${encodeURIComponent(Url)}`,
    },
  ];

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button type="button" className="p-2 rounded-md hover:bg-gray-700/50 transition-colors flex items-center justify-center"
              aria-label="Visualizar QR Code">
              <Share2 className="h-5 w-5 text-gray-300" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-sm">
          Compartilhar
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-[260px] p-3 rounded-xl shadow-lg space-y-3">
        <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Compartilhar via:
        </h6>

        {/* Opções de compartilhamento */}
        <div className="flex flex-col gap-2">
          {opcoes.map((opt) => (
            <a
              key={opt.label}
              href={opt.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {opt.icon}
              <span className="text-sm">{opt.label}</span>
            </a>
          ))}

          {/* Sub-popover para QRCode */}
          <Popover open={openQRCode} onOpenChange={setOpenQRCode}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-sm"
              >
                <QrCode className="h-5 w-5 text-blue-500" />
                Mostrar QR Code
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-5 w-auto rounded-2xl shadow-lg">
              <div className="text-center space-y-2">
                <h6 className="text-lg font-bold text-blue-600">
                  Acompanhe sua Solicitação
                </h6>
                <p className="text-gray-500 text-sm">
                  Escaneie para acompanhar de qualquer lugar.
                </p>
              </div>

              {solicitacao.token && (
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 18 }}
                  className="flex justify-center mt-4"
                >
                  <QRCode
                    value={Url}
                    size={200}
                    className="bg-white p-3 rounded-lg"
                  />
                </motion.div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </PopoverContent>
    </Popover>
  );
}
