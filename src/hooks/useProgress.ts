import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import NotificationService from '@/services/notificationService';

export interface UserProgress {
  id: string;
  user_id: string;
  total_points: number;
  current_level: number;
  total_workouts_completed: number;
  total_exercises_completed: number;
  total_workout_minutes: number;
  longest_workout_streak: number;
  current_workout_streak: number;
  last_workout_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'workout' | 'streak' | 'level' | 'nutrition';
  requirement_type: 'points' | 'workouts' | 'streak' | 'level' | 'exercises' | 'workout_minutes';
  requirement_value: number;
  points_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  points_earned: number;
  created_at: string;
}

// Cache para getLevelProgress (evitar recálculos desnecessários)
const levelProgressCache = new Map<string, { progress: number; pointsToNext: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 segundos

export const useProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para calcular pontos necessários para o próximo nível
  const getPointsForNextLevel = async (currentLevel: number): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('level_thresholds')
        .select('points_required')
        .eq('level', currentLevel + 1)
        .single();
      
      if (error) throw error;
      return data?.points_required || (currentLevel * 100);
    } catch (err) {
      // Fallback para fórmula antiga se tabela não existir
      return currentLevel * 100;
    }
  };

  // Função para calcular nível baseado em pontos
  const getLevelFromPoints = async (totalPoints: number): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('level_thresholds')
        .select('level')
        .lte('points_required', totalPoints)
        .order('level', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      return data?.level || 1;
    } catch (err) {
      // Fallback para fórmula antiga se tabela não existir
      return Math.floor(totalPoints / 100) + 1;
    }
  };

  // Função para calcular progresso até o próximo nível
  const getLevelProgress = async (currentPoints: number, currentLevel: number): Promise<{ progress: number; pointsToNext: number }> => {
    // Verificar cache primeiro
    const cacheKey = `${currentPoints}-${currentLevel}`;
    const cached = levelProgressCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('✅ [getLevelProgress] Usando cache:', cacheKey);
      return { progress: cached.progress, pointsToNext: cached.pointsToNext };
    }
    
    console.log('🔍 [getLevelProgress] Calculando:', { currentPoints, currentLevel });
    
    try {
      // Primeiro, descobrir o nível CORRETO baseado nos pontos (não confiar no currentLevel)
      const { data: correctLevelData, error: correctLevelError } = await supabase
        .from('level_thresholds')
        .select('level, points_required')
        .lte('points_required', currentPoints)
        .order('level', { ascending: false })
        .limit(1);
      
      if (correctLevelError) throw correctLevelError;
      
      if (!correctLevelData || correctLevelData.length === 0) {
        console.warn('⚠️ [getLevelProgress] Nenhum nível encontrado, fallback');
        return { progress: 0, pointsToNext: 100 };
      }
      
      const actualLevel = correctLevelData[0].level;
      const actualLevelPoints = correctLevelData[0].points_required;
      
      console.log('✅ [getLevelProgress] Nível correto:', actualLevel, '(estava informado:', currentLevel, ')');
      
      // Agora buscar o PRÓXIMO nível
      const { data: nextLevelData, error: nextLevelError } = await supabase
        .from('level_thresholds')
        .select('level, points_required')
        .gt('level', actualLevel)
        .order('level', { ascending: true })
        .limit(1);
      
      if (nextLevelError) throw nextLevelError;
      
      if (!nextLevelData || nextLevelData.length === 0) {
        console.log('📊 [getLevelProgress] Nível máximo atingido');
        return { progress: 100, pointsToNext: 0 };
      }
      
      const nextLevelPoints = nextLevelData[0].points_required;
      const pointsInCurrentLevel = currentPoints - actualLevelPoints;
      const pointsNeeded = nextLevelPoints - actualLevelPoints;
      const pointsToNext = nextLevelPoints - currentPoints;
      const progress = (pointsInCurrentLevel / pointsNeeded) * 100;
      
      const result = { 
        progress: Math.min(Math.max(progress, 0), 100), 
        pointsToNext: Math.max(pointsToNext, 0) 
      };
      
      // Salvar no cache
      levelProgressCache.set(cacheKey, {
        progress: result.progress,
        pointsToNext: result.pointsToNext,
        timestamp: now
      });
      
      console.log('✅ [getLevelProgress] Resultado:', result);
      
      return result;
    } catch (err) {
      console.error('❌ [getLevelProgress] Erro:', err);
      // Fallback para fórmula antiga
      const fallbackLevel = Math.floor(currentPoints / 100) + 1;
      const fallbackCurrentPoints = (fallbackLevel - 1) * 100;
      const fallbackNextPoints = fallbackLevel * 100;
      const fallbackProgress = ((currentPoints - fallbackCurrentPoints) / 100) * 100;
      const fallbackPointsToNext = fallbackNextPoints - currentPoints;
      
      return { 
        progress: Math.min(Math.max(fallbackProgress, 0), 100), 
        pointsToNext: Math.max(fallbackPointsToNext, 0) 
      };
    }
  };

  // Buscar progresso do usuário
  const fetchProgress = async () => {
    if (!user) return;

    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setProgress(data);
      } else {
        // Criar progresso inicial se não existir
        await createInitialProgress();
      }
    } catch (err: any) {
      console.error('Erro ao buscar progresso:', err);
      setError(err.message);
    }
  };

  // Criar progresso inicial
  const createInitialProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          total_points: 0,
          current_level: 1,
          total_workouts_completed: 0,
          total_exercises_completed: 0,
          total_workout_minutes: 0,
          longest_workout_streak: 0,
          current_workout_streak: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setProgress(data);
    } catch (err: any) {
      console.error('Erro ao criar progresso inicial:', err);
      setError(err.message);
    }
  };

  // Buscar todas as conquistas disponíveis
  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (error) throw error;

      setAchievements(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar conquistas:', err);
      setError(err.message);
    }
  };

  // Buscar conquistas do usuário
  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;

      setUserAchievements(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar conquistas do usuário:', err);
      setError(err.message);
    }
  };

  // Buscar atividades recentes
  const fetchRecentActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRecentActivities(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar atividades recentes:', err);
      setError(err.message);
    }
  };

  // Calcular nível baseado em pontos (usando level_thresholds)
  const calculateLevel = async (totalPoints: number): Promise<number> => {
    try {
      const { data: thresholds, error } = await supabase
        .from('level_thresholds')
        .select('level, points_required')
        .lte('points_required', totalPoints)
        .order('level', { ascending: false })
        .limit(1);

      if (error) throw error;

      // Se encontrou um threshold, retornar o nível
      if (thresholds && thresholds.length > 0) {
        return thresholds[0].level;
      }

      // Fallback para fórmula antiga se não houver thresholds
      return Math.floor(totalPoints / 100) + 1;
    } catch (err) {
      console.error('Erro ao calcular nível:', err);
      // Fallback para fórmula antiga
      return Math.floor(totalPoints / 100) + 1;
    }
  };

  // Adicionar pontos
  const addPoints = async (points: number, activityType: string, activityData?: any) => {
    if (!user || !progress) return;

    try {
      const newTotalPoints = progress.total_points + points;
      const newLevel = await calculateLevel(newTotalPoints);
      const levelIncreased = newLevel > progress.current_level;

      // Atualizar progresso
      const { data: updatedProgress, error: progressError } = await supabase
        .from('user_progress')
        .update({
          total_points: newTotalPoints,
          current_level: newLevel,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (progressError) throw progressError;

      setProgress(updatedProgress);

      // Registrar atividade
      await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData,
          points_earned: points,
        });

      // Verificar conquistas
      await checkAchievements();

      // Recarregar atividades recentes
      await fetchRecentActivities();

      // Recalcular rankings se necessário (apenas a cada 10 pontos para otimizar)
      if (newTotalPoints % 10 === 0) {
        try {
          // Importar dinamicamente para evitar dependência circular
          const { calculateRankings } = await import('./useRanking');
          await calculateRankings();
        } catch (error) {
          console.log('Ranking não disponível ainda');
        }
      }

      return { levelIncreased, newLevel, points: pointsToAdd };
    } catch (err: any) {
      console.error('Erro ao adicionar pontos:', err);
      setError(err.message);
      return null;
    }
  };

  // Registrar treino completo
  const recordWorkoutCompletion = async (workoutData: {
    duration_minutes: number;
    exercises_count: number;
    difficulty_level: string;
    training_id: string;
  }) => {
    if (!user || !progress) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Verificar se já completou QUALQUER treino hoje (não apenas este treino específico)
      const { data: existingActivities, error: checkError } = await supabase
        .from('user_activities')
        .select('id')
        .eq('user_id', user.id)
        .eq('activity_type', 'workout_completed')
        .gte('created_at', `${today}T00:00:00`);

      if (checkError) throw checkError;

      if (existingActivities && existingActivities.length > 0) {
        throw new Error('Você já completou um treino hoje! Volte amanhã para ganhar mais pontos. 🔥');
      }

      const lastWorkoutDate = progress.last_workout_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Calcular nova sequência
      let newStreak = progress.current_workout_streak;
      if (!lastWorkoutDate || lastWorkoutDate === yesterdayStr) {
        newStreak += 1;
      } else if (lastWorkoutDate !== today) {
        newStreak = 1; // Reset streak se não treinou ontem
      }

      // Calcular pontos baseados na duração e dificuldade
      let basePoints = Math.floor(workoutData.duration_minutes / 5); // 1 ponto a cada 5 minutos
      
      // Multiplicador por dificuldade
      const difficultyMultiplier = {
        'beginner': 1,
        'intermediate': 1.5,
        'advanced': 2
      }[workoutData.difficulty_level] || 1;

      const totalPoints = Math.floor(basePoints * difficultyMultiplier);

      // Atualizar progresso
      const { data: updatedProgress, error: progressError } = await supabase
        .from('user_progress')
        .update({
          total_workouts_completed: progress.total_workouts_completed + 1,
          total_exercises_completed: progress.total_exercises_completed + workoutData.exercises_count,
          total_workout_minutes: progress.total_workout_minutes + workoutData.duration_minutes,
          current_workout_streak: newStreak,
          longest_workout_streak: Math.max(progress.longest_workout_streak, newStreak),
          last_workout_date: today,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (progressError) throw progressError;

      // Adicionar pontos
      const result = await addPoints(totalPoints, 'workout_completed', {
        duration_minutes: workoutData.duration_minutes,
        exercises_count: workoutData.exercises_count,
        difficulty_level: workoutData.difficulty_level,
      });

      setProgress(updatedProgress);

      // Enviar notificação se subiu de nível
      if (result?.levelUp) {
        await NotificationService.levelUp(user.id, result.newLevel);
      }

      return result;
    } catch (err: any) {
      console.error('Erro ao registrar treino:', err);
      setError(err.message);
      throw err; // ← Lançar erro para ser capturado no componente
    }
  };

  // Verificar conquistas
  const checkAchievements = async () => {
    if (!user || !progress) return;

    try {
      // Buscar conquistas que o usuário ainda não tem
      const { data: unlockedAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${userAchievements.map(ua => ua.achievement_id).join(',')})`);

      if (achievementsError) throw achievementsError;

      const newAchievements = [];

      for (const achievement of unlockedAchievements || []) {
        let shouldUnlock = false;

        switch (achievement.requirement_type) {
          case 'points':
            shouldUnlock = progress.total_points >= achievement.requirement_value;
            break;
          case 'workouts':
            shouldUnlock = progress.total_workouts_completed >= achievement.requirement_value;
            break;
          case 'streak':
            shouldUnlock = progress.current_workout_streak >= achievement.requirement_value;
            break;
          case 'level':
            shouldUnlock = progress.current_level >= achievement.requirement_value;
            break;
          case 'exercises':
            shouldUnlock = progress.total_exercises_completed >= achievement.requirement_value;
            break;
          case 'workout_minutes':
            shouldUnlock = progress.total_workout_minutes >= achievement.requirement_value;
            break;
        }

        if (shouldUnlock) {
          // Desbloquear conquista
          const { error: unlockError } = await supabase
            .from('user_achievements')
            .insert({
              user_id: user.id,
              achievement_id: achievement.id,
            });

          if (unlockError) throw unlockError;

          newAchievements.push(achievement);

          // Adicionar pontos da conquista se houver
          if (achievement.points_reward > 0) {
            await addPoints(achievement.points_reward, 'achievement_unlocked', {
              achievement_id: achievement.id,
              achievement_name: achievement.name,
            });
          }

          // Enviar notificação de conquista desbloqueada
          await NotificationService.achievement(user.id, achievement.name, achievement.description);
        }
      }

      // Recarregar conquistas do usuário se houver novas
      if (newAchievements.length > 0) {
        await fetchUserAchievements();
      }

      return newAchievements;
    } catch (err: any) {
      console.error('Erro ao verificar conquistas:', err);
      setError(err.message);
      return [];
    }
  };

  // Inicializar dados
  useEffect(() => {
    if (user) {
      const initializeData = async () => {
        setLoading(true);
        await Promise.all([
          fetchProgress(),
          fetchAchievements(),
          fetchUserAchievements(),
          fetchRecentActivities(),
        ]);
        setLoading(false);
      };

      initializeData();
    }
  }, [user]);

  return {
    progress,
    achievements,
    userAchievements,
    recentActivities,
    loading,
    error,
    addPoints,
    recordWorkoutCompletion,
    checkAchievements,
    getPointsForNextLevel,
    getLevelProgress,
    fetchProgress,
    fetchUserAchievements,
    fetchRecentActivities,
  };
};
