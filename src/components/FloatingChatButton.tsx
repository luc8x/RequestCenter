'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
// import { useState, useEffect } from 'react';

const FloatingChatButton = () => {
  // const [isTauriApp, setIsTauriApp] = useState(false);

  // useEffect(() => {
  //   const checkTauriAvailability = async () => {
  //     try {
  //       const response = await fetch('/api/tauri/chat', {
  //         method: 'GET',
  //       });
        
  //       if (response.ok) {
  //         const result = await response.json();
  //         setIsTauriApp(result.tauriAvailable);
  //       } else {
  //         setIsTauriApp(false);
  //       }
  //     } catch (error) {
  //       setIsTauriApp(false);
  //     }
  //   };
    
  //   checkTauriAvailability();
  // }, []);

  const handleChatClick = async () => {
    
    try {
      const response = await fetch('/api/tauri/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'open_chat_window' }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resposta da API híbrida:', result);
        
        if (result.success) {
          if (result.method === 'tauri_desktop') {
            return; 
          } else if (result.method === 'web_fallback' && result.url) {
            window.open(result.url, '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes');
            return;
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro na comunicação híbrida:', error);
    }
    window.open('/chat-window', '_blank', 'width=400,height=600,scrollbars=yes,resizable=yes');
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={handleChatClick}
        className="
          h-14 w-14 rounded-full shadow-2xl transition-all duration-300
          bg-blue-600 hover:bg-blue-700 shadow-blue-500/25
          hover:shadow-xl backdrop-blur-sm
        "
        title="Abrir Chat"
      >
        <motion.div
          whileHover={{ rotate: 15 }}
          transition={{ duration: 0.2 }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default FloatingChatButton;