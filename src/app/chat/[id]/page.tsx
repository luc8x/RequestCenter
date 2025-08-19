import ChatLayout from "@/components/chat/chat";
import InfoSolicitacao from "@/components/solicitacao/chat/InfoSolicitacao";

export default function ChatPage() {
  return (
    <div className={`grid gap-6 grid-cols-1 md:grid-cols-[2fr_2fr] text-gray-100`}>
      <InfoSolicitacao />
      <ChatLayout />
    </div>
  );
}
