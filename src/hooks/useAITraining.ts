import { useState } from 'react';
import { useProfile } from './useProfile';
import { Exercise, Training } from './useTrainings';
import { useExerciseDatabase } from './useExerciseDatabase';
import OpenAI from 'openai';

interface AITrainingRequest {
  goals: string[];
  availableDays: string[];
  sessionDuration: number; // em minutos
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  focus: string[]; // ['strength', 'cardio', 'flexibility', 'sports_specific']
}

export const useAITraining = () => {
  const { profile } = useProfile();
  const { exerciseDatabase, enrichTraining, enrichTrainingWithAPI } = useExerciseDatabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePersonalizedPrompt = (request: AITrainingRequest) => {
    const userInfo = `
PERFIL DETALHADO DO ATLETA:
- Nome: ${profile?.name || 'Não informado'}
- Idade: ${profile?.age || 'Não informado'} anos
- Altura: ${profile?.height || 'Não informado'} cm
- Peso: ${profile?.weight || 'Não informado'} kg
- IMC: ${profile?.weight && profile?.height ? (profile.weight / ((profile.height/100) ** 2)).toFixed(1) : 'Não calculado'}
- Posição: ${profile?.position || 'Não informado'}
- Time Atual: ${profile?.current_team || 'Não informado'}
- Experiência: ${profile?.previous_teams?.length || 0} times anteriores
- Localização: ${profile?.location || 'Não informado'}
- Biotipo: ${profile?.age && profile?.height && profile?.weight ? 
  (profile.age < 18 ? 'Em desenvolvimento' : 
   profile.height > 180 && profile.weight < 80 ? 'Ectomorfo' :
   profile.height < 175 && profile.weight > 80 ? 'Endomorfo' : 'Mesomorfo') : 'Não determinado'}
`;

    const goalsText = request.goals.join(', ');
    const daysText = request.availableDays.join(', ');
    const equipmentText = request.equipment.join(', ');
    const focusText = request.focus.join(', ');

    return `
${userInfo}

SOLICITAÇÃO DE TREINO PERSONALIZADO:
- Objetivos: ${goalsText}
- Dias disponíveis: ${daysText}
- Duração por sessão: ${request.sessionDuration} minutos
- Nível de dificuldade: ${request.difficulty}
- Equipamentos disponíveis: ${equipmentText || "Apenas peso corporal"}
- Foco do treino: ${focusText || "Geral"}

INSTRUÇÕES:
Você é um preparador físico especializado em futebol com 20+ anos de experiência. Crie um plano de treinos semanal ULTRA PERSONALIZADO baseado no perfil específico do atleta.

IMPORTANTE: 
- Gere treinos para TODOS os dias disponíveis. Se ${request.availableDays.length} dias foram selecionados, crie ${request.availableDays.length} treinos diferentes.
- VOCÊ DEVE USAR OS EQUIPAMENTOS INFORMADOS! Se o atleta informou que tem ${equipmentText || "apenas peso corporal"}, TODOS os treinos devem utilizar esses equipamentos.
- Cada treino deve ter pelo menos um exercício que utilize um dos equipamentos informados.
- Se o atleta informou que tem halteres, barras ou kettlebell, inclua exercícios com pesos.
- Se o atleta informou que tem bicicleta ou esteira, inclua exercícios cardiovasculares com esses equipamentos.
- Adapte a duração dos exercícios para que o treino completo dure exatamente ${request.sessionDuration} minutos.

LIMITAÇÕES PARA EVITAR CORTE:
- Máximo 3 exercícios por treino
- Descrições concisas mas informativas
- Use vídeos apenas para exercícios complexos
- Foque na qualidade, não na quantidade

FORMATO DE RESPOSTA (JSON):
{
  "weeklyPlan": {
    "monday": {
      "title": "Nome específico do treino",
      "description": "Descrição detalhada do treino",
      "duration_minutes": 60,
      "difficulty_level": "intermediate",
      "muscle_groups": ["legs", "core"],
      "training_rationale": "Explicação detalhada do por que este treino específico é ideal para este atleta baseado na idade, altura, peso e posição",
      "performance_benefits": "Como este treino específico vai melhorar a performance do atleta no futebol",
      "adaptation_notes": "Adaptações específicas baseadas no perfil físico único do atleta",
      "exercises": [
        {
          "name": "Nome do exercício",
          "sets": 3,
          "reps": "12-15",
          "weight": "Peso corporal ou peso específico baseado no perfil",
          "rest_time": "60 segundos",
          "notes": "Observações técnicas específicas",
          "description": "Descrição detalhada de como executar o exercício",
          "benefits": "Benefícios específicos deste exercício para este atleta",
          "video_url": "https://www.youtube.com/watch?v=EXEMPLO",
          "image_url": "https://example.com/exercise-image.jpg"
        }
      ]
    }
  }
}

DIRETRIZES CRÍTICAS:
1. SEMPRE use idade, altura e peso para personalizar cada exercício
2. Para atletas altos (>180cm): foco em estabilidade e agilidade
3. Para atletas baixos (<175cm): foco em força e explosão
4. Para jovens (<18): priorize desenvolvimento motor e prevenção de lesões
5. Para atletas mais pesados: foco em condicionamento e mobilidade
6. Para atletas mais leves: foco em força e resistência
7. Considere a posição específica no campo
8. Varie COMPLETAMENTE os treinos - cada dia deve ser único
9. Inclua progressão semanal baseada no perfil
10. SEMPRE explique o "porquê" de cada escolha
11. OBRIGATÓRIO: Utilize os equipamentos informados pelo atleta em TODOS os treinos
12. Distribua os exercícios para utilizar o tempo total solicitado (${request.sessionDuration} minutos)
13. Crie treinos profissionais com progressão lógica (aquecimento → parte principal → finalização)
14. Inclua tempos de descanso realistas entre séries (30-90 segundos dependendo da intensidade)
15. Considere o nível de dificuldade solicitado (${request.difficulty}) ao definir intensidade

TIPOS DE TREINO POR DIA:
- Segunda: Força e Potência (adaptado ao biotipo)
- Terça: Resistência e Cardio (baseado no condicionamento atual)
- Quarta: Agilidade e Velocidade (considerando altura)
- Quinta: Força Funcional (específico para posição)
- Sexta: HIIT e Explosão (adaptado ao peso)
- Sábado: Técnica e Coordenação (baseado na idade)
- Domingo: Recuperação Ativa (personalizado)

EXERCÍCIOS POR BIOTIPO:
- Ectomorfo (alto e magro): Exercícios de estabilização, propriocepção
- Endomorfo (baixo e forte): Exercícios de mobilidade, agilidade
- Mesomorfo (proporcional): Exercícios balanceados
- Em desenvolvimento (<18): Exercícios de base motora

ADAPTAÇÕES POR POSIÇÃO:
- Goleiro: Reflexos, agilidade, explosão vertical
- Zagueiro: Força, resistência, jogo aéreo
- Lateral: Velocidade, resistência, cruzamentos
- Meio-campo: Resistência, visão de jogo, passes longos
- Atacante: Velocidade, finalização, dribles

VÍDEOS E IMAGENS:
- SEMPRE inclua links do YouTube para cada exercício
- Use vídeos em PORTUGUÊS de canais brasileiros como:
  * Treino em Casa (exercícios em português)
  * Hipertrofia (canais de musculação em português)
  * Fabio Giga (treinos de futebol)
  * Leandro Twin (exercícios com halteres)
  * Renato Cariani (exercícios com barras)
  * Rodrigo Purchio (exercícios funcionais)
  * Canais de futebol brasileiros para exercícios específicos
- Para exercícios de futebol, use vídeos de canais brasileiros de treinamento
- Inclua descrições detalhadas de execução em PORTUGUÊS
- Mencione benefícios específicos para o perfil
- Se não souber um vídeo específico, use um vídeo genérico do exercício em português
- IMPORTANTE: Verifique que os vídeos mostram EXATAMENTE o exercício descrito
- Priorize vídeos que mostram a técnica correta de execução

BASE DE EXERCÍCIOS DISPONÍVEIS:
${exerciseDatabase.map(ex => 
  `- ${ex.name} (${ex.aliases.join(', ')}) - Categoria: ${ex.category} - Grupos: ${ex.muscle_groups.join(', ')}`
).join('\n')}

INSTRUÇÕES PARA EXERCÍCIOS:
1. SEMPRE use exercícios da base de dados acima quando possível
2. Use o nome EXATO do exercício da base de dados em PORTUGUÊS
3. SEMPRE inclua video_url com link do YouTube em PORTUGUÊS para cada exercício
4. Use vídeos de canais brasileiros (Canal do Personal, Hipertrofia, canais de futebol brasileiros)
5. Se criar um exercício personalizado, mantenha o formato mas adicione descrição detalhada em PORTUGUÊS
6. Para exercícios da base, a IA já tem vídeos e imagens disponíveis
7. Se não souber um vídeo específico, use um vídeo genérico do exercício no YouTube em PORTUGUÊS
8. TODOS os textos devem estar em PORTUGUÊS: títulos, descrições, benefícios

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional. SEMPRE gere treinos para TODOS os dias selecionados.
`;
  };

  const generateTrainingPlan = async (request: AITrainingRequest): Promise<Training[]> => {
    setLoading(true);
    setError(null);

    try {
      // Se muitos dias foram selecionados, dividir em lotes menores
      if (request.availableDays.length > 4) {
        return await generateTrainingPlanInBatches(request);
      }

      const prompt = generatePersonalizedPrompt(request);
      
      // Usar API real da OpenAI
      const response = await callOpenAI(prompt);
      
      // Converter resposta em formato de treinos
      const trainings: Training[] = [];
      
      console.log('Resposta da IA:', response);
      
      if (!response.weeklyPlan) {
        throw new Error('Resposta da IA não contém weeklyPlan');
      }

      for (const [day, plan] of Object.entries(response.weeklyPlan)) {
        console.log('Processando dia:', day, 'plan:', plan);
        
        if (plan) {
          const planData = plan as any;
          // Mapear dias da semana para valores válidos
          const dayMapping: { [key: string]: string } = {
            'monday': 'monday',
            'tuesday': 'tuesday', 
            'wednesday': 'wednesday',
            'thursday': 'thursday',
            'friday': 'friday',
            'saturday': 'saturday',
            'sunday': 'sunday',
            'segunda': 'monday',
            'terça': 'tuesday',
            'quarta': 'wednesday', 
            'quinta': 'thursday',
            'sexta': 'friday',
            'sábado': 'saturday',
            'domingo': 'sunday'
          };

          const mappedDay = dayMapping[day.toLowerCase()] || day.toLowerCase();
          
          // Criar treino base
          const baseTraining = {
            id: '', // Será gerado pelo banco
            user_id: '', // Será preenchido pelo hook useTrainings
            title: planData.title || `Treino de ${day}`,
            description: planData.description || '',
            day_of_week: mappedDay as any,
            exercises: planData.exercises || [],
            duration_minutes: planData.duration_minutes || 60,
            difficulty_level: planData.difficulty_level || 'intermediate',
            muscle_groups: planData.muscle_groups || [],
            is_ai_generated: true,
            training_rationale: planData.training_rationale || '',
            performance_benefits: planData.performance_benefits || '',
            adaptation_notes: planData.adaptation_notes || '',
          };

          // Enriquecer com dados da base de exercícios e API
          const enrichedTraining = await enrichTrainingWithAPI(baseTraining);
          trainings.push(enrichedTraining);
        }
      }

      setLoading(false);
      return trainings;
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar plano de treinos');
      setLoading(false);
      throw err;
    }
  };

  // Função para gerar treinos em lotes menores
  const generateTrainingPlanInBatches = async (request: AITrainingRequest): Promise<Training[]> => {
    const allTrainings: Training[] = [];
    const days = request.availableDays;
    
    // Dividir em lotes de 3 dias
    const batchSize = 3;
    for (let i = 0; i < days.length; i += batchSize) {
      const batchDays = days.slice(i, i + batchSize);
      
      const batchRequest = {
        ...request,
        availableDays: batchDays
      };
      
      console.log(`Gerando lote ${Math.floor(i/batchSize) + 1}:`, batchDays);
      
      const batchPrompt = generatePersonalizedPrompt(batchRequest);
      const response = await callOpenAI(batchPrompt);
      
        if (response.weeklyPlan) {
          for (const [day, plan] of Object.entries(response.weeklyPlan)) {
            if (plan) {
              const planData = plan as any;
              const dayMapping: { [key: string]: string } = {
                'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday',
                'thursday': 'thursday', 'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday',
                'segunda': 'monday', 'terça': 'tuesday', 'quarta': 'wednesday', 
                'quinta': 'thursday', 'sexta': 'friday', 'sábado': 'saturday', 'domingo': 'sunday'
              };
              
              const mappedDay = dayMapping[day.toLowerCase()] || day.toLowerCase();
              
              // Criar treino base
              const baseTraining = {
                id: '',
                user_id: '',
                title: planData.title || `Treino de ${day}`,
                description: planData.description || '',
                day_of_week: mappedDay as any,
                exercises: planData.exercises || [],
                duration_minutes: planData.duration_minutes || 60,
                difficulty_level: planData.difficulty_level || 'intermediate',
                muscle_groups: planData.muscle_groups || [],
                is_ai_generated: true,
                training_rationale: planData.training_rationale || '',
                performance_benefits: planData.performance_benefits || '',
                adaptation_notes: planData.adaptation_notes || '',
              };

              // Enriquecer com dados da base de exercícios e API
              const enrichedTraining = await enrichTrainingWithAPI(baseTraining);
              allTrainings.push(enrichedTraining);
            }
          }
        }
      
      // Pequena pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return allTrainings;
  };

  // Função para chamar a API da OpenAI
  const callOpenAI = async (prompt: string) => {
    // Verificar se a API key está configurada
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API key da OpenAI não configurada. Por favor, configure a variável VITE_OPENAI_API_KEY');
    }

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
            content: "Você é um preparador físico especializado em futebol. Responda SEMPRE com JSON válido seguindo exatamente o formato solicitado. NUNCA corte a resposta no meio. Se precisar, use menos exercícios por treino para garantir que a resposta seja completa."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000, // Aumentado de 2000 para 4000
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
        if (!responseText.trim().endsWith('}')) {
          throw new Error('Resposta da IA foi cortada no meio. Tente novamente com menos dias selecionados.');
        }
        
        throw new Error('Resposta da IA não é um JSON válido. Verifique o console para mais detalhes.');
      }
    } catch (error: any) {
      console.error('Erro na chamada da OpenAI:', error);
      
      if (error.code === 'insufficient_quota') {
        throw new Error('Cota da API da OpenAI esgotada. Verifique sua conta.');
      } else if (error.code === 'invalid_api_key') {
        throw new Error('API key da OpenAI inválida. Verifique a configuração.');
      } else {
        throw new Error(`Erro na API da OpenAI: ${error.message}`);
      }
    }
  };

  return {
    generateTrainingPlan,
    loading,
    error,
  };
};
