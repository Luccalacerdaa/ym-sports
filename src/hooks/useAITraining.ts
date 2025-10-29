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
    // Gerar um ID único para cada solicitação de treino
    const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    // Calcular dados adicionais do perfil
    const imc = profile?.weight && profile?.height ? (profile.weight / ((profile.height/100) ** 2)).toFixed(1) : 'Não calculado';
    
    const biotipo = profile?.age && profile?.height && profile?.weight ? 
      (profile.age < 18 ? 'Em desenvolvimento' : 
       profile.height > 180 && profile.weight < 80 ? 'Ectomorfo' :
       profile.height < 175 && profile.weight > 80 ? 'Endomorfo' : 'Mesomorfo') : 'Não determinado';
    
    // Determinar necessidades específicas baseadas na posição
    const posicaoNecessidades = {
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
    
    const userInfo = `
PERFIL DETALHADO DO ATLETA #${requestId}:
- Nome: ${profile?.name || 'Não informado'}
- Idade: ${profile?.age || 'Não informado'} anos
- Altura: ${profile?.height || 'Não informado'} cm
- Peso: ${profile?.weight || 'Não informado'} kg
- IMC: ${imc} (${Number(imc) < 18.5 ? 'Abaixo do peso' : Number(imc) < 25 ? 'Peso normal' : Number(imc) < 30 ? 'Sobrepeso' : 'Obesidade'})
- Posição: ${profile?.position || 'Não informado'}
- Necessidades da posição: ${necessidadesEspecificas}
- Time Atual: ${profile?.current_team || 'Não informado'}
- Experiência: ${profile?.previous_teams?.length || 0} times anteriores
- Localização: ${profile?.location || 'Não informado'}
- Biotipo: ${biotipo}
- Data da solicitação: ${new Date().toLocaleDateString('pt-BR')}
- ID da solicitação: ${requestId}
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
Você é um preparador físico especializado em futebol com 20+ anos de experiência e PhD em Ciências do Esporte. Crie um plano de treinos semanal ULTRA PERSONALIZADO e ÚNICO baseado no perfil específico do atleta.

IMPORTANTE - LEIA COM MUITA ATENÇÃO: 
- Gere treinos para TODOS os dias disponíveis. Se ${request.availableDays.length} dias foram selecionados, crie ${request.availableDays.length} treinos COMPLETAMENTE DIFERENTES.

- PERSONALIZAÇÃO ABSOLUTA:
  * Cada treino deve ser ÚNICO e PERSONALIZADO para este atleta específico
  * NUNCA gere treinos genéricos ou padronizados
  * Considere TODOS os detalhes do perfil (idade, altura, peso, posição, biotipo)
  * Adapte os exercícios às necessidades específicas da posição do atleta
  * Considere o ID da solicitação (#${Date.now().toString(36)}) para garantir treinos diferentes a cada vez
  * Varie intensidade, volume e tipos de exercícios entre os dias da semana
  * Crie nomes de treinos CRIATIVOS e ÚNICOS que reflitam o objetivo do treino

- USO OBRIGATÓRIO DOS EQUIPAMENTOS INFORMADOS:
  * O atleta informou que tem disponível: ${equipmentText || "apenas peso corporal"}
  * CADA TREINO DEVE USAR TODOS OS EQUIPAMENTOS INFORMADOS
  * DISTRIBUA OS EQUIPAMENTOS entre os exercícios de cada treino
  * CADA EXERCÍCIO deve usar pelo menos um dos equipamentos informados
  * NÃO CRIE EXERCÍCIOS que exijam equipamentos não listados acima
  * Se o atleta tem halteres, OBRIGATORIAMENTE inclua 1-2 exercícios com halteres POR TREINO
  * Se o atleta tem bicicleta, OBRIGATORIAMENTE inclua 1-2 exercícios com bicicleta POR TREINO
  * Se o atleta tem barras, OBRIGATORIAMENTE inclua 1-2 exercícios com barras POR TREINO
  * Se o atleta tem elásticos, OBRIGATORIAMENTE inclua 1-2 exercícios com elásticos POR TREINO
  * NUNCA inclua exercícios com equipamentos não disponíveis
  * SEJA CRIATIVO com os equipamentos disponíveis (diferentes formas de uso)
  * EVITE USAR APENAS PESO CORPORAL quando outros equipamentos estiverem disponíveis

- DURAÇÃO EXATA: O treino completo deve durar exatamente ${request.sessionDuration} minutos, incluindo descansos
- VARIEDADE MÁXIMA: Cada dia deve ter exercícios COMPLETAMENTE diferentes, sem repetições na semana
- PROGRESSÃO CIENTÍFICA: Organize os exercícios em ordem lógica (aquecimento → parte principal → finalização)
- EXPLICAÇÕES DETALHADAS: Inclua o "porquê" de cada escolha de exercício para este atleta específico

LIMITAÇÕES PARA EVITAR CORTE:
- Inclua 4-5 exercícios por treino
- Descrições concisas mas informativas
- Use vídeos apenas para exercícios complexos
- Foque na qualidade e variedade dos exercícios

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

DIRETRIZES CRÍTICAS - LEIA COM MUITA ATENÇÃO:
1. EQUIPAMENTOS: USE TODOS OS EQUIPAMENTOS INFORMADOS PELO ATLETA
   * CADA TREINO DEVE USAR TODOS OS EQUIPAMENTOS DISPONÍVEIS: ${request.equipment.join(', ') || "peso corporal"}
   * DISTRIBUA OS EQUIPAMENTOS entre os diferentes exercícios de cada treino
   * NÃO inclua NENHUM exercício que exija equipamentos não listados acima
   * Se o atleta tem halteres, OBRIGATORIAMENTE use halteres em 1-2 exercícios por treino
   * Se o atleta tem bicicleta, OBRIGATORIAMENTE use a bicicleta em 1-2 exercícios por treino
   * Se o atleta tem barras, OBRIGATORIAMENTE use barras em 1-2 exercícios por treino
   * Se o atleta tem elásticos, OBRIGATORIAMENTE use elásticos em 1-2 exercícios por treino
   * SEJA CRIATIVO com os equipamentos - use de formas diferentes e inovadoras
   * EVITE USAR APENAS PESO CORPORAL quando outros equipamentos estiverem disponíveis
   * INCLUA 4-5 EXERCÍCIOS POR TREINO para garantir variedade e uso de todos os equipamentos

2. PERSONALIZAÇÃO FÍSICA AVANÇADA:
   * Use idade (${profile?.age || '?'}), altura (${profile?.height || '?'} cm) e peso (${profile?.weight || '?'} kg) para personalizar cada exercício
   * Para atletas altos (>180cm): foco em estabilidade, agilidade e trabalho de core
   * Para atletas baixos (<175cm): foco em força, explosão e trabalho de potência
   * Para jovens (<18): priorize desenvolvimento motor, prevenção de lesões e fundamentos técnicos
   * Para atletas mais pesados: foco em condicionamento, mobilidade e resistência cardiovascular
   * Para atletas mais leves: foco em força, resistência muscular e ganho de massa
   * Para cada biotipo: ${biotipo === 'Ectomorfo' ? 'priorize exercícios de força e hipertrofia com maior volume' : 
     biotipo === 'Endomorfo' ? 'inclua exercícios de alta intensidade para queima calórica' : 
     biotipo === 'Mesomorfo' ? 'equilibre força e resistência para maximizar o potencial atlético' : 
     'adapte os exercícios ao biotipo específico do atleta'}

3. ESPECIFICIDADE POR POSIÇÃO:
   * Adapte cada exercício para a posição do atleta: ${profile?.position || 'jogador de futebol'}
   * Necessidades específicas desta posição: ${necessidadesEspecificas}
   * Inclua pelo menos um exercício por treino focado especificamente nas habilidades da posição
   * Goleiros: trabalhe reflexos, explosão e membros superiores
   * Defensores: priorize força, resistência e jogo aéreo
   * Meio-campistas: foque em resistência, agilidade e coordenação
   * Atacantes: desenvolva velocidade, explosão e finalização

4. ESTRUTURA DO TREINO AVANÇADA:
   * Crie nomes de treinos ÚNICOS e CRIATIVOS que reflitam o objetivo e o foco
   * Varie COMPLETAMENTE os treinos - cada dia deve ser absolutamente único
   * Inclua progressão semanal científica baseada no perfil
   * Distribua os exercícios para utilizar EXATAMENTE ${request.sessionDuration} minutos
   * Estruture os treinos com progressão lógica (aquecimento → parte principal → finalização)
   * Inclua tempos de descanso precisos (30-90 segundos dependendo da intensidade)
   * Adapte a intensidade ao nível solicitado (${request.difficulty})
   * Inclua um elemento SURPRESA ou INOVADOR em cada treino
   * Use o ID da solicitação (${requestId}) como semente para garantir treinos únicos

5. EXPLICAÇÕES CIENTÍFICAS:
   * Para cada exercício, explique EXATAMENTE por que ele foi escolhido para este atleta
   * Detalhe os benefícios específicos para a posição e características físicas
   * Explique como o exercício contribui para os objetivos informados: ${goalsText}
   * Inclua dicas técnicas personalizadas baseadas no perfil do atleta

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

        // Função para verificar se os equipamentos solicitados estão sendo utilizados
        const validateEquipmentUsage = (planData: any, requestedEquipment: string[]) => {
          console.log('Validando uso de equipamentos:', requestedEquipment);
          
          if (!planData.exercises || planData.exercises.length === 0) {
            console.warn('Treino não contém exercícios!');
            return false;
          }
          
          // Verificar se o número de exercícios é suficiente (pelo menos 4)
          if (planData.exercises.length < 4) {
            console.warn(`Número insuficiente de exercícios: ${planData.exercises.length} (mínimo 4)`);
            return false;
          }
          
          // Verificar se há equipamentos específicos solicitados além de "Peso corporal"
          const specificEquipments = requestedEquipment.filter(eq => 
            eq.toLowerCase() !== 'peso corporal' && 
            eq.toLowerCase() !== 'body weight'
          );
          
          if (specificEquipments.length === 0) {
            console.log('Apenas peso corporal solicitado, validação ok');
            return true;
          }
          
          // Verificar se os exercícios mencionam os equipamentos
          const equipmentMentioned = requestedEquipment.map(eq => {
            const eqLower = eq.toLowerCase();
            
            // Encontrar exercícios que mencionam este equipamento
            const mentioningExercises = planData.exercises.filter((ex: any) => {
              const nameContains = ex.name?.toLowerCase().includes(eqLower);
              const descContains = ex.description?.toLowerCase().includes(eqLower);
              const weightContains = ex.weight?.toLowerCase().includes(eqLower);
              const notesContains = ex.notes?.toLowerCase().includes(eqLower);
              
              return nameContains || descContains || weightContains || notesContains;
            });
            
            return { 
              equipment: eq, 
              mentioned: mentioningExercises.length > 0,
              count: mentioningExercises.length,
              exercises: mentioningExercises.map((ex: any) => ex.name)
            };
          });
          
          console.log('Verificação detalhada de equipamentos:', 
            equipmentMentioned.map(e => `${e.equipment}: ${e.mentioned ? `${e.count} exercícios` : 'não usado'}`).join(', ')
          );
          
          // Verificar se todos os equipamentos específicos foram mencionados
          const allEquipmentUsed = specificEquipments.every(eq => {
            const eqInfo = equipmentMentioned.find(e => e.equipment.toLowerCase() === eq.toLowerCase());
            return eqInfo && eqInfo.mentioned;
          });
          
          // Verificar se há pelo menos 1-2 exercícios para cada equipamento específico
          const sufficientExercisesPerEquipment = specificEquipments.every(eq => {
            const eqInfo = equipmentMentioned.find(e => e.equipment.toLowerCase() === eq.toLowerCase());
            return eqInfo && eqInfo.count >= 1;
          });
          
          if (!allEquipmentUsed) {
            console.warn('Nem todos os equipamentos foram utilizados');
            const unusedEquipments = equipmentMentioned
              .filter(e => !e.mentioned && e.equipment.toLowerCase() !== 'peso corporal')
              .map(e => e.equipment)
              .join(', ');
            console.warn(`Equipamentos não utilizados: ${unusedEquipments}`);
            return false;
          }
          
          if (!sufficientExercisesPerEquipment) {
            console.warn('Alguns equipamentos têm menos de 1 exercício');
            const insufficientEquipments = equipmentMentioned
              .filter(e => e.count < 1 && e.equipment.toLowerCase() !== 'peso corporal')
              .map(e => `${e.equipment} (${e.count})`)
              .join(', ');
            console.warn(`Equipamentos com exercícios insuficientes: ${insufficientEquipments}`);
            return false;
          }
          
          console.log('✅ Todos os equipamentos estão sendo utilizados adequadamente');
          return true;
        };
        
        // Função para adicionar exercícios específicos para equipamentos não utilizados
        // e garantir que haja pelo menos 4-5 exercícios por treino
        const addMissingEquipmentExercises = (planData: any, requestedEquipment: string[]) => {
          console.log('Verificando equipamentos e número de exercícios');
          
          // Verificar quais equipamentos não foram utilizados
          const equipmentMentioned = requestedEquipment.map(eq => {
            const eqLower = eq.toLowerCase();
            const isMentioned = planData.exercises.some((ex: any) => {
              const nameContains = ex.name?.toLowerCase().includes(eqLower);
              const descContains = ex.description?.toLowerCase().includes(eqLower);
              const weightContains = ex.weight?.toLowerCase().includes(eqLower);
              const notesContains = ex.notes?.toLowerCase().includes(eqLower);
              
              return nameContains || descContains || weightContains || notesContains;
            });
            
            return { equipment: eq, mentioned: isMentioned };
          });
          
          const missingEquipment = equipmentMentioned
            .filter(eq => 
              eq.equipment.toLowerCase() !== 'peso corporal' && 
              eq.equipment.toLowerCase() !== 'body weight' && 
              !eq.mentioned
            )
            .map(eq => eq.equipment);
          
          // Verificar se já temos exercícios suficientes (4-5)
          const needMoreExercises = planData.exercises.length < 4;
          
          if (missingEquipment.length === 0 && !needMoreExercises) {
            return planData;
          }
          
          console.log('Equipamentos não utilizados:', missingEquipment);
          console.log(`Número atual de exercícios: ${planData.exercises.length}, mínimo desejado: 4`);
          
          // Adicionar exercícios para equipamentos não utilizados
          const exercisesForMissingEquipment: any[] = [];
          
          // Primeiro, adicionar exercícios para equipamentos não utilizados
          missingEquipment.forEach(equipment => {
            if (equipment.toLowerCase().includes('bicicleta')) {
              exercisesForMissingEquipment.push({
                name: `Ciclismo Intervalado com ${equipment}`,
                sets: 3,
                reps: "5 minutos",
                weight: equipment,
                rest_time: "60 segundos",
                notes: `Alternar entre alta e baixa intensidade na ${equipment}`,
                description: `Realize intervalos de alta intensidade (30 segundos) seguidos por recuperação ativa (90 segundos) na ${equipment}`,
                benefits: "Melhora da capacidade cardiovascular, resistência muscular e queima calórica",
                video_url: "https://www.youtube.com/watch?v=NCJj-vTLn_g",
                image_url: ""
              });
            } else if (equipment.toLowerCase().includes('elástico')) {
              exercisesForMissingEquipment.push({
                name: `Agachamento com ${equipment}`,
                sets: 3,
                reps: "15",
                weight: equipment,
                rest_time: "45 segundos",
                notes: `Use o ${equipment} posicionado logo acima dos joelhos`,
                description: `Posicione o ${equipment} logo acima dos joelhos e realize agachamentos, mantendo tensão constante no elástico`,
                benefits: "Fortalecimento de quadríceps, glúteos e estabilizadores do quadril",
                video_url: "https://www.youtube.com/watch?v=UH3k-EUZkS4",
                image_url: ""
              });
              
              // Adicionar um segundo exercício com elástico para variedade
              exercisesForMissingEquipment.push({
                name: `Remada com ${equipment}`,
                sets: 3,
                reps: "15",
                weight: equipment,
                rest_time: "45 segundos",
                notes: `Fixe o ${equipment} em um ponto estável na altura do peito`,
                description: `Em pé, segure as extremidades do ${equipment} com os braços estendidos e puxe em direção ao corpo, contraindo as escápulas`,
                benefits: "Fortalecimento dos músculos das costas, ombros e braços",
                video_url: "https://www.youtube.com/watch?v=xbAymhHRpxY",
                image_url: ""
              });
            } else if (equipment.toLowerCase().includes('halter')) {
              exercisesForMissingEquipment.push({
                name: `Rosca Alternada com ${equipment}`,
                sets: 3,
                reps: "12 (cada braço)",
                weight: equipment,
                rest_time: "45 segundos",
                notes: `Use ${equipment}es de peso adequado ao seu nível`,
                description: `Em pé, com os braços estendidos ao lado do corpo segurando os ${equipment}es, realize flexões de cotovelo alternando os braços`,
                benefits: "Desenvolvimento dos músculos do bíceps e antebraço",
                video_url: "https://www.youtube.com/watch?v=kwG2ipFRgfo",
                image_url: ""
              });
              
              // Adicionar um segundo exercício com halteres para variedade
              exercisesForMissingEquipment.push({
                name: `Elevação Lateral com ${equipment}`,
                sets: 3,
                reps: "12",
                weight: equipment,
                rest_time: "45 segundos",
                notes: `Use ${equipment}es de peso leve a moderado`,
                description: `Em pé, segure os ${equipment}es ao lado do corpo e eleve os braços lateralmente até a altura dos ombros`,
                benefits: "Fortalecimento dos músculos deltoides e estabilizadores do ombro",
                video_url: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
                image_url: ""
              });
            } else if (equipment.toLowerCase().includes('barra')) {
              exercisesForMissingEquipment.push({
                name: `Agachamento com ${equipment}`,
                sets: 3,
                reps: "12",
                weight: `${equipment} (peso leve)`,
                rest_time: "60 segundos",
                notes: `Posicione a ${equipment} confortavelmente nos ombros`,
                description: `Com a ${equipment} apoiada nos ombros, realize agachamentos mantendo a coluna ereta e descendo até formar um ângulo de 90° nos joelhos`,
                benefits: "Fortalecimento dos músculos das pernas, glúteos e core",
                video_url: "https://www.youtube.com/watch?v=ultWZbUMPL8",
                image_url: ""
              });
              
              // Adicionar um segundo exercício com barra para variedade
              exercisesForMissingEquipment.push({
                name: `Remada Curvada com ${equipment}`,
                sets: 3,
                reps: "12",
                weight: `${equipment} (peso moderado)`,
                rest_time: "60 segundos",
                notes: `Mantenha as costas retas e o core contraído durante todo o movimento`,
                description: `Com os joelhos levemente flexionados, incline o tronco para frente, segure a ${equipment} com as mãos e puxe em direção ao abdômen`,
                benefits: "Fortalecimento dos músculos das costas, ombros e braços",
                video_url: "https://www.youtube.com/watch?v=FWJR5Ve8bnQ",
                image_url: ""
              });
            }
          });
          
          // Adicionar exercícios adicionais se ainda não tivermos o mínimo de 4
          if (planData.exercises.length + exercisesForMissingEquipment.length < 4) {
            const currentCount = planData.exercises.length + exercisesForMissingEquipment.length;
            const neededExercises = 4 - currentCount;
            
            console.log(`Adicionando ${neededExercises} exercícios extras para atingir o mínimo de 4`);
            
            // Adicionar exercícios extras com os equipamentos disponíveis
            const availableEquipment = requestedEquipment.filter(eq => 
              eq.toLowerCase() !== 'peso corporal' && 
              eq.toLowerCase() !== 'body weight'
            );
            
            // Se não houver equipamentos específicos, usar peso corporal
            if (availableEquipment.length === 0) {
              // Adicionar exercícios com peso corporal
              const bodyWeightExercises = [
                {
                  name: "Prancha Abdominal",
                  sets: 3,
                  reps: "30 segundos",
                  weight: "Peso corporal",
                  rest_time: "30 segundos",
                  notes: "Mantenha o corpo alinhado e o core contraído",
                  description: "Apoie-se nos antebraços e nas pontas dos pés, mantendo o corpo em linha reta da cabeça aos calcanhares",
                  benefits: "Fortalecimento do core, estabilidade e resistência muscular",
                  video_url: "https://www.youtube.com/watch?v=ASdvN_XEl_c",
                  image_url: ""
                },
                {
                  name: "Afundo Alternado",
                  sets: 3,
                  reps: "10 (cada perna)",
                  weight: "Peso corporal",
                  rest_time: "45 segundos",
                  notes: "Mantenha o joelho da frente alinhado com o tornozelo",
                  description: "Dê um passo à frente com uma perna, flexionando ambos os joelhos até formar um ângulo de 90°, e retorne à posição inicial",
                  benefits: "Fortalecimento das pernas, glúteos e melhora do equilíbrio",
                  video_url: "https://www.youtube.com/watch?v=QF0BQS2W80k",
                  image_url: ""
                },
                {
                  name: "Mountain Climber",
                  sets: 3,
                  reps: "30 segundos",
                  weight: "Peso corporal",
                  rest_time: "30 segundos",
                  notes: "Mantenha um ritmo constante e o core contraído",
                  description: "Em posição de prancha, alterne os joelhos em direção ao peito de forma rápida e contínua",
                  benefits: "Trabalho cardiovascular, fortalecimento do core e resistência muscular",
                  video_url: "https://www.youtube.com/watch?v=nmwgirgXLYM",
                  image_url: ""
                }
              ];
              
              // Adicionar apenas o número necessário de exercícios
              for (let i = 0; i < neededExercises && i < bodyWeightExercises.length; i++) {
                exercisesForMissingEquipment.push(bodyWeightExercises[i]);
              }
            } else {
              // Usar um equipamento aleatório da lista disponível
              const randomEquipment = availableEquipment[Math.floor(Math.random() * availableEquipment.length)];
              
              if (randomEquipment.toLowerCase().includes('elástico')) {
                exercisesForMissingEquipment.push({
                  name: `Puxada Alta com ${randomEquipment}`,
                  sets: 3,
                  reps: "15",
                  weight: randomEquipment,
                  rest_time: "45 segundos",
                  notes: `Fixe o ${randomEquipment} em um ponto alto`,
                  description: `Em pé, segure as extremidades do ${randomEquipment} com os braços estendidos acima da cabeça e puxe para baixo, contraindo as costas`,
                  benefits: "Fortalecimento dos músculos das costas, ombros e braços",
                  video_url: "https://www.youtube.com/watch?v=lPj14v0nUTI",
                  image_url: ""
                });
              } else if (randomEquipment.toLowerCase().includes('halter')) {
                exercisesForMissingEquipment.push({
                  name: `Desenvolvimento com ${randomEquipment}`,
                  sets: 3,
                  reps: "12",
                  weight: randomEquipment,
                  rest_time: "45 segundos",
                  notes: `Use ${randomEquipment}es de peso adequado ao seu nível`,
                  description: `Sentado ou em pé, segure os ${randomEquipment}es na altura dos ombros e empurre-os para cima até estender completamente os braços`,
                  benefits: "Fortalecimento dos músculos dos ombros, tríceps e estabilizadores do core",
                  video_url: "https://www.youtube.com/watch?v=qEwKCR5JCog",
                  image_url: ""
                });
              }
            }
          }
          
          // Adicionar os novos exercícios ao plano
          planData.exercises = [...planData.exercises, ...exercisesForMissingEquipment];
          
          // Ajustar a descrição para mencionar os equipamentos adicionados
          if (missingEquipment.length > 0) {
            planData.description = `${planData.description} Inclui exercícios específicos com ${missingEquipment.join(', ')}.`;
          }
          
          // Adicionar informação sobre o número de exercícios
          if (needMoreExercises) {
            planData.description = `${planData.description} Treino completo com ${planData.exercises.length} exercícios variados.`;
          }
          
          console.log(`Treino final com ${planData.exercises.length} exercícios`);
          
          return planData;
        };
        
        // Processar cada dia do plano
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
            
            // Verificar se os equipamentos solicitados estão sendo utilizados
            const equipmentsValid = validateEquipmentUsage(planData, request.equipment);
            
            // Se não estiverem, adicionar exercícios específicos
            let processedPlanData = planData;
            if (!equipmentsValid) {
              console.log('Equipamentos não utilizados corretamente, adicionando exercícios específicos');
              processedPlanData = addMissingEquipmentExercises(planData, request.equipment);
            }
            
            // Criar treino base
            const baseTraining = {
              id: '', // Será gerado pelo banco
              user_id: '', // Será preenchido pelo hook useTrainings
              title: processedPlanData.title || `Treino de ${day}`,
              description: processedPlanData.description || '',
              day_of_week: mappedDay as any,
              exercises: processedPlanData.exercises || [],
              duration_minutes: processedPlanData.duration_minutes || 60,
              difficulty_level: processedPlanData.difficulty_level || 'intermediate',
              muscle_groups: processedPlanData.muscle_groups || [],
              is_ai_generated: true,
              training_rationale: processedPlanData.training_rationale || '',
              performance_benefits: processedPlanData.performance_benefits || '',
              adaptation_notes: processedPlanData.adaptation_notes || '',
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

  // Função para chamar a API de IA (OpenAI ou ChatGPT)
  const callOpenAI = async (prompt: string) => {
    // Verificar se deve usar ChatGPT ou OpenAI API
    const useChatGPT = import.meta.env.VITE_USE_CHATGPT === 'true';
    
    console.log(`Modo de geração de treinos: ${useChatGPT ? 'ChatGPT' : 'OpenAI API'}`);
    
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
      console.log('Chamando ChatGPT via API personalizada...');
      
      // URL da API personalizada que usa o ChatGPT
      const apiUrl = import.meta.env.VITE_CHATGPT_API_URL || 'https://api.ymsports.com.br/api/generate-training';
      
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
      console.error('Erro ao chamar API do ChatGPT:', error);
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
