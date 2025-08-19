import { useState, useCallback } from 'react';

interface SolicitacaoData {
  id?: string | number;
  [key: string]: unknown;
}

export const useChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatWindow, setChatWindow] = useState<unknown>(null);

  const resetWindow = useCallback(() => {
    setIsOpen(false);
    setChatWindow(null);
  }, []);

  const openChatWindow = useCallback(async (solicitacaoData?: SolicitacaoData) => {
    try {
      if (typeof window === 'undefined') return;

      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      
      const existingWindows = WebviewWindow.getAll();
      const existingWindow = existingWindows.find(w => w.label === 'chat-window');
      
      if (existingWindow) {
        try {
          await existingWindow.unminimize();
          await existingWindow.setFocus();
          setIsOpen(true);
          setChatWindow(existingWindow);
          return;
        } catch (error) {
          console.log('Erro ao mostrar janela existente:', error);
        }
      }

      const solicitacaoId = solicitacaoData?.id || localStorage.getItem('currentSolicitacaoId');
      
      if (solicitacaoData) {
        localStorage.setItem('currentSolicitacaoData', JSON.stringify(solicitacaoData));
      }
      
      const chatUrl = solicitacaoId ? `/chat-window?solicitacaoId=${solicitacaoId}` : '/chat-window';

      const newWindow = new WebviewWindow('chat-window', {
        url: chatUrl,
        title: 'Chat - Solicitação',
        width: 400,
        height: 600,
        minWidth: 350,
        minHeight: 400,
        maxWidth: 600,
        maxHeight: 800,
        resizable: true,
        center: false,
        x: 100,
        y: 100,
        alwaysOnTop: true,
        decorations: true,
        transparent: false,
        skipTaskbar: false,
        visible: true
      });

      setChatWindow(newWindow);
      setIsOpen(true);

      newWindow.once('tauri://error', resetWindow);
      newWindow.listen('tauri://close-requested', resetWindow);

    } catch (error) {
      console.error('Falha ao abrir janela do chat:', error);
    }
  }, [resetWindow]);

  const closeChatWindow = useCallback(async () => {
    if (!chatWindow || typeof window === 'undefined' || !window.__TAURI__) return;

    try {
      await chatWindow.close();
      resetWindow();
    } catch (error) {
      console.error('Falha ao fechar janela do chat:', error);
    }
  }, [chatWindow, resetWindow]);

  const minimizeChatWindow = useCallback(async () => {
    if (!chatWindow || typeof window === 'undefined' || !window.__TAURI__) return;

    try {
      await chatWindow.minimize();
    } catch (error) {
      console.error('Falha ao minimizar janela do chat:', error);
    }
  }, [chatWindow]);

  const toggleChatWindow = useCallback(async () => {
    if (isOpen) {
      await closeChatWindow();
    } else {
      await openChatWindow();
    }
  }, [isOpen, closeChatWindow, openChatWindow]);

  return {
    isOpen,
    chatWindow,
    openChatWindow,
    closeChatWindow,
    minimizeChatWindow,
    toggleChatWindow
  };
};