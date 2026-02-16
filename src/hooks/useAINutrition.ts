import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { 
  NutritionRequest, 
  NutritionPlan, 
  ComplexityLevel 
} from '@/types/nutrition';
import OpenAI from 'openai';

export const useAINutrition = () => {
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePersonalizedPrompt = (request: NutritionRequest) => {
    // Calcular IMC se altura e peso estiverem disponíveis
    const imc = profile?.weight && profile?.height 
      ? (profile.weight / ((profile.height/100) ** 2)).toFixed(1) 
      : 'Não calculado';
    
    // Classificação do IMC
    let classificacaoIMC = 'Não calculado';
    if (imc !== 'Não calculado') {
      const imcNum = parseFloat(imc);
      if (imcNum < 18.5) classificacaoIMC = 'Abaixo do peso';
      else if (imcNum < 25) classificacaoIMC = 'Peso normal';
      else if (imcNum < 30) classificacaoIMC = 'Sobrepeso';
      else classificacaoIMC = 'Obesidade';
    }
    
    // Determinar necessidades específicas baseadas na posição
    const posicaoNecessidades: Record<string, string> = {
      'goleiro': 'reflexos, flexibilidade, explosão e força de membros superiores',
      'zagueiro': 'força, jogo aéreo, resistência e poder de marcação',
      'lateral': 'resistência aeróbica, velocidade, cruzamentos e marcação',
      'volante': 'resistência, força, marcação e distribuição',
      'meio-campo': 'resistência, visão de jogo, passes e finalizações',
      'meia': 'agilidade, criatividade, passes e finalizações',
      'atacante': 'velocidade, finalização, força e posicionamento',
      'ponta': 'velocidade, dribles, cruzamentos e finalizações'
    };
    
    // Obter necessidades específicas da posição ou valor padrão
    const posicaoAtleta = profile?.position?.toLowerCase() || '';
    const necessidadesEspecificas = Object.keys(posicaoNecessidades).find(pos => 
      posicaoAtleta.includes(pos)
    ) ? posicaoNecessidades[Object.keys(posicaoNecessidades).find(pos => 
      posicaoAtleta.includes(pos)
    ) as keyof typeof posicaoNecessidades] : 'habilidades gerais de futebol';
    
    // Converter arrays para texto
    const goalsText = request.goals.join(', ');
    const mealTypesText = request.mealTypes.join(', ');
    const favoritesText = request.preferences.favorites.join(', ') || 'Não informado';
    const avoidText = request.preferences.avoid.join(', ') || 'Não informado';
    const allergiesText = request.preferences.allergies.join(', ') || 'Não informado';
    
    // Gerar ID único para esta solicitação
    const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    return `
PERFIL DETALHADO DO ATLETA #${requestId}:
- Nome: ${profile?.name || 'Não informado'}
- Idade: ${profile?.age || 'Não informado'} anos
- Altura: ${profile?.height || 'Não informado'} cm
- Peso: ${profile?.weight || 'Não informado'} kg
- IMC: ${imc} (${classificacaoIMC})
- Posição: ${profile?.position || 'Não informado'}
- Necessidades específicas: ${necessidadesEspecificas}
- Time Atual: ${profile?.current_team || 'Não informado'}
- Data da solicitação: ${new Date().toLocaleDateString('pt-BR')}

SOLICITAÇÃO DE PLANO NUTRICIONAL:
- Objetivos: ${goalsText}
- Tipos de refeição: ${mealTypesText}
- Nível de complexidade: ${request.complexityLevel}
- Alimentos favoritos: ${favoritesText}
- Alimentos a evitar: ${avoidText}
- Alergias: ${allergiesText}
- Duração do plano: ${request.daysCount} dias

INSTRUÇÕES:
Você é um nutricionista esportivo especializado em futebol com 15+ anos de experiência. Crie um plano nutricional ULTRA PERSONALIZADO baseado no perfil específico do atleta.

IMPORTANTE - LEIA COM MUITA ATENÇÃO:
- Gere planos para TODOS os dias solicitados (${request.daysCount} dias)
- Cada dia deve ter TODAS as refeições solicitadas (${mealTypesText})
- Adapte as refeições ao nível de complexidade solicitado (${request.complexityLevel})
- NUNCA inclua alimentos listados como "a evitar" ou "alergias"
- USE os alimentos favoritos como PREFERÊNCIA, mas NÃO SE LIMITE apenas a eles
- IMPORTANTE: Mesmo que o atleta tenha alimentos favoritos, você DEVE incluir VARIEDADE nutricional
- Se o atleta informou 2-3 favoritos, use PELO MENOS 5-8 alimentos DIFERENTES por dia
- Alimentos favoritos devem aparecer em 30-40% das refeições, NÃO em 100%
- Use MÁXIMO 2-3 alimentos por refeição para garantir resposta completa
- Calcule calorias e macronutrientes básicos
- VARIEDADE é ESSENCIAL: inclua verduras, legumes, frutas, proteínas variadas, carboidratos diferentes

EXEMPLO DE BOA VARIEDADE:
- Café: Pão integral + Ovo + Abacate (não apenas "frango")
- Almoço: Arroz + Feijão + Carne (favorito) + Salada
- Lanche: Iogurte + Granola + Banana
- Jantar: Batata doce (favorito) + Frango + Brócolis

ALIMENTOS FAVORITOS (use como base, mas adicione OUTROS):
${favoritesText !== 'Não informado' ? `
- Favoritos do atleta: ${favoritesText}
- ATENÇÃO: Estes são PREFERÊNCIAS, não uma LISTA EXCLUSIVA
- Inclua estes alimentos em 2-3 refeições do plano
- Complete com OUTROS alimentos nutritivos e variados
` : '- Não informado - Use ampla variedade de alimentos saudáveis'}

NÍVEL DE COMPLEXIDADE:
- "simples": COMIDA BRASILEIRA COMUM E FÁCIL DE ENCONTRAR
  - Arroz branco, feijão preto/carioca, carne moída, frango grelhado
  - Ovo mexido/cozido, pão francês/integral, manteiga, queijo
  - Batata, macarrão, banana, maçã, laranja
  - Alface, tomate, cenoura, chuchu
  - Leite, iogurte natural, aveia
  - Preparos simples: grelhado, cozido, no vapor
  - Exemplo: Arroz + Feijão + Frango grelhado + Salada de alface e tomate
  
- "intermediario": Equilíbrio entre praticidade e variedade, preparo moderado
  - Pode incluir: batata doce, arroz integral, quinoa
  - Proteínas: peixes, carne vermelha magra, peru
  - Vegetais: brócolis, couve, espinafre, abobrinha
  - Frutas: abacate, morango, kiwi, mamão
  - Preparos: assado, refogado, salteado
  
- "avancado": Receitas elaboradas, maior variedade de alimentos, preparo mais complexo
  - Alimentos gourmet e importados
  - Técnicas culinárias avançadas
  - Ingredientes especiais

ADAPTAÇÕES POR PERFIL:
- Para atletas jovens (<18 anos): Foco em crescimento e desenvolvimento
- Para atletas com IMC baixo: Priorize calorias e proteínas para ganho de massa
- Para atletas com IMC elevado: Foque em nutrição densa, controle calórico
- Para cada posição: Adapte macronutrientes às necessidades específicas

HIDRATAÇÃO:
- Calcule a necessidade diária de água baseada no peso (30-35ml/kg)
- Distribua a ingestão ao longo do dia
- Inclua recomendações específicas para antes, durante e após treinos/jogos
- Sugira alternativas para melhorar a hidratação (água com limão, água de coco, etc.)

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título personalizado do plano nutricional",
  "description": "Descrição detalhada do plano",
  "goals": ["Objetivo 1", "Objetivo 2"],
  "days": [
    {
      "day_of_week": "Segunda-feira",
      "meals": [
        {
          "type": "cafe_da_manha",
          "title": "Nome da refeição",
          "time": "07:00",
          "foods": [
            {
              "name": "Nome do alimento",
              "portion": "100g",
              "calories": 200,
              "protein": 15,
              "carbs": 20,
              "fat": 5,
              "preparation": "Modo de preparo simples",
              "alternatives": ["Alternativa 1", "Alternativa 2"],
              "image_url": "https://exemplo.com/imagem.jpg"
            }
          ],
          "total_calories": 450,
          "total_protein": 25,
          "total_carbs": 40,
          "total_fat": 15,
          "notes": "Observações sobre a refeição",
          "preparation_time": "10 minutos"
        }
      ],
      "water_intake": 3000,
      "total_calories": 2500,
      "total_protein": 150,
      "total_carbs": 300,
      "total_fat": 70
    }
  ],
  "complexity_level": "${request.complexityLevel}",
  "nutritional_advice": "Conselhos nutricionais gerais para este atleta",
  "hydration_tips": "Dicas específicas de hidratação para este atleta"
}
`;
  };

  const generateNutritionPlan = async (request: NutritionRequest): Promise<NutritionPlan> => {
    console.log('🚀 [useAINutrition] generateNutritionPlan CHAMADO');
    console.log('📦 [useAINutrition] Request recebido:', request);
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📝 [useAINutrition] Gerando prompt personalizado...');
      const prompt = generatePersonalizedPrompt(request);
      
      console.log('🤖 [useAINutrition] Chamando OpenAI...');
      // Usar API real da OpenAI ou ChatGPT
      const response = await callOpenAI(prompt);
      
      console.log('✅ [useAINutrition] Resposta da IA:', response);
      
      // Validar e processar a resposta
      let days = response.days || [];
      
      // Se não há dias na resposta da IA, gerar dados de exemplo
      if (!days || days.length === 0) {
        console.warn('IA não retornou dias, gerando dados de exemplo...');
        days = generateFallbackDays(request);
      } else if (days.length < request.daysCount) {
        console.warn(`IA retornou apenas ${days.length} dias, mas foram solicitados ${request.daysCount}. Completando com dados de exemplo...`);
        const missingDays = request.daysCount - days.length;
        const additionalDays = generateFallbackDays({
          ...request,
          daysCount: missingDays
        });
        // Ajustar nomes dos dias para não repetir
        const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
        additionalDays.forEach((day, index) => {
          const dayIndex = (days.length + index) % 7;
          day.day_of_week = dayNames[dayIndex];
        });
        days = [...days, ...additionalDays];
      }
      
      const nutritionPlan: NutritionPlan = {
        title: response.title || 'Plano Nutricional Personalizado',
        description: response.description || 'Plano nutricional gerado por IA',
        goals: response.goals || request.goals,
        days: days,
        complexity_level: response.complexity_level as ComplexityLevel || request.complexityLevel,
        nutritional_advice: response.nutritional_advice || 'Mantenha uma alimentação equilibrada com foco em proteínas de qualidade, carboidratos complexos e gorduras saudáveis.',
        hydration_tips: response.hydration_tips || 'Beba pelo menos 2-3 litros de água por dia, especialmente antes, durante e após os treinos.'
      };
      
      setLoading(false);
      return nutritionPlan;
    } catch (err: any) {
      console.error('Erro ao gerar plano nutricional:', err);
      setError(err.message || 'Erro ao gerar plano nutricional');
      setLoading(false);
      throw err;
    }
  };

  // Função para chamar a API de IA (OpenAI ou ChatGPT)
  const callOpenAI = async (prompt: string) => {
    // Verificar se deve usar ChatGPT ou OpenAI API
    const useChatGPT = import.meta.env.VITE_USE_CHATGPT === 'true';
    
    console.log(`Modo de geração de nutrição: ${useChatGPT ? 'ChatGPT' : 'OpenAI API'}`);
    
    if (useChatGPT) {
      return await callChatGPT(prompt);
    } else {
      // Verificar se a API key está configurada
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('API key da OpenAI não configurada. Por favor, configure a variável VITE_OPENAI_API_KEY');
      }
      
      return await callOpenAIAPI(prompt, apiKey);
    }
  };
  
  // Função para chamar o ChatGPT via API personalizada
  const callChatGPT = async (prompt: string) => {
    try {
      console.log('Chamando ChatGPT via API personalizada para nutrição...');
      
      // URL da API personalizada que usa o ChatGPT
      const apiUrl = import.meta.env.VITE_CHATGPT_API_URL || 'https://api.ymsports.com.br/api/generate-nutrition';
      
      console.log(`URL da API do ChatGPT: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API do ChatGPT: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.result) {
        throw new Error('Resposta inválida da API do ChatGPT');
      }
      
      console.log('Resposta recebida do ChatGPT:', data);
      
      // Tentar fazer parse do JSON retornado
      try {
        // Se data.result já for um objeto, retorná-lo diretamente
        if (typeof data.result === 'object') {
          return data.result;
        }
        
        // Se for uma string, tentar fazer parse
        return JSON.parse(data.result);
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta do ChatGPT:', data.result);
        throw new Error('Resposta do ChatGPT não é um JSON válido');
      }
    } catch (error: any) {
      console.error('Erro ao chamar API do ChatGPT para nutrição:', error);
      throw new Error(`Erro no ChatGPT: ${error.message}`);
    }
  };
  
  // Função para chamar a API da OpenAI diretamente
  const callOpenAIAPI = async (prompt: string, apiKey: string) => {
    // Inicializar cliente OpenAI
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Apenas para desenvolvimento
    });

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um nutricionista esportivo especializado em futebol. Responda SEMPRE com JSON válido seguindo exatamente o formato solicitado. CRÍTICO: NUNCA corte a resposta no meio - termine sempre com } válido. Se necessário, use menos alimentos por refeição (máximo 2-3) para garantir resposta completa. Priorize completude sobre quantidade."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      });

      const responseText = completion.choices[0]?.message?.content;
      
      if (!responseText) {
        throw new Error('Resposta vazia da OpenAI');
      }

      // Tentar fazer parse do JSON
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erro ao fazer parse da resposta:', responseText);
        console.error('Erro de parse:', parseError);
        
        // Verificar se a resposta foi cortada
        const trimmedResponse = responseText.trim();
        if (!trimmedResponse.endsWith('}')) {
          console.warn('Resposta parece estar truncada, tentando usar fallback...');
          throw new Error('Resposta da IA foi cortada no meio. Tente novamente com menos dias ou refeições.');
        }
        
        // Tentar limpar caracteres inválidos
        try {
          // Remover possíveis caracteres de controle ou quebras de linha problemáticas
          const cleanedResponse = responseText
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
            .replace(/,\s*}/g, '}') // Remove vírgulas antes de }
            .replace(/,\s*]/g, ']'); // Remove vírgulas antes de ]
          
          return JSON.parse(cleanedResponse);
        } catch (secondParseError) {
          console.error('Erro no segundo parse:', secondParseError);
          throw new Error('Resposta da IA não é um JSON válido. Tente novamente.');
        }
      }
    } catch (error: any) {
      console.error('Erro na chamada da OpenAI para nutrição:', error);
      
      if (error.code === 'insufficient_quota') {
        throw new Error('Cota da API da OpenAI esgotada. Verifique sua conta.');
      } else if (error.code === 'invalid_api_key') {
        throw new Error('API key da OpenAI inválida. Verifique a configuração.');
      } else {
        throw new Error(`Erro na API da OpenAI: ${error.message}`);
      }
    }
  };

  // Função para gerar dados de exemplo quando a IA falha
  const generateFallbackDays = (request: NutritionRequest) => {
    const daysNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const days = [];
    
    
    for (let i = 0; i < request.daysCount; i++) {
      const dayName = daysNames[i % 7];
      
      const meals = [];
      
      // Gerar refeições baseadas nos tipos selecionados
      if (request.mealTypes.includes('cafe_da_manha')) {
        meals.push({
          type: 'cafe_da_manha',
          title: 'Café da Manhã Energético',
          time: '07:30',
          foods: [
            {
              name: 'Ovos mexidos',
              portion: '2 unidades',
              calories: 140,
              protein: 12,
              carbs: 1,
              fat: 10,
              preparation: 'Mexer em fogo baixo com pouco óleo',
              alternatives: ['Omelete', 'Ovos cozidos']
            },
            {
              name: 'Pão integral',
              portion: '2 fatias',
              calories: 160,
              protein: 6,
              carbs: 30,
              fat: 2,
              preparation: 'Torrar levemente',
              alternatives: ['Tapioca', 'Aveia']
            },
            {
              name: 'Banana',
              portion: '1 unidade média',
              calories: 105,
              protein: 1,
              carbs: 27,
              fat: 0,
              preparation: 'Consumir in natura',
              alternatives: ['Maçã', 'Mamão']
            }
          ],
          total_calories: 405,
          total_protein: 19,
          total_carbs: 58,
          total_fat: 12,
          notes: 'Refeição rica em energia para começar o dia',
          preparation_time: '10 minutos'
        });
      }
      
      if (request.mealTypes.includes('almoco')) {
        meals.push({
          type: 'almoco',
          title: 'Almoço Completo',
          time: '12:30',
          foods: [
            {
              name: 'Peito de frango grelhado',
              portion: '150g',
              calories: 231,
              protein: 43,
              carbs: 0,
              fat: 5,
              preparation: 'Grelhar com temperos naturais',
              alternatives: ['Peixe grelhado', 'Carne magra']
            },
            {
              name: 'Arroz integral',
              portion: '100g cozido',
              calories: 111,
              protein: 3,
              carbs: 23,
              fat: 1,
              preparation: 'Cozinhar com pouco sal',
              alternatives: ['Quinoa', 'Batata doce']
            },
            {
              name: 'Brócolis refogado',
              portion: '100g',
              calories: 34,
              protein: 3,
              carbs: 7,
              fat: 0,
              preparation: 'Refogar rapidamente',
              alternatives: ['Couve-flor', 'Abobrinha']
            }
          ],
          total_calories: 376,
          total_protein: 49,
          total_carbs: 30,
          total_fat: 6,
          notes: 'Refeição balanceada com proteína de qualidade',
          preparation_time: '25 minutos'
        });
      }
      
      if (request.mealTypes.includes('jantar')) {
        meals.push({
          type: 'jantar',
          title: 'Jantar Leve',
          time: '19:30',
          foods: [
            {
              name: 'Salmão grelhado',
              portion: '120g',
              calories: 206,
              protein: 22,
              carbs: 0,
              fat: 12,
              preparation: 'Grelhar com limão e ervas',
              alternatives: ['Tilápia', 'Atum']
            },
            {
              name: 'Salada mista',
              portion: '150g',
              calories: 25,
              protein: 2,
              carbs: 5,
              fat: 0,
              preparation: 'Temperar com azeite e vinagre',
              alternatives: ['Salada verde', 'Rúcula']
            }
          ],
          total_calories: 231,
          total_protein: 24,
          total_carbs: 5,
          total_fat: 12,
          notes: 'Jantar leve e nutritivo',
          preparation_time: '15 minutos'
        });
      }
      
      // Calcular totais do dia
      const dayTotals = meals.reduce((acc, meal) => ({
        calories: acc.calories + meal.total_calories,
        protein: acc.protein + meal.total_protein,
        carbs: acc.carbs + meal.total_carbs,
        fat: acc.fat + meal.total_fat
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      days.push({
        day_of_week: dayName,
        meals: meals,
        water_intake: 3000,
        total_calories: dayTotals.calories,
        total_protein: dayTotals.protein,
        total_carbs: dayTotals.carbs,
        total_fat: dayTotals.fat
      });
    }
    
    return days;
  };

  return {
    generateNutritionPlan,
    loading,
    error,
  };
};
