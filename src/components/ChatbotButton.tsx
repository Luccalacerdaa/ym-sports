import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Bot, X } from 'lucide-react';
import Chatbot from './Chatbot';

export default function ChatbotButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Botão Flutuante */}
      <div className="fixed bottom-24 right-4 z-40">
        <Button
          onClick={() => setIsChatOpen(true)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 p-2 ${
            isChatOpen 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 animate-pulse shadow-yellow-500/50'
          }`}
          style={{ display: isChatOpen ? 'none' : 'flex' }}
        >
          <img 
            src="/icons/logo.png" 
            alt="YM Sports Assistant" 
            className="w-full h-full object-contain"
          />
        </Button>
        
        {/* Badge de notificação */}
        {!isChatOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-black border-2 border-yellow-500 rounded-full flex items-center justify-center animate-bounce">
            <Bot className="w-3 h-3 text-yellow-500" />
          </div>
        )}
      </div>

      {/* Chatbot Modal */}
      <Chatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}
