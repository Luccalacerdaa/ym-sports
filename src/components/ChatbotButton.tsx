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
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            isChatOpen 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 animate-pulse'
          }`}
          style={{ display: isChatOpen ? 'none' : 'flex' }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
        
        {/* Badge de notificação */}
        {!isChatOpen && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
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
