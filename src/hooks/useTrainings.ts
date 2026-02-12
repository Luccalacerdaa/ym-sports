import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // Pode ser "12-15" ou "30 segundos"
  weight?: string; // Peso opcional
  rest_time?: string; // Tempo de descanso
  notes?: string; // Observações
  video_url?: string; // Link do YouTube
  image_url?: string; // URL da imagem
  gif_url?: string; // URL do GIF
  description?: string; // Descrição detalhada
  benefits?: string; // Benefícios específicos
}

export interface Training {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  exercises: Exercise[];
  duration_minutes?: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  muscle_groups: string[];
  is_ai_generated: boolean;
  training_rationale?: string;
  performance_benefits?: string;
  adaptation_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useTrainings = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log quando trainings mudar
  useEffect(() => {
    console.log('useTrainings: trainings atualizado:', trainings);
  }, [trainings]);

  // Carregar treinos do usuário
  const fetchTrainings = async () => {
    if (!user) {
      console.log('useTrainings: Usuário não autenticado, limpando treinos');
      setTrainings([]);
      setLoading(false);
      return;
    }

    try {
      console.log('useTrainings: Iniciando busca de treinos...');
      setLoading(true);
      setError(null);

      console.log('Buscando treinos para usuário:', user.id);

      const { data, error: fetchError } = await supabase
        .from('trainings')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true });

      if (fetchError) {
        console.error('Erro ao buscar treinos:', fetchError);
        setError(fetchError.message);
      } else {
        console.log('Treinos encontrados:', data);
        setTrainings(data || []);
      }
    } catch (err) {
      setError('Erro ao carregar treinos');
      console.error('Erro ao carregar treinos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Criar novo treino
  const createTraining = async (trainingData: Omit<Training, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      const error = new Error('Usuário não autenticado');
      console.error('❌ createTraining: Usuário não autenticado');
      throw error;
    }

    try {
      setError(null);

      console.log('📝 createTraining: Iniciando criação de treino');
      console.log('📅 Dia:', trainingData.day_of_week);
      console.log('🏋️ Exercícios:', trainingData.exercises?.length || 0);

      // Validar dados obrigatórios
      if (!trainingData.day_of_week) {
        throw new Error('day_of_week é obrigatório');
      }
      
      if (!trainingData.exercises || trainingData.exercises.length === 0) {
        throw new Error('Treino deve ter pelo menos 1 exercício');
      }

      // Remover campos vazios e garantir tipos corretos
      const { user_id: _, id: __, created_at: ___, updated_at: ____, ...cleanTrainingData } = trainingData as any;
      
      const trainingToInsert = {
        user_id: user.id,
        ...cleanTrainingData,
        muscle_groups: Array.isArray(trainingData.muscle_groups) ? trainingData.muscle_groups : [],
        exercises: Array.isArray(trainingData.exercises) ? trainingData.exercises : []
      };

      console.log('💾 Dados para inserção no Supabase:', {
        user_id: trainingToInsert.user_id,
        day_of_week: trainingToInsert.day_of_week,
        title: trainingToInsert.title,
        exercises_count: trainingToInsert.exercises.length
      });

      const { data, error: createError } = await supabase
        .from('trainings')
        .insert(trainingToInsert)
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro do Supabase ao criar treino:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        });
        throw createError;
      }

      if (!data) {
        console.error('❌ Supabase não retornou dados após inserção');
        throw new Error('Treino não foi criado (sem dados retornados)');
      }

      console.log('✅ Treino criado com sucesso:', {
        id: data.id,
        day_of_week: data.day_of_week,
        title: data.title
      });

      setTrainings(prev => [...prev, data]);
      return { data, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar treino';
      console.error('❌ createTraining: Erro capturado:', errorMessage);
      console.error('Detalhes do erro:', err);
      setError(errorMessage);
      throw err; // Re-throw para Promise.allSettled capturar
    }
  };

  // Atualizar treino
  const updateTraining = async (trainingId: string, updates: Partial<Training>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('trainings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', trainingId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setTrainings(prev => prev.map(training => 
        training.id === trainingId ? data : training
      ));
      return { data, error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar treino';
      setError(errorMessage);
      return { data: null, error: err };
    }
  };

  // Deletar treino
  const deleteTraining = async (trainingId: string) => {
    if (!user) {
      const error = new Error('Usuário não autenticado');
      console.error('❌ deleteTraining: Usuário não autenticado');
      throw error;
    }

    if (!trainingId) {
      const error = new Error('ID do treino é obrigatório');
      console.error('❌ deleteTraining: ID não fornecido');
      throw error;
    }

    try {
      setError(null);
      
      // Buscar informações do treino antes de deletar (para log)
      const trainingToDelete = trainings.find(t => t.id === trainingId);
      
      console.log('🗑️ deleteTraining: Deletando treino', {
        id: trainingId,
        day: trainingToDelete?.day_of_week,
        title: trainingToDelete?.title
      });

      const { error: deleteError } = await supabase
        .from('trainings')
        .delete()
        .eq('id', trainingId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('❌ Erro do Supabase ao deletar treino:', {
          code: deleteError.code,
          message: deleteError.message,
          details: deleteError.details
        });
        throw deleteError;
      }

      console.log('✅ Treino deletado com sucesso:', trainingId);

      setTrainings(prev => prev.filter(training => training.id !== trainingId));
      return { error: null };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao deletar treino';
      console.error('❌ deleteTraining: Erro capturado:', errorMessage);
      setError(errorMessage);
      throw err; // Re-throw para Promise.allSettled capturar
    }
  };

  // Obter treino do dia
  const getTodaysTraining = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return trainings.find(training => training.day_of_week === today);
  };

  // Obter treinos da semana
  const getWeeklyTrainings = () => {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weeklyTrainings = daysOfWeek.map(day => ({
      day,
      training: trainings.find(training => training.day_of_week === day)
    }));
    console.log('getWeeklyTrainings:', weeklyTrainings);
    return weeklyTrainings;
  };

  // Carregar treinos quando o usuário mudar
  useEffect(() => {
    console.log('useTrainings: useEffect executado, user:', user);
    if (user) {
      fetchTrainings();
    }
  }, [user]);

  return {
    trainings,
    loading,
    error,
    fetchTrainings,
    createTraining,
    updateTraining,
    deleteTraining,
    getTodaysTraining,
    getWeeklyTrainings,
  };
};
