import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  User, 
  X, 
  Trash2, 
  Minimize2,
  Maximize2,
  HelpCircle
} from 'lucide-react';
import { chatbotService, ChatMessage, ChatAction } from '@/services/chatbotService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Carregar conversa salva e configurações
  useEffect(() => {
    if (isOpen) {
      const savedMessages = chatbotService.loadConversation();
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        // Mensagem de boas-vindas
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '👋 Olá! Sou o **YM Assistant**, seu assistente pessoal do YM Sports! 🏆\n\nPosso te ajudar com:\n• 🏃‍♂️ Navegação pelo app\n• 📊 Explicar funcionalidades\n• 🎯 Dicas para melhorar seu desempenho\n• ❓ Tirar dúvidas sobre o sistema\n\nO que você gostaria de saber?',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
      
    }
  }, [isOpen]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Salvar conversa quando mensagens mudam
  useEffect(() => {
    if (messages.length > 1) { // Não salvar apenas a mensagem de boas-vindas
      chatbotService.saveConversation(messages);
    }
  }, [messages]);

  // Enviar mensagem
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(inputMessage, messages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Mostrar sugestões se houver
      if (response.suggestions && response.suggestions.length > 0) {
        toast.success(`💡 Sugestões: ${response.suggestions.join(', ')}`);
      }

    } catch (error) {
      console.error('Erro no chat:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Ops! Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}\n\nTente novamente ou configure sua API key da OpenAI nas configurações.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Erro no chatbot');
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar conversa
  const clearConversation = () => {
    setMessages([]);
    chatbotService.clearConversation();
    toast.success('Conversa limpa!');
  };

  // Executar ação
  const executeAction = (action: ChatAction) => {
    switch (action.type) {
      case 'navigate':
        navigate(action.data.route);
        toast.success(`Navegando para ${action.label}`);
        break;
      case 'open_feature':
        // Implementar abertura de funcionalidades específicas
        break;
      case 'show_tutorial':
        // Implementar tutoriais
        break;
    }
  };

  // Enviar pergunta frequente
  const sendFrequentQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => sendMessage(), 100);
  };

  // Formatear mensagem (suporte a markdown básico)
  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-lg bg-white shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[85vh] max-h-[700px]'
      }`}>
        {/* Header */}
        <CardHeader className="pb-3 border-b bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black border-2 border-black rounded-full flex items-center justify-center p-1">
                <img 
                  src="/icons/logo.png" 
                  alt="YM Sports" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">YM Assistant</CardTitle>
                <p className="text-sm text-black/70">Assistente IA do YM Sports</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-black hover:bg-black/20"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearConversation}
                className="text-black hover:bg-black/20"
                title="Limpar conversa"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-black hover:bg-black/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)] bg-black">
            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-black border-2 border-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 p-1">
                        <img 
                          src="/icons/logo.png" 
                          alt="YM" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] p-2.5 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-yellow-500 text-black ml-auto font-medium'
                          : 'bg-gray-900 text-white border border-gray-700'
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(message.content)
                        }}
                        className="text-xs leading-snug whitespace-pre-wrap break-words"
                      />
                      <div className="text-[10px] opacity-60 mt-1.5">
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-yellow-500">
                        <User className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center p-1">
                      <img 
                        src="/icons/logo.png" 
                        alt="YM" 
                        className="w-full h-full object-contain animate-pulse"
                      />
                    </div>
                    <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-500">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm ml-2 text-white">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Perguntas Frequentes */}
            {messages.length <= 1 && (
              <div className="p-4 border-t bg-gray-900 border-gray-700">
                <p className="text-sm font-medium text-yellow-500 mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Perguntas Frequentes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {chatbotService.getFrequentQuestions().slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => sendFrequentQuestion(question)}
                      className="text-xs h-8 border-yellow-500/30 text-white hover:bg-yellow-500/20 hover:border-yellow-500"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-900">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua pergunta..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading}
                  className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
