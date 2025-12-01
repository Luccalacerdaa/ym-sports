import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Settings, 
  Trash2, 
  Key,
  ExternalLink,
  Minimize2,
  Maximize2,
  HelpCircle,
  Zap
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
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
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
      
      // Verificar se tem API key
      if (chatbotService.hasApiKey()) {
        setShowSettings(false);
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

  // Configurar API key
  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('Digite uma API key válida');
      return;
    }

    chatbotService.setApiKey(apiKey.trim());
    setShowSettings(false);
    toast.success('✅ API key configurada!');
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-4">
      <Card className={`w-full max-w-md bg-white shadow-2xl transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`}>
        {/* Header */}
        <CardHeader className="pb-3 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">YM Assistant</CardTitle>
                <p className="text-sm text-blue-100">Assistente IA do YM Sports</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-full">
            {/* Configurações */}
            {showSettings && (
              <div className="p-4 border-b bg-gray-50">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key da OpenAI
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={saveApiKey} size="sm">
                        <Key className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Necessária para usar o chatbot com IA. 
                      <a 
                        href="https://platform.openai.com/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-1"
                      >
                        Obter API key <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearConversation}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Conversa
                  </Button>
                </div>
              </div>
            )}

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
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(message.content)
                        }}
                        className="text-sm leading-relaxed"
                      />
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm ml-2">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Perguntas Frequentes */}
            {messages.length <= 1 && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
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
                      className="text-xs h-8"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua pergunta..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {!chatbotService.hasApiKey() && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Configure sua API key da OpenAI para usar a IA completa
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
