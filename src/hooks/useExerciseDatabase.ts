import { useState, useMemo } from 'react';
import { exerciseDatabase, findExerciseByName, getExercisesByCategory, getExercisesByMuscleGroup, ExerciseExample } from '@/data/exercisesDatabase';
import { useExerciseAPI, ExerciseAPI } from './useExerciseAPI';

export const useExerciseDatabase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchExercisesByName, loading: apiLoading } = useExerciseAPI();

  // Função para buscar exercício na API da Ninjas
  const enrichExerciseWithAPI = async (exerciseName: string, originalExercise: any) => {
    try {
      const apiExercises = await fetchExercisesByName(exerciseName);
      
      if (apiExercises && apiExercises.length > 0) {
        const apiExercise = apiExercises[0]; // Pegar o primeiro resultado
        
        return {
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
      }
    } catch (error) {
      console.error('Erro ao buscar exercício na API:', error);
    }
    
    // Se não encontrar na API, usar função original
    return enrichExercise(exerciseName, originalExercise);
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
    const enrichedExercises = await Promise.all(
      training.exercises.map(async (exercise: any) => {
        try {
          // Tentar enriquecer com API primeiro
          return await enrichExerciseWithAPI(exercise.name, exercise);
        } catch (error) {
          console.error('Erro ao enriquecer exercício com API:', error);
          // Fallback para enriquecimento local
          return enrichExercise(exercise.name, exercise);
        }
      })
    );

    return {
      ...training,
      exercises: enrichedExercises
    };
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
