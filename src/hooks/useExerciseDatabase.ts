import { useState, useMemo } from 'react';
import { exerciseDatabase, findExerciseByName, getExercisesByCategory, getExercisesByMuscleGroup, ExerciseExample } from '@/data/exercisesDatabase';
import { useExerciseAPI, ExerciseAPI } from './useExerciseAPI';

export const useExerciseDatabase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { searchExercisesByName, loading: apiLoading } = useExerciseAPI();

  // Função para buscar exercício na base de dados local ou na API
  const enrichExerciseWithAPI = async (exerciseName: string, originalExercise: any) => {
    try {
      console.log(`🔍 Tentando enriquecer exercício: "${exerciseName}"`);
      console.log(`Exercício original:`, JSON.stringify(originalExercise));
      
      // Primeiro, tentar encontrar na base de dados local
      const localExercise = findExerciseByName(exerciseName);
      
      if (localExercise) {
        console.log(`✅ Exercício encontrado na base local: ${localExercise.name}`);
        
        const enrichedExercise = {
          ...originalExercise,
          name: localExercise.name,
          description: originalExercise.description || localExercise.description,
          benefits: originalExercise.benefits || localExercise.benefits,
          video_url: originalExercise.video_url || localExercise.video_url,
          image_url: originalExercise.image_url || localExercise.image_url,
          difficulty: originalExercise.difficulty || localExercise.difficulty,
          category: localExercise.category,
          muscle_groups: localExercise.muscle_groups,
          // Manter dados originais se existirem
          sets: originalExercise.sets,
          reps: originalExercise.reps,
          weight: originalExercise.weight,
          rest_time: originalExercise.rest_time,
          notes: originalExercise.notes,
        };
        
        console.log(`✅ Exercício enriquecido com base local:`, JSON.stringify(enrichedExercise));
        return enrichedExercise;
      }
      
      // Se não encontrou na base local, tentar API (se disponível)
      if (import.meta.env.VITE_API_NINJAS_KEY) {
        try {
          // Verificar se searchExercisesByName é uma função
          if (typeof searchExercisesByName !== 'function') {
            console.error('❌ ERRO: searchExercisesByName não é uma função!', typeof searchExercisesByName);
            throw new Error('searchExercisesByName não é uma função');
          }
          
          const apiExercises = await searchExercisesByName(exerciseName);
          console.log(`Resultado da API para "${exerciseName}":`, apiExercises);
          
          if (apiExercises && apiExercises.length > 0) {
            const apiExercise = apiExercises[0]; // Pegar o primeiro resultado
            console.log(`✅ Exercício encontrado na API: ${apiExercise.name}`);
            
            const enrichedExercise = {
              ...originalExercise,
              name: apiExercise.name,
              description: originalExercise.description || apiExercise.instructions,
              benefits: originalExercise.benefits || `Exercício de ${apiExercise.muscle} para ${apiExercise.type}`,
              video_url: originalExercise.video_url || '',
              image_url: originalExercise.image_url || '',
              difficulty: apiExercise.difficulty || originalExercise.difficulty || 'intermediate',
              category: mapAPITypeToCategory(apiExercise.type),
              muscle_groups: [apiExercise.muscle],
              equipment: apiExercise.equipment,
              type: apiExercise.type,
            };
            
            console.log(`✅ Exercício enriquecido com API:`, JSON.stringify(enrichedExercise));
            return enrichedExercise;
          }
        } catch (apiError) {
          console.error('❌ Erro ao buscar exercício na API:', apiError);
        }
      } else {
        console.log(`⚠️ Chave da API não configurada, pulando busca na API`);
      }
    } catch (error) {
      console.error('❌ Erro ao enriquecer exercício:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace disponível');
    }
    
    // Se não encontrar na API nem na base local, usar dados originais com enriquecimento mínimo
    console.log(`⚠️ Usando dados originais para "${exerciseName}" com enriquecimento mínimo`);
    return {
      ...originalExercise,
      name: originalExercise.name,
      description: originalExercise.description || 'Exercício personalizado',
      benefits: originalExercise.benefits || 'Benefícios específicos para o atleta',
      video_url: originalExercise.video_url || '',
      image_url: originalExercise.image_url || '',
      difficulty: originalExercise.difficulty || 'intermediate',
      category: 'strength',
      muscle_groups: originalExercise.muscle_groups || [],
    };
  };

  // Função para mapear tipos da API para categorias
  const mapAPITypeToCategory = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'strength': 'strength',
      'cardio': 'cardio',
      'flexibility': 'flexibility',
      'stretching': 'flexibility',
      'powerlifting': 'strength',
      'olympic_weightlifting': 'strength',
      'strongman': 'strength',
      'plyometrics': 'sports_specific',
      'calisthenics': 'strength',
    };
    
    return typeMap[type.toLowerCase()] || 'strength';
  };

  // Função para enriquecer exercício com dados da base
  const enrichExercise = (exerciseName: string, originalExercise: any) => {
    const databaseExercise = findExerciseByName(exerciseName);
    
    if (databaseExercise) {
      return {
        ...originalExercise,
        name: databaseExercise.name,
        description: originalExercise.description || databaseExercise.description,
        benefits: originalExercise.benefits || databaseExercise.benefits,
        video_url: originalExercise.video_url || databaseExercise.video_url,
        image_url: originalExercise.image_url || databaseExercise.image_url,
        difficulty: originalExercise.difficulty || databaseExercise.difficulty,
        category: databaseExercise.category,
        muscle_groups: databaseExercise.muscle_groups,
        // Manter dados originais se existirem
        sets: originalExercise.sets,
        reps: originalExercise.reps,
        weight: originalExercise.weight,
        rest_time: originalExercise.rest_time,
        notes: originalExercise.notes,
      };
    }
    
    // Se não encontrar na base, retornar o exercício original
    return {
      ...originalExercise,
      name: originalExercise.name,
      description: originalExercise.description || 'Exercício personalizado',
      benefits: originalExercise.benefits || 'Benefícios específicos para o atleta',
      video_url: originalExercise.video_url || '',
      image_url: originalExercise.image_url || '',
      difficulty: originalExercise.difficulty || 'intermediate',
      category: 'strength',
      muscle_groups: originalExercise.muscle_groups || [],
    };
  };

  // Função para enriquecer treino completo com API
  const enrichTrainingWithAPI = async (training: any) => {
    console.log(`🔍 Enriquecendo treino completo: "${training.title || 'Sem título'}"`);
    console.log(`Número de exercícios: ${training.exercises?.length || 0}`);
    
    if (!training.exercises || !Array.isArray(training.exercises)) {
      console.error('❌ Erro: exercises não é um array válido:', training.exercises);
      return training;
    }
    
    try {
      // Processar os exercícios sequencialmente em vez de em paralelo para evitar problemas
      const enrichedExercises = [];
      for (const exercise of training.exercises) {
        try {
          console.log(`Processando exercício: "${exercise.name}"`);
          // Tentar enriquecer com API primeiro
          const enriched = await enrichExerciseWithAPI(exercise.name, exercise);
          enrichedExercises.push(enriched);
        } catch (error) {
          console.error(`❌ Erro ao enriquecer exercício "${exercise.name}":`, error);
          // Fallback para enriquecimento local
          const localEnriched = enrichExercise(exercise.name, exercise);
          enrichedExercises.push(localEnriched);
        }
      }

      const result = {
        ...training,
        exercises: enrichedExercises
      };
      
      console.log(`✅ Treino enriquecido com sucesso: ${enrichedExercises.length} exercícios`);
      return result;
    } catch (error) {
      console.error('❌ Erro geral ao enriquecer treino:', error);
      // Em caso de erro, retornar o treino original
      return training;
    }
  };

  // Função para enriquecer treino completo (versão local)
  const enrichTraining = (training: any) => {
    return {
      ...training,
      exercises: training.exercises.map((exercise: any) => 
        enrichExercise(exercise.name, exercise)
      )
    };
  };

  // Buscar exercícios
  const searchExercises = useMemo(() => {
    if (!searchTerm) return exerciseDatabase;
    
    return exerciseDatabase.filter(exercise => 
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.aliases.some(alias => 
        alias.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      exercise.muscle_groups.some(mg => 
        mg.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  // Obter exercícios por categoria
  const getExercisesByCategoryName = (category: string) => {
    return getExercisesByCategory(category);
  };

  // Obter exercícios por grupo muscular
  const getExercisesByMuscleGroupName = (muscleGroup: string) => {
    return getExercisesByMuscleGroup(muscleGroup);
  };

  // Estatísticas da base de dados
  const stats = useMemo(() => {
    const categories = [...new Set(exerciseDatabase.map(ex => ex.category))];
    const muscleGroups = [...new Set(exerciseDatabase.flatMap(ex => ex.muscle_groups))];
    
    return {
      totalExercises: exerciseDatabase.length,
      categories: categories.length,
      muscleGroups: muscleGroups.length,
      exercisesWithVideos: exerciseDatabase.filter(ex => ex.video_url).length,
      exercisesWithImages: exerciseDatabase.filter(ex => ex.image_url).length,
    };
  }, []);

  return {
    exerciseDatabase,
    enrichExercise,
    enrichExerciseWithAPI,
    enrichTraining,
    enrichTrainingWithAPI,
    searchExercises,
    getExercisesByCategory: getExercisesByCategoryName,
    getExercisesByMuscleGroup: getExercisesByMuscleGroupName,
    stats,
    searchTerm,
    setSearchTerm,
    apiLoading,
  };
};
