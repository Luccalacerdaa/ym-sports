// Serviço do Chatbot YM Sports - Assistente IA com conhecimento completo do app

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  actions?: ChatAction[];
}

export interface ChatAction {
  type: 'navigate' | 'open_feature' | 'show_tutorial';
  label: string;
  data: any;
}

class ChatbotService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  // Conhecimento completo sobre o YM Sports
  private readonly systemPrompt = `
Você é o assistente oficial do YM Sports, um aplicativo completo para atletas de futebol. Seu nome é "YM Assistant" e você conhece profundamente todas as funcionalidades do app.

## SOBRE O YM SPORTS:
O YM Sports é uma plataforma completa para atletas de futebol que oferece:

### 🏠 DASHBOARD PRINCIPAL:
- Visão geral do progresso do atleta
- Estatísticas de pontos e nível atual
- Posição no ranking (nacional, regional, local)
- Acesso rápido a todas as funcionalidades

### 📊 SISTEMA DE PONTUAÇÃO:
- Pontos ganhos por atividades completadas
- Sistema de níveis baseado em pontos
- Rankings nacional, regional e local
- Conquistas e badges por marcos atingidos

### 🏃‍♂️ TREINOS:
- Treinos personalizados por posição (goleiro, zagueiro, meio-campo, atacante)
- Exercícios específicos para cada posição
- Sistema de progressão e dificuldade
- Registro de treinos completados

### 🥗 NUTRIÇÃO:
- Planos alimentares personalizados
- Receitas saudáveis para atletas
- Registro de refeições
- Controle de hidratação
- Conquistas relacionadas à alimentação

### 📱 PORTFÓLIO DIGITAL:
- Perfil completo do atleta
- Informações pessoais e de contato
- Dados físicos (altura, peso, posição)
- Histórico de conquistas
- Medalhas, campeonatos e prêmios individuais
- Galeria de fotos e vídeos
- Compartilhamento para clubes e olheiros

### 🏆 RANKINGS:
- Ranking nacional de todos os usuários
- Ranking regional por estado/região
- Ranking local por cidade
- Sistema de geolocalização automática
- Comparação com outros atletas

### 🎯 MOTIVAÇÃO:
- Vídeos motivacionais do YouTube
- Conteúdo inspiracional
- Shorts do YouTube integrados
- Sistema de favoritos
- Configuração de canais personalizados

### 🎨 YM DESIGN:
- Serviço de design profissional
- Criação de artes pré-jogo
- Edição de vídeos para portfólio
- Material de divulgação para clubes
- 20% OFF para assinantes do app
- Designer profissional disponível

### ⚙️ CONFIGURAÇÕES:
- Perfil do usuário
- Configurações de notificações
- Preferências do app
- Gerenciamento de conta

### 🔔 NOTIFICAÇÕES:
- Notificações diárias motivacionais
- Lembretes de treino
- Alertas de hidratação
- Atualizações de ranking
- Conquistas desbloqueadas

## NAVEGAÇÃO NO APP:
- **Barra inferior**: Dashboard, Treinos, Nutrição, Portfólio, Motivação
- **Menu superior**: Perfil, configurações, notificações
- **Acesso rápido**: Botões flutuantes para ações principais

## COMO AJUDAR OS USUÁRIOS:
1. **Seja específico**: Explique exatamente onde encontrar cada funcionalidade
2. **Use emojis**: Torne as respostas mais visuais e amigáveis
3. **Dê passos claros**: Forneça instruções passo a passo
4. **Sugira funcionalidades**: Recomende recursos que o usuário pode não conhecer
5. **Seja motivacional**: Mantenha o tom positivo e encorajador

## EXEMPLOS DE PERGUNTAS COMUNS:
- "Como acessar meu portfólio?" → Explicar a aba Portfólio na barra inferior
- "Onde vejo minha posição no ranking?" → Dashboard ou aba Rankings
- "Como adicionar treinos?" → Aba Treinos, botão "Novo Treino"
- "Onde configuro notificações?" → Menu perfil → Configurações
- "Como funciona o YM Design?" → Explicar o serviço e como contratar

Sempre responda em português brasileiro, seja prestativo e demonstre conhecimento profundo do app.
`;

  constructor() {
    // Tentar obter a API key do localStorage ou variável de ambiente
    // IMPORTANTE: Configure a API key em Configurações do Chat
    this.apiKey = localStorage.getItem('openai_api_key') || 
                  process.env.REACT_APP_OPENAI_API_KEY || 
                  null;
                  
    // Se não tem API key salva, tentar usar a configurada pelo usuário
    if (!this.apiKey) {
      // Mostrar que é necessário configurar a API key
      console.warn('⚠️ API Key do OpenAI não configurada. Configure em Configurações do Chat.');
    }
  }

  // Configurar API key
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('openai_api_key', apiKey);
  }

  // Verificar se API key está configurada
  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // Enviar mensagem para o chatbot
  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatbotResponse> {
    if (!this.apiKey) {
      throw new Error('API key da OpenAI não configurada');
    }

    try {
      // Preparar mensagens para a API
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

      // Analisar a resposta para extrair sugestões e ações
      const suggestions = this.extractSuggestions(assistantMessage);
      const actions = this.extractActions(assistantMessage);

      return {
        message: assistantMessage,
        suggestions,
        actions
      };

    } catch (error) {
      console.error('Erro no chatbot:', error);
      
      // Fallback para respostas offline
      return this.getFallbackResponse(message);
    }
  }

  // Extrair sugestões da resposta
  private extractSuggestions(message: string): string[] {
    const suggestions: string[] = [];
    
    // Sugestões baseadas no conteúdo da mensagem
    if (message.includes('treino')) {
      suggestions.push('Como criar um plano de treino?');
      suggestions.push('Quais exercícios para minha posição?');
    }
    
    if (message.includes('nutrição') || message.includes('alimentação')) {
      suggestions.push('Como funciona o plano nutricional?');
      suggestions.push('Receitas para atletas');
    }
    
    if (message.includes('ranking') || message.includes('posição')) {
      suggestions.push('Como subir no ranking?');
      suggestions.push('Como funciona a pontuação?');
    }
    
    if (message.includes('portfólio')) {
      suggestions.push('Como editar meu portfólio?');
      suggestions.push('Como compartilhar com clubes?');
    }

    return suggestions.slice(0, 3); // Máximo 3 sugestões
  }

  // Extrair ações da resposta
  private extractActions(message: string): ChatAction[] {
    const actions: ChatAction[] = [];
    
    // Ações baseadas no conteúdo
    if (message.includes('dashboard') || message.includes('início')) {
      actions.push({
        type: 'navigate',
        label: 'Ir para Dashboard',
        data: { route: '/dashboard' }
      });
    }
    
    if (message.includes('treino')) {
      actions.push({
        type: 'navigate',
        label: 'Ver Treinos',
        data: { route: '/dashboard/training' }
      });
    }
    
    if (message.includes('nutrição')) {
      actions.push({
        type: 'navigate',
        label: 'Ver Nutrição',
        data: { route: '/dashboard/nutrition' }
      });
    }
    
    if (message.includes('portfólio')) {
      actions.push({
        type: 'navigate',
        label: 'Abrir Portfólio',
        data: { route: '/dashboard/portfolio' }
      });
    }

    return actions.slice(0, 2); // Máximo 2 ações
  }

  // Resposta de fallback quando a API não está disponível
  private getFallbackResponse(message: string): ChatbotResponse {
    const lowerMessage = message.toLowerCase();
    
    // Respostas baseadas em palavras-chave
    if (lowerMessage.includes('treino')) {
      return {
        message: '🏃‍♂️ Para acessar os treinos, clique na aba "Treinos" na barra inferior do app. Lá você encontrará exercícios personalizados para sua posição!',
        suggestions: ['Como criar plano de treino?', 'Exercícios por posição'],
        actions: [{
          type: 'navigate',
          label: 'Ver Treinos',
          data: { route: '/dashboard/training' }
        }]
      };
    }
    
    if (lowerMessage.includes('nutrição') || lowerMessage.includes('alimentação')) {
      return {
        message: '🥗 A seção de Nutrição está na barra inferior! Lá você encontra planos alimentares, receitas saudáveis e pode registrar suas refeições.',
        suggestions: ['Planos nutricionais', 'Receitas para atletas'],
        actions: [{
          type: 'navigate',
          label: 'Ver Nutrição',
          data: { route: '/dashboard/nutrition' }
        }]
      };
    }
    
    if (lowerMessage.includes('ranking') || lowerMessage.includes('posição')) {
      return {
        message: '🏆 Seu ranking aparece no Dashboard principal! Você pode ver sua posição nacional, regional e local. Para subir no ranking, complete treinos e atividades.',
        suggestions: ['Como subir no ranking?', 'Sistema de pontuação'],
        actions: [{
          type: 'navigate',
          label: 'Ver Dashboard',
          data: { route: '/dashboard' }
        }]
      };
    }
    
    if (lowerMessage.includes('portfólio') || lowerMessage.includes('perfil')) {
      return {
        message: '📱 Seu portfólio digital está na aba "Portfólio"! Lá você pode editar suas informações, adicionar conquistas e compartilhar com clubes.',
        suggestions: ['Como editar portfólio?', 'Compartilhar com clubes'],
        actions: [{
          type: 'navigate',
          label: 'Abrir Portfólio',
          data: { route: '/dashboard/portfolio' }
        }]
      };
    }
    
    // Resposta padrão
    return {
      message: '👋 Olá! Sou o YM Assistant, seu assistente pessoal do YM Sports! Posso te ajudar a navegar pelo app, explicar funcionalidades e tirar suas dúvidas. O que você gostaria de saber?',
      suggestions: [
        'Como funciona o app?',
        'Onde vejo meus treinos?',
        'Como acessar meu portfólio?',
        'Explicar sistema de ranking'
      ]
    };
  }

  // Obter perguntas frequentes
  getFrequentQuestions(): string[] {
    return [
      'Como funciona o YM Sports?',
      'Onde vejo minha posição no ranking?',
      'Como acessar meus treinos?',
      'Como editar meu portfólio?',
      'O que é o YM Design?',
      'Como configurar notificações?',
      'Como ganhar mais pontos?',
      'Onde vejo minhas conquistas?',
      'Como funciona a nutrição?',
      'Como compartilhar meu portfólio?'
    ];
  }

  // Limpar histórico de conversa
  clearConversation(): void {
    localStorage.removeItem('ym_chat_history');
  }

  // Salvar conversa
  saveConversation(messages: ChatMessage[]): void {
    localStorage.setItem('ym_chat_history', JSON.stringify(messages));
  }

  // Carregar conversa salva
  loadConversation(): ChatMessage[] {
    const saved = localStorage.getItem('ym_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Erro ao carregar conversa:', error);
      }
    }
    return [];
  }
}

export const chatbotService = new ChatbotService();
